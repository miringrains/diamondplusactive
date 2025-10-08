# Diamond Plus Portal - Supabase Authentication Implementation Guide

## Overview
This guide documents the proper implementation of Supabase authentication in the Diamond Plus Portal, using the PKCE flow with OTP/token_hash verification for password resets.

## Environment Configuration

### Required Environment Variables
```bash
# In your .env file:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_ORIGIN=https://diamondplusportal.com
```

**Important**: Do not wrap values in quotes.

## Authentication Flow Architecture

### 1. Client-Side Supabase Client (`/src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false, // We handle URL detection server-side
        persistSession: true,
        autoRefreshToken: true
      }
    }
  )
}
```

### 2. Server-Side Supabase Client (`/src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true
      }
    }
  )
}
```

## Password Reset Flow

### 1. Forgot Password Page (`/forgot-password`)
- User enters email
- Sends reset email via `resetPasswordForEmail`
- Redirects to OTP verification endpoint

```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${ORIGIN}/auth/confirm?type=recovery&next=/reset-password`,
})
```

### 2. Email Template Configuration (Supabase Dashboard)
**Important**: Configure your Supabase email template to use:
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
  Reset Password
</a>
```

### 3. OTP Verification Route (`/auth/confirm`)
- Server route handler that verifies the OTP token
- Creates recovery session
- Redirects to reset-password page

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://diamondplusportal.com'
  const redirectTo = new URL(next, baseUrl)

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      return NextResponse.redirect(redirectTo)
    }
  }

  const errorUrl = new URL('/auth/auth-code-error', baseUrl)
  return NextResponse.redirect(errorUrl)
}
```

### 4. Reset Password Page (`/reset-password`)
- Validates recovery session
- Allows user to set new password
- Updates password via `updateUser`
- Signs out and redirects to login

```typescript
const { error } = await supabase.auth.updateUser({ password })
if (!error) {
  await supabase.auth.signOut()
  router.replace("/login?message=password_reset")
}
```

## Middleware Configuration

The middleware refreshes auth tokens and protects routes:

```typescript
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: This refreshes the auth token
  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes as needed
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth']
  
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

## Key Implementation Details

### 1. PKCE Flow
- All auth operations use PKCE (Proof Key for Code Exchange)
- More secure than implicit flow
- Requires server-side code exchange

### 2. Cookie-Based Sessions
- Uses `@supabase/ssr` for cookie-based auth
- Sessions persist across page refreshes
- Automatic token refresh

### 3. URL Handling
- Always use production domain for redirects
- Avoid localhost in production
- Use `NEXT_PUBLIC_APP_ORIGIN` for canonical URLs

### 4. Security Considerations
- Generic error messages to prevent email enumeration
- Server-side session validation
- Secure HttpOnly cookies

## Common Issues and Solutions

### Issue: Empty session despite valid cookies
**Solution**: Ensure environment variables are set correctly without quotes

### Issue: Redirect to localhost
**Solution**: Hard-code production domain in auth routes

### Issue: "Link expired" errors
**Solution**: Ensure email template uses correct token_hash format

### Issue: Session not persisting
**Solution**: Ensure middleware calls `getUser()` to refresh token

## Testing Checklist

1. ✅ Password reset email sends successfully
2. ✅ Reset link redirects to `/auth/confirm`
3. ✅ OTP verification succeeds
4. ✅ Recovery session established
5. ✅ New password can be set
6. ✅ User redirected to login after password update
7. ✅ Can login with new password

## Additional Routes

### OAuth/Magic Link Callback (`/auth/callback`)
Handles OAuth providers and magic link authentication:

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  
  if (code) {
    const supabase = createServerClient(...)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      return NextResponse.redirect(new URL(next, baseUrl))
    }
  }
  
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', baseUrl))
}
```

## Deployment Notes

1. Ensure all environment variables are set in production
2. Update Supabase project settings:
   - Site URL: `https://diamondplusportal.com`
   - Redirect URLs: Include all auth endpoints
3. Test the entire flow after deployment
4. Monitor auth logs in Supabase dashboard

---

This implementation provides a secure, production-ready authentication system using Supabase's recommended patterns for Next.js App Router.
