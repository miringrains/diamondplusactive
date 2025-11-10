import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    console.log('[Check User] Checking email:', email)
    
    // Use service role to check user metadata
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
    
    // Get all users with pagination (Supabase doesn't support email filter in listUsers)
    let page = 1
    let foundUser = null
    
    while (!foundUser) {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        page: page,
        perPage: 100
      })
      
      if (error) {
        console.error('[Check User] Error listing users:', error)
        return NextResponse.json(
          { exists: false, hasPassword: false },
          { status: 200 }
        )
      }
      
      if (!users || users.length === 0) break
      
      foundUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (foundUser) break
      
      page++
    }
    
    const user = foundUser
    
    if (!user) {
      console.log('[Check User] User not found:', email)
      return NextResponse.json(
        { exists: false, hasPassword: false },
        { status: 200 }
      )
    }
    
    // Check if user has password set
    const hasPassword = user.user_metadata?.has_password === true
    
    console.log('[Check User] User found:', {
      email: user.email,
      has_password: hasPassword,
      user_metadata: user.user_metadata
    })
    
    return NextResponse.json({ 
      exists: true,
      hasPassword
    })
    
  } catch (error) {
    console.error('[Check User] Unexpected error:', error)
    return NextResponse.json(
      { exists: false, hasPassword: false },
      { status: 200 }
    )
  }
}
