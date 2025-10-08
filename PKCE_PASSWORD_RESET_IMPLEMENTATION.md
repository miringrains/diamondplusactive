# PKCE Password Reset Implementation

## Overview
This document describes the clean Supabase password reset flow using ConfirmationURL + PKCE, with all legacy/implicit/hash paths removed.

## Project Invariants
- Canonical origin: `https://diamondplusportal.com` (no www)
- Supabase "Site URL" must equal canonical origin
- All reset links redirect to: `${origin}/auth/callback?flow=recovery&next=/reset-password`
- Browser client: `getSupabaseBrowserClient()` from `@/lib/supabase/client`
- Server client: `createSupabaseServerClient()` from `@/lib/supabase/server`
- NO hardcoded fallback URLs or keys - environment variables are required

## Routes and Files

### 1. `/forgot-password` - Request Password Reset
- Client component that shows email-only form
- Calls `supabase.auth.resetPasswordForEmail()` with redirectTo
- Shows neutral notice to prevent email enumeration
- Links back to `/login`

### 2. `/reset-password` - Set New Password
- Client component that validates session on mount
- Shows new password and confirm password fields
- Calls `supabase.auth.updateUser({ password })` 
- Signs out and redirects to login on success
- Shows generic error for expired/invalid links

### 3. `/auth/callback` - PKCE Callback Handler
- Server route that handles Supabase redirects
- Checks for valid user session
- Routes recovery flow to `/reset-password`
- Routes other flows to dashboard or specified next URL

### 4. `/login` - Cleaned Login Form
- Removed all hash fragment parsing
- Removed `onAuthStateChange` listeners
- Removed recovery/reset modes
- Added "Forgot password?" link to `/forgot-password`
- Shows success message when `?message=password_reset`

## Deleted Legacy Code
- `/set-password` directory and all files
- `/debug-invite` directory and all files  
- `/auth/reset/[token]` route
- All references to:
  - `PASSWORD_RECOVERY` event
  - `exchangeCodeForSession()`
  - `setSession()` with tokens
  - `type=invite` and `type=recovery`
  - Hash fragment parsing (#access_token, #refresh_token)
  - `onAuthStateChange()` for recovery detection

## Email Template Configuration
In Supabase Dashboard → Authentication → Email Templates → Reset Password:

```html
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>You requested to reset your password. Click the link below to proceed:</p>
<p><a href="{{ .ConfirmationURL }}?flow=recovery&next=/reset-password">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link will expire in 1 hour.</p>
```

## Supabase Settings
- Site URL: `https://diamondplusportal.com`
- Redirect URLs: Include `https://diamondplusportal.com/auth/callback`

## Security Improvements
1. Environment variables are required - no fallback values
2. Email enumeration prevention in forgot-password
3. Generic error messages for expired/invalid links
4. Clean separation of concerns - each route has one responsibility
5. No client-side token handling or session manipulation

## Testing Flow
1. Go to `/forgot-password`
2. Enter email and submit
3. Check email for reset link
4. Click link → redirected to `/auth/callback` → redirected to `/reset-password`
5. Enter new password and confirm
6. Submit → signed out → redirected to `/login?message=password_reset`
7. Login with new password

## Acceptance Criteria
- ✅ No hash fragment parsing anywhere
- ✅ No `onAuthStateChange` for recovery
- ✅ No client-side session manipulation
- ✅ Clean PKCE flow through callback
- ✅ Neutral notices prevent email enumeration
- ✅ Expired links show generic error
- ✅ Success message on login after reset
