# Password Reset Implementation Guide

## Overview
The password reset flow has been updated to use Supabase's PKCE flow with event-driven recovery mode. All password reset functionality is now handled within the login page using different form modes.

## Implementation Details

### Form Modes
1. **login** - Default login form with email and password fields
2. **recovery** - Email-only form for requesting password reset
3. **reset-password** - New password entry form (shown after clicking reset link)

### Key Features
- Event-driven detection of PASSWORD_RECOVERY state
- Seamless transitions between modes within the same page
- No separate reset-password page needed (redirects to login)
- Proper validation and error handling
- Success messages after password update

## Supabase Configuration Required

### 1. Update Email Templates
Go to Supabase Dashboard → Authentication → Email Templates → Reset Password

Update the template to use:
```html
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>You requested to reset your password. Click the link below to proceed:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link will expire in 1 hour.</p>
```

### 2. Update URL Configuration
Go to Supabase Dashboard → Settings → Authentication → URL Configuration

- **Site URL**: `https://diamondplusportal.com`
- **Redirect URLs**: Add `https://diamondplusportal.com/login`

## Testing the Flow

1. **Request Password Reset**
   - Go to https://diamondplusportal.com/login
   - Click "Forgot password?"
   - Enter your email address
   - Click "Send reset link"
   - Check for success message

2. **Reset Password**
   - Check your email for the reset link
   - Click the link (should redirect to /login with recovery tokens)
   - The form should automatically switch to password reset mode
   - Enter and confirm your new password (minimum 6 characters)
   - Click "Update password"

3. **Login with New Password**
   - After successful update, you'll be redirected to login
   - You should see a success message
   - Login with your email and new password

## Technical Flow

1. User clicks "Forgot password?" → `setMode('recovery')`
2. User submits email → `supabase.auth.resetPasswordForEmail()`
3. User clicks email link → redirected to `/login#access_token=...&type=recovery`
4. Login form detects recovery tokens → `supabase.auth.setSession()`
5. `onAuthStateChange` fires with `PASSWORD_RECOVERY` event → `setMode('reset-password')`
6. User submits new password → `supabase.auth.updateUser({ password })`
7. Success → `supabase.auth.signOut()` → redirect to login with success message

## Files Modified

- `/src/app/(auth)/login/login-form.tsx` - Updated with all three modes
- `/src/app/(auth)/reset-password/page.tsx` - Now redirects to login
- `/src/app/(auth)/reset-password/reset-password-form.tsx` - Deleted (no longer needed)

## Troubleshooting

### Recovery link not working
- Check that Site URL is correctly set in Supabase
- Verify the email template uses `{{ .ConfirmationURL }}`
- Check browser console for any errors when clicking the link

### Password not updating
- Ensure the recovery session is valid (check browser console)
- Verify password meets minimum requirements (6 characters)
- Check for any Supabase auth errors in the console

### Form not switching to reset mode
- Check that `onAuthStateChange` listener is working
- Verify the URL contains `type=recovery` after clicking email link
- Check browser console for auth state change events
