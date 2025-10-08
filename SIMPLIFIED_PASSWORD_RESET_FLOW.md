# Simplified Password Reset Flow

## How it works (as per Supabase PKCE standard):

1. **User requests reset** → `/forgot-password`
   - Calls `resetPasswordForEmail(email, { redirectTo: 'https://diamondplusportal.com/auth/callback' })`
   
2. **Supabase sends email** with link like:
   ```
   https://[project].supabase.co/auth/v1/verify?token=pkce_[code]&type=recovery&redirect_to=https://diamondplusportal.com/auth/callback
   ```

3. **User clicks link** → Supabase redirects to:
   ```
   https://diamondplusportal.com/auth/callback?code=[pkce-code]&type=recovery
   ```

4. **Callback route** (`/auth/callback`):
   - Exchanges code for recovery session
   - Sets session cookies
   - Redirects to `/reset-password`

5. **Reset password page** (`/reset-password`):
   - User already has recovery session from step 4
   - Shows password form
   - Calls `updateUser({ password })` 
   - Signs out and redirects to login

## Key Points:
- Supabase automatically adds `type=recovery` parameter
- Recovery sessions are limited - can only call `updateUser({ password })`
- No need for complex session checks - if callback succeeded, session exists
- No need for custom parameters in redirectTo URL

## What was removed:
- Complex detectSessionInUrl logic
- Custom flow/next parameters 
- Extensive session validation in reset-password page
- Profile fetching for recovery sessions
