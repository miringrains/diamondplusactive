import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'
import { getSupabaseCookieOptions } from '@/lib/supabase/cookie-config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next')
  
  // Always use production URL for redirects (prevents localhost issues)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'
  
  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_link', baseUrl))
  }
  
  console.log('[Auth Confirm] Processing token:', { tokenHash: tokenHash.substring(0, 20) + '...', type })
  
  // Get consistent cookie options
  const defaultCookieOptions = getSupabaseCookieOptions(request)
  
  // Handle all OTP types (magic link, recovery, email confirmation, etc.)
  // Always redirect to dashboard after successful verification
  const response = NextResponse.redirect(new URL(next || '/dashboard', baseUrl))
  
  // Create Supabase client with cookie handling
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Merge with our default options to ensure consistency
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
    return NextResponse.redirect(new URL('/login?error=invalid_token', baseUrl))
  }
  
  return response
}
