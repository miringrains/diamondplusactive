# Edge Function: Simple Password Setup for New Users

Instead of dealing with the complexity of `generateLink` and implicit flows, let's use Supabase's standard password reset flow that your app already handles perfectly.

## The Approach

1. Create the user with `admin.createUser()`
2. Trigger a password reset email with `auth.resetPasswordForEmail()`
3. User receives email → clicks link → sets password on your existing `/reset-password` page

## Complete Edge Function Code

```typescript
// ghl-invite-user/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

interface WebhookPayload {
  email: string
  first_name: string
  last_name: string
  phone: string
  source: string
  referrer?: string
  tags?: string[]
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    console.log('Received GHL webhook payload:', JSON.stringify(payload, null, 2))

    // Admin client for creating users
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create user without password
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      email_confirm: true,
      user_metadata: {
        first_name: payload.first_name || '',
        last_name: payload.last_name || '',
        phone: payload.phone || '',
        source: payload.source || 'ghl',
        created_via: 'ghl-webhook',
        needs_password_set: true,
        email_verified: true
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user', details: createError }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('User created successfully:', newUser.user.id)

    // Use anon client to trigger password reset email
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    const { error: resetError } = await supabaseAnon.auth.resetPasswordForEmail(
      payload.email,
      {
        redirectTo: 'https://diamondplusportal.com/auth/confirm?type=recovery&next=/reset-password'
      }
    )

    if (resetError) {
      console.error('Error sending password reset email:', resetError)
      return new Response(
        JSON.stringify({ error: 'Failed to send password setup email', details: resetError }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Password setup email sent successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser.user.id,
        message: 'User created and password setup email sent'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
```

## Required Environment Variables

Add these to your Edge Function secrets in Supabase dashboard:

```bash
SUPABASE_URL=https://birthcsvtmayyxrzzyhh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>  # This is the new one you need!
```

You can find the anon key in:
- Supabase Dashboard → Settings → API → Project API keys → anon public

## Customize the Email Template

To make the password reset email more welcoming for new users:

1. Go to **Supabase Dashboard → Authentication → Email Templates → Reset Password**
2. Update the template:

```html
<h2>Welcome to {{ .ProjectName }}!</h2>

<p>Hi there,</p>

<p>Your account has been created successfully. To get started, please set up your password by clicking the link below:</p>

<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Set Your Password</a></p>

<p>This link will expire in 24 hours for security reasons.</p>

<p>If you didn't request this account, please ignore this email.</p>

<p>Welcome aboard!<br>
The {{ .ProjectName }} Team</p>
```

## Why This Approach is Better

1. **No Code Changes Needed** - Your existing password reset flow handles everything
2. **Reliable** - Uses Supabase's built-in email delivery
3. **Secure** - OTP/token_hash flow with proper verification
4. **Simple** - Minimal code, fewer edge cases
5. **Consistent** - Same flow for both password resets and new user setup

## Testing Steps

1. Add the `SUPABASE_ANON_KEY` to your Edge Function secrets
2. Update the email template to be more welcoming
3. Trigger the webhook with a test email
4. Check that:
   - User is created in Supabase
   - Email arrives with welcome message
   - Link goes to `/auth/confirm?token_hash=...&type=recovery&next=/reset-password`
   - After clicking, user lands on `/reset-password`
   - Password can be set successfully
   - User can log in with new password

## Notes

- The `resetPasswordForEmail` method requires the anon key (not service role)
- The email will come from Supabase's email service (not Mailgun)
- If you need custom email branding beyond the template, you'd need to stick with Mailgun
- This approach is production-ready and battle-tested
