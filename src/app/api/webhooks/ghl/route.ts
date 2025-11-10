import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

    // Create Supabase admin client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    const existingUser = users?.find(u => u.email === email)
    
    if (existingUser) {
      console.log('[GHL Webhook] User already exists:', email)
      
      // Update user metadata with GHL info
      await supabase.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          ghl_contact_id: payload.contactId,
          first_name: firstName || existingUser.user_metadata?.first_name,
          last_name: lastName || existingUser.user_metadata?.last_name,
        }
      })
      
      return NextResponse.json({ 
        message: 'User already exists, metadata updated',
        userId: existingUser.id 
      })
    }

    // Create new user with invite
    console.log('[GHL Webhook] Creating new user:', email)
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm email for recovery flow to work
      user_metadata: {
        ghl_contact_id: payload.contactId,
        first_name: firstName || '',
        last_name: lastName || '',
        source: 'ghl_webhook',
        created_via: 'diamond-portal-member-tag',
        needs_password_set: true
      }
    })

    if (createError) {
      console.error('[GHL Webhook] Error creating user:', createError)
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: createError.message 
      }, { status: 500 })
    }

    // Send password reset email via Supabase
    console.log('[GHL Webhook] Sending password reset email to:', email)
    
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'}/auth/confirm`
        })

    if (resetError) {
      console.error('[GHL Webhook] Error sending reset email:', resetError)
      return NextResponse.json({ 
        error: 'User created but password reset email failed',
        userId: newUser?.user?.id,
        details: resetError.message 
      }, { status: 500 })
    }
    
    // Also generate recovery link for logging/backup
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'}/auth/confirm`
      }
    })

    // TODO: Send the recovery link via email
    // For now, we'll return it in the response for GHL to use
    console.log('[GHL Webhook] Recovery link generated:', linkData.properties.action_link)

    // Create user profile in database
    if (newUser?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email: email,
          full_name: `${firstName || ''} ${lastName || ''}`.trim() || null,
          diamond_user_id: payload.contactId || null,
          role: 'user',
          metadata: {
            ghl_contact_id: payload.contactId,
            source: 'ghl_webhook',
            first_name: firstName || '',
            last_name: lastName || '',
            tag: payload.tag || 'diamond-portal-member'
          }
        }, {
          onConflict: 'id'
        })
      
      if (profileError) {
        console.error('[GHL Webhook] Error creating user profile:', profileError)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'User created and password reset email sent',
      userId: newUser?.user?.id,
      email,
      recoveryLink: linkData?.properties?.action_link || null // Optional, for logging
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
