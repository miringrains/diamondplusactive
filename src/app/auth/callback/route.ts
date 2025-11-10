import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'
import { getSupabaseCookieOptions } from '@/lib/supabase/cookie-config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next')
  
  // Auto-detect base URL from request (works on any deployment)
  const requestUrl = new URL(request.url)
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
  
  // Disable PKCE recovery flow - only OTP (token_hash) is supported
  if (type === 'recovery') {
    console.warn('[Auth Callback] Recovery flow should use /auth/confirm with token_hash, not callback')
    return NextResponse.redirect(new URL('/forgot-password?error=use_reset_link', baseUrl))
  }
  
  // Handle OTP flow with token_hash (magic links sometimes use this format)
  if (tokenHash && type) {
    console.log('[Auth Callback] Processing OTP token:', { tokenHash: tokenHash.substring(0, 20) + '...', type })
    
    const defaultCookieOptions = getSupabaseCookieOptions(request)
    const response = NextResponse.redirect(new URL(next || '/dashboard', baseUrl))
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              const mergedOptions = {
                ...defaultCookieOptions,
                ...options,
              }
              response.cookies.set(name, value, mergedOptions)
            })
          }
        }
      }
    )
    
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any
    })
    
    if (error) {
      console.error('[Auth Callback] OTP verification failed:', error.message)
      return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl))
    }
    
    return response
  }
  
  // Handle PKCE flow with code exchange (for normal login)
  if (code) {
    try {
      const supabase = await createSupabaseServerClient()
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Redirect to dashboard or next URL
        return NextResponse.redirect(new URL(next || '/dashboard', baseUrl))
      }
      
      console.error('[Auth Callback] Code exchange failed:', error.message)
      // If exchange failed, redirect to login with error
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', baseUrl))
    } catch (error: any) {
      console.error('[Auth Callback] Code exchange error:', error.message)
      return NextResponse.redirect(new URL('/login?error=auth_callback_error', baseUrl))
    }
  }
  
  // No valid parameters found
  console.warn('[Auth Callback] No valid code or token_hash found in callback URL')
  return NextResponse.redirect(new URL('/login?error=invalid_callback', baseUrl))
}