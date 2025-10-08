# Diamond Plus Auth Flow Debug Guide

## The Issue

When a user is already logged in and clicks "reset password", they get redirected to login instead of the reset password page. This happens because:

1. User has an existing normal session
2. They request a password reset
3. The reset link creates a "recovery session" (limited scope)
4. But our app detects the existing normal session instead
5. User gets redirected to login

## How Supabase Recovery Sessions Work

When you call `resetPasswordForEmail`, Supabase sends a link with either:
- `?code=xxx&type=recovery` (modern PKCE flow)
- `#access_token=xxx&type=recovery` (legacy hash flow)

Recovery sessions are special:
- They have `amr` (Authentication Methods Reference) containing `{ method: 'recovery' }`
- They have limited scope - can only call `updateUser` to change password
- They cannot access protected resources like the `profiles` table
- They should be used ONLY for password reset

## Test Flow

1. Visit `/test-auth-flow`
2. Click "Check Server Session" - should show no session
3. Click "Login (Normal)" - creates a normal session
4. Click "Check Server Session" - shows normal session with no recovery AMR
5. Click "Send Reset Email" - sends recovery email
6. Check email and click the reset link
7. The `/auth/confirm` route should:
   - Detect `type=recovery`
   - Pass the code to `/reset-password?code=xxx`
8. The `/reset-password` page should:
   - Exchange the code for a recovery session
   - Check if it's a recovery session (AMR contains recovery)
   - If not, clear the session and show error
   - If yes, enable the password form

## Common Issues

### Issue: "This link is for password reset only"
- Cause: You have a normal session active when clicking reset link
- Fix: The app now detects this and clears the normal session

### Issue: "Invalid or expired reset link"
- Cause: The reset link has expired or been used
- Fix: Request a new reset link

### Issue: Form stays disabled
- Cause: Session exchange failed
- Fix: Check browser console for errors

## Testing Commands

```bash
# Check logs
pm2 logs dp-core --lines 100

# Test recovery link structure
curl https://diamondplusportal.com/api/auth/debug-session \
  -H "Content-Type: application/json" \
  -d '{"action":"test-recovery-link","email":"test@example.com"}'

# Check current session
curl https://diamondplusportal.com/api/auth/debug-session \
  -H "Content-Type: application/json" \
  -d '{"action":"check-session"}'
```

## Environment Variables

Make sure these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (should be https://diamondplusportal.com in production)

