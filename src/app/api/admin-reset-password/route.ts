import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This uses the service role key to bypass all auth checks
export async function POST(request: NextRequest) {
  try {
    const { email, password, token } = await request.json()
    
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }
    
    // Verify the token matches what we expect (simple validation)
    const expectedToken = Buffer.from(`${email}:recovery`).toString('base64')
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Admin Reset] SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
      return NextResponse.json(
        { 
          error: 'Server configuration error. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. You can find this in your Supabase project settings under API > Service role key.' 
        },
        { status: 500 }
      )
    }
    
    console.log('[Admin Reset] Service role key found, length:', process.env.SUPABASE_SERVICE_ROLE_KEY.length)
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Fetch the user by email
    console.log('[Admin Reset] Looking up user by email:', email)
    
    // Fetch users and filter manually since the filter parameter doesn't work reliably
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // Get enough users to find the one we need
    })
    
    if (listError) {
      console.error('[Admin Reset] Failed to list users:', listError)
      return NextResponse.json(
        { error: 'Failed to find user' },
        { status: 500 }
      )
    }
    
    // Find the user with matching email
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      console.error('[Admin Reset] No user found with email:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    console.log('[Admin Reset] Found user:', user.id, user.email)
    
    // Update the user's password using admin API
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        password,
        user_metadata: {
          ...user.user_metadata,
          needs_password_set: false,
          has_password: true
        }
      }
    )
    
    if (updateError) {
      console.error('[Admin Reset] Update error:', updateError)
      console.error('[Admin Reset] Error details:', {
        message: updateError.message,
        status: updateError.status,
        code: updateError.code,
        name: updateError.name
      })
      return NextResponse.json(
        { error: updateError.message || 'Failed to update password' },
        { status: 500 }
      )
    }
    
    console.log('[Admin Reset] Update successful:', updateData?.user?.id)
    
    console.log('[Admin Reset] Password updated successfully for:', email)
    
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
    
  } catch (error) {
    console.error('[Admin Reset] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
