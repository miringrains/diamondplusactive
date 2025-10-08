import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/database.types'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Always prepare a response for cookie handling
  const res = NextResponse.next()
  
  // 2) PUBLIC routes that don't need auth check
  const publicRoutes = [
    '/login', '/register', '/forgot-password',
    '/auth',               // covers /auth/confirm or any callback
    '/api/supabase-login'
  ]
  
  // Skip static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/)
  ) {
    return res
  }
  
  // For reset-password, refresh session but don't check auth
  if (pathname === '/reset-password') {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        }
      }
    )
    // Just refresh - don't check if user exists
    await supabase.auth.getUser()
    return res
  }
  
  // Regular public routes - no auth needed
  if (publicRoutes.some(p => pathname.startsWith(p))) {
    return res
  }

  // 3) For protected routes, use the same response and bind cookie writes to it
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
      }
    }
  )

  // 4) Authorize protected routes
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_ORIGIN || req.url))

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$).*)'],
}