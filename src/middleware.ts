import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'
import { getSupabaseCookieOptions } from '@/lib/supabase/cookie-config'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Always prepare a response for cookie handling
  const res = NextResponse.next()
  
    // 2) PUBLIC routes that don't need auth check
    const publicRoutes = [
      '/login', '/register', '/forgot-password', '/set-password',
      '/auth',               // covers /auth/callback and /auth/confirm
      '/api/supabase-login',
      '/api/auth/check-user', // Check if user has password
      '/api/debug-update-password', // Debug route for password update
      '/api/admin-reset-password', // Admin route to bypass all auth
      '/api/webhooks/ghl-set-password', // GHL webhook for new user password setup
      '/api/business-audit/test-email' // Test email endpoint
    ]
  
  // Skip static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|mp4|webm|ogg)$/)
  ) {
    return res
  }
  
  // Get consistent cookie options
  const defaultCookieOptions = getSupabaseCookieOptions(req)
  
  // Create Supabase client with consistent cookie handling
  const createSupabaseClient = () => {
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => {
            // Merge with our default options to ensure consistency
            const mergedOptions = {
              ...defaultCookieOptions,
              ...options,
            }
            res.cookies.set(name, value, mergedOptions)
          })
        }
      }
    )
  }
  
  
  // Regular public routes - no auth needed
  if (publicRoutes.some(p => pathname.startsWith(p))) {
    return res
  }

  // 3) For protected routes, use the same response and bind cookie writes to it
  const supabase = createSupabaseClient()

  // 4) Authorize protected routes
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || req.url))

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)'],
}