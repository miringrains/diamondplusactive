import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'
import { getSupabaseCookieOptions } from '@/lib/supabase/cookie-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }
    
    const { email, password, redirectTo = '/dashboard' } = JSON.parse(body)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create response first
    const response = NextResponse.json(
      { success: true, redirectTo },
      { status: 200 }
    )
    
    // Get consistent cookie options
    const defaultCookieOptions = getSupabaseCookieOptions(request)
    
    // Clear any old PKCE or auth cookies that might interfere
    const existingCookies = request.cookies.getAll()
    existingCookies.forEach(cookie => {
      if (cookie.name.includes('sb-') && cookie.name.includes('auth')) {
        response.cookies.delete(cookie.name)
      }
    })
    
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Merge with our default options to ensure consistency
              const mergedOptions = {
                ...defaultCookieOptions,
                ...options,
              }
              response.cookies.set(name, value, mergedOptions as any)
            })
          },
        },
      }
    )

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return the response with cookies set
    return response
  } catch (error: any) {
    console.error('[Supabase Login] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}