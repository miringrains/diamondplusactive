import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/database.types'

// This route handles PKCE codes from password reset emails
// Supabase is generating PKCE codes instead of OTP tokens
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/reset-password'
  
  console.log('[callback] Processing PKCE code:', { 
    has_code: !!code,
    code_prefix: code?.substring(0, 10),
    next 
  })
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://diamondplusportal.com'
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', baseUrl))
  }
  
  const cookieStore = await cookies()
  
  // Create Supabase client with cookie handling
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
  
  // Exchange the PKCE code for a session
  console.log('[callback] Exchanging PKCE code for session...')
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('[callback] Failed to exchange code:', error)
    return NextResponse.redirect(new URL('/login?error=invalid_recovery_link', baseUrl))
  }
  
  console.log('[callback] Code exchanged successfully, user:', data.user?.email)
  
  // For password reset flow, always redirect to reset-password
  if (next === '/reset-password') {
    return NextResponse.redirect(new URL('/reset-password', baseUrl))
  }
  
  return NextResponse.redirect(new URL(next, baseUrl))
}
