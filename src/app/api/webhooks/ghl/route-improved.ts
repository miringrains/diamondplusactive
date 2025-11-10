import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ghlService } from '@/lib/gohighlevel'
import { env } from '@/lib/env'
import { verifyGHLWebhook } from '@/lib/ghl-webhook-verify'

// GHL sends webhooks when tags are added/removed
interface GHLWebhookPayload {
  type: string // 'ContactTagCreate' or 'ContactTagDelete'
  locationId: string
  contactId: string
  id: string // tag ID
  name: string // tag name
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
}

const DIAMOND_PORTAL_TAG = 'diamond-portal-member'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook is from GHL (you should implement signature verification)
    const payload: GHLWebhookPayload = await request.json()
    
    console.log('[GHL Webhook] Received:', {
      type: payload.type,
      tag: payload.name,
      contactId: payload.contactId,
      email: payload.email
    })

    // Only process if it's a tag creation for our specific tag
    if (payload.type !== 'ContactTagCreate' || payload.name !== DIAMOND_PORTAL_TAG) {
      return NextResponse.json({ 
        message: 'Webhook received but not processing',
        reason: `Type: ${payload.type}, Tag: ${payload.name}`
      })
    }

    // Get contact details from GHL if email not provided
    let email = payload.email
    let firstName = payload.firstName
    let lastName = payload.lastName
    
    if (!email && payload.contactId) {
      console.log('[GHL Webhook] Fetching contact details for:', payload.contactId)
      
      // Search for contact by ID (GHL doesn't have direct GET by ID, so we search)
      const contacts = await ghlService.searchContactByEmail(payload.contactId)
      if (!contacts) {
        return NextResponse.json({ 
          error: 'Contact not found in GHL' 
        }, { status: 404 })
      }
      
      email = contacts.email
      firstName = contacts.firstName
      lastName = contacts.lastName
    }

    if (!email) {
      return NextResponse.json({ 
        error: 'No email found for contact' 
      }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key for user management
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    )

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)
    
    if (existingUser?.user) {
      console.log('[GHL Webhook] User already exists:', email)
      
      // Update user metadata with GHL info
      await supabase.auth.admin.updateUserById(existingUser.user.id, {
        user_metadata: {
          ...existingUser.user.user_metadata,
          ghl_contact_id: payload.contactId,
          first_name: firstName || existingUser.user.user_metadata?.first_name,
          last_name: lastName || existingUser.user.user_metadata?.last_name,
        }
      })
      
      return NextResponse.json({ 
        message: 'User already exists, metadata updated',
        userId: existingUser.user.id 
      })
    }

    // Create new user - IMPROVED VERSION
    console.log('[GHL Webhook] Creating new user:', email)
    
    // Generate a random temporary password (user will need to reset it)
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword, // Set a temporary password
      email_confirm: true, // Auto-confirm the email since we trust GHL
      user_metadata: {
        ghl_contact_id: payload.contactId,
        first_name: firstName || '',
        last_name: lastName || '',
        source: 'ghl_webhook',
        created_via: 'diamond-portal-member-tag',
        needs_password_reset: true // Flag to force password reset on first login
      }
    })

    if (createError) {
      console.error('[GHL Webhook] Error creating user:', createError)
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: createError.message 
      }, { status: 500 })
    }

    // Send password reset email instead of invite
    console.log('[GHL Webhook] Sending password reset email to:', email)
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'}/dashboard`
    })

    if (resetError) {
      console.error('[GHL Webhook] Error sending password reset:', resetError)
      return NextResponse.json({ 
        error: 'User created but password reset email failed',
        userId: newUser?.user?.id,
        details: resetError.message 
      }, { status: 500 })
    }

    // Create user profile in database
    if (newUser?.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: newUser.user.id,
          email: email,
          first_name: firstName || '',
          last_name: lastName || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('[GHL Webhook] Error creating user profile:', profileError)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'User created and password reset email sent',
      userId: newUser?.user?.id,
      email 
    })

  } catch (error) {
    console.error('[GHL Webhook] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Optional: Handle webhook verification
export async function GET(request: NextRequest) {
  // GHL might send a verification request
  const challenge = request.nextUrl.searchParams.get('challenge')
  if (challenge) {
    return new Response(challenge, { status: 200 })
  }
  
  return NextResponse.json({ 
    message: 'GoHighLevel webhook endpoint',
    status: 'active' 
  })
}

