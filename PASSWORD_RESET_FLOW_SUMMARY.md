# Password Reset Flow - Implementation Summary

## Overview
We've updated the password reset flow to use Supabase's OTP (One-Time Password) verification method with token_hash, following the official PKCE documentation.

## Key Components

### 1. Email Template (User needs to update in Supabase Dashboard)
The reset password email template should contain:
```html
<h2>Reset Your Password</h2>
<p>We received a request to reset your password. Click the link below to create a new password:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">
    Reset Password
  </a>
</p>
<p>This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
```

### 2. Flow Architecture

#### Step 1: Request Password Reset
- User visits `/forgot-password`
- Enters email address
- Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/confirm?type=recovery&next=/reset-password' })`

#### Step 2: Email Verification
- User clicks link in email
- Link goes to `/auth/confirm?token_hash=XXX&type=recovery&next=/reset-password`
- `/auth/confirm` route verifies the OTP using `supabase.auth.verifyOtp({ type, token_hash })`
- Creates a recovery session
- Redirects to `/reset-password`

#### Step 3: Password Update
- `/reset-password` page checks for valid session
- User enters new password
- Calls `supabase.auth.updateUser({ password })`
- Signs out user
- Redirects to login with success message

## Files Modified

### `/src/app/(auth)/forgot-password/page.tsx`
- Updated redirect URL to use `/auth/confirm` endpoint
- Added documentation about email template configuration
- Uses OTP verification flow

### `/src/app/auth/confirm/route.ts`
- Handles OTP verification with `token_hash`
- Verifies the token and creates a session
- Redirects to appropriate page based on `next` parameter

### `/src/app/(auth)/reset-password/page.tsx`
- Simplified to only check for existing session
- No longer handles code exchange (done by `/auth/confirm`)
- Shows password update form for valid recovery sessions

### `/src/app/auth/callback/route.ts`
- Now only handles OAuth and magic link callbacks
- Password reset uses `/auth/confirm` instead
- Added clarifying comments

### `/src/lib/supabase/client.ts`
- Set `detectSessionInUrl: false` since we use server-side OTP verification
- No need for client-side URL detection

### `/src/components/providers.tsx`
- Removed `PASSWORD_RECOVERY` event listener
- OTP flow doesn't use this event

### `/src/middleware.ts`
- Updated to follow Supabase's official cookie handling pattern
- Properly refreshes auth tokens with `auth.getUser()`
- Critical for maintaining sessions

## Configuration Requirements

### Supabase Dashboard Settings
1. **Site URL**: `https://diamondplusportal.com`
2. **Redirect URLs**: Must include `https://diamondplusportal.com/auth/confirm`
3. **Email Template**: Must use the format shown above with `token_hash`

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://birthcsvtmayyxrzzyhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_ORIGIN=https://diamondplusportal.com
```

## Testing the Flow

1. Go to https://diamondplusportal.com/forgot-password
2. Enter your email address
3. Check email for reset link
4. Click the link (should go to `/auth/confirm` then redirect to `/reset-password`)
5. Enter new password
6. Should redirect to login with success message

## Important Notes

- This uses the OTP/token_hash approach, not the newer code exchange
- Recovery sessions have limited scope (can only update password)
- Links expire after 1 hour
- The middleware ensures tokens are refreshed on every request
- All auth operations happen server-side for security
