# PKCE Password Reset Flow Implementation

## Overview
This implementation uses Supabase's PKCE flow for secure password resets. Recovery sessions are special limited sessions that only allow password updates.

## Flow Steps

### 1. User Requests Password Reset (`/forgot-password`)
- User enters email
- App calls: `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/callback?flow=recovery&next=/reset-password' })`
- Shows generic message to prevent email enumeration

### 2. Email Link
- Supabase sends email with link: `https://[project].supabase.co/auth/v1/verify?token=pkce_[code]&type=recovery&redirect_to=[our-callback-url]`
- When clicked, Supabase redirects to: `https://diamondplusportal.com/auth/callback?code=[pkce-code]&flow=recovery&next=/reset-password`

### 3. Server Callback Route (`/auth/callback/route.ts`)
- **Critical**: Must be a server route, not a client component
- Exchanges PKCE code for recovery session using `exchangeCodeForSession(code)`
- Sets session cookies on the response object
- Redirects to `/reset-password` with cookies

### 4. Reset Password Page (`/reset-password/page.tsx`)
- Checks for recovery session with `getSession()` 
- **Important**: Recovery sessions are limited - don't validate user object
- Shows password reset form
- Calls `updateUser({ password })` to update password
- Signs out and redirects to login

## Key Implementation Details

### Recovery Sessions
- Recovery sessions are NOT regular sessions
- They have limited permissions - ONLY allow password updates
- Don't try to call `getUser()` or validate user data
- Just check that a session exists

### Cookie Handling
The callback route must properly set cookies on the response:
```typescript
const response = NextResponse.redirect(redirectUrl)
const supabase = createServerClient(url, key, {
  cookies: {
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
    }
  }
})
```

### Environment Configuration
- Supabase Email Template must use: `{{ .ConfirmationURL }}`
- Site URL in Supabase: `https://diamondplusportal.com`
- Redirect URLs must include: `https://diamondplusportal.com/auth/callback`

## Common Issues
1. **Blank reset page**: Recovery session not properly set - check callback cookie handling
2. **localhost redirects**: Hard-code production URL in callback route
3. **Session validation fails**: Don't validate user in recovery sessions
4. **Code exchange timeout**: Callback must be server route, not client component
