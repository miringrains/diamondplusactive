# Edge Function with Mailgun Email Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Content-Type": "application/json"
};

const WEBHOOK_SECRET = "birthcsvtmayyxrzzyhh";

// Email template for new users
const getWelcomeEmailTemplate = (resetLink: string, firstName?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        @media (prefers-color-scheme: dark) {
            .logo-text { fill: #ffffff !important; }
            .logo-plus { fill: #00dbff !important; }
            .email-body { background-color: #1a1a1a !important; }
            .content-wrapper { background-color: #2a2a2a !important; color: #ffffff !important; }
            .text-primary { color: #ffffff !important; }
            .text-secondary { color: #cccccc !important; }
            .button-primary { background-color: #00dbff !important; color: #0f293d !important; }
            .security-tips { background-color: #3a3a3a !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
    <div class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr>
                <td>
                    <div class="content-wrapper" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <div class="logo-container" style="display: inline-block;">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50.96 8.83" width="200" height="35" style="max-width: 100%; height: auto;">
                                    <g>
                                        <path class="logo-text" style="fill: #0f293d;" d="M0,8.71V.31h2.83c.58,0,1.12.11,1.61.32s.92.51,1.29.89c.37.38.65.83.86,1.34.21.51.31,1.07.31,1.67s-.1,1.15-.31,1.66c-.21.51-.49.95-.86,1.33-.37.38-.8.67-1.29.88s-1.03.32-1.61.32H0ZM1.35,7.39h1.48c.37,0,.72-.07,1.05-.22s.61-.35.85-.61c.24-.26.43-.57.57-.91.14-.34.2-.72.2-1.13s-.07-.79-.2-1.14-.32-.66-.57-.92c-.24-.26-.52-.46-.85-.61s-.67-.22-1.05-.22h-1.48v5.76Z"/>
                                        <path class="logo-text" style="fill: #0f293d;" d="M8.06,1.66c-.21,0-.38-.08-.53-.24s-.23-.36-.23-.59.08-.43.23-.59c.15-.16.33-.24.53-.24s.39.08.54.24.22.36.22.59-.07.43-.22.59c-.15.16-.33.24-.54.24ZM7.43,8.71V2.53h1.29v6.18h-1.29Z"/>
                                        <path class="logo-text" style="fill: #0f293d;" d="M11.17,8.82c-.4,0-.76-.08-1.07-.24-.31-.16-.56-.38-.73-.67-.18-.28-.26-.61-.26-.98,0-.59.2-1.05.61-1.38.41-.33.97-.49,1.68-.49.53,0,1.02.1,1.48.29v-.55c0-.4-.11-.7-.32-.9-.22-.2-.54-.3-.96-.3-.25,0-.51.04-.79.12-.28.08-.6.21-.96.4l-.46-1.06c.43-.22.84-.38,1.23-.49.39-.11.78-.16,1.18-.16.75,0,1.33.2,1.74.59.41.39.62.94.62,1.66v4.06h-1.27v-.49c-.24.21-.5.36-.78.46-.28.1-.58.14-.91.14ZM10.32,6.9c0,.27.11.49.32.65.21.16.5.25.85.25.27,0,.52-.04.75-.13s.44-.21.62-.38v-.98c-.2-.1-.41-.18-.62-.23-.22-.05-.45-.08-.71-.08-.37,0-.67.08-.89.24-.22.16-.32.38-.32.66Z"/>
                                        <path class="logo-text" style="fill: #0f293d;" d="M14.83,8.71V2.53h1.29v.54c.41-.44.92-.66,1.53-.66.38,0,.72.09,1.02.26.3.18.54.42.72.72.23-.32.5-.56.82-.73.32-.17.68-.25,1.07-.25.42,0,.79.1,1.11.31.32.21.57.49.75.86.18.36.28.79.28,1.28v3.85h-1.28v-3.64c0-.45-.11-.8-.32-1.06s-.51-.38-.87-.38c-.25,0-.48.06-.68.18-.21.12-.38.3-.53.55,0,.07.01.15.02.23s.01.17.01.26v3.85h-1.28v-3.64c0-.45-.11-.8-.32-1.06s-.5-.38-.86-.38c-.25,0-.47.06-.67.17-.2.11-.37.28-.51.49v4.42h-1.29Z"/>
                                        <path class="logo-text" style="fill: #0f293d;" d="M26.77,8.83c-.56,0-1.06-.14-1.51-.43-.45-.28-.81-.67-1.07-1.15-.26-.48-.4-1.03-.4-1.63s.13-1.14.4-1.63.62-.87,1.07-1.15c.45-.28.96-.43,1.51-.43s1.07.14,1.53.43c.45.28.81.67,1.07,1.15s.4,1.03.4,1.63-.13,1.14-.4,1.63c-.26.48-.62.87-1.07,1.15-.45.28-.96.43-1.53.43ZM26.77,7.61c.32,0,.61-.09.88-.26.26-.18.47-.41.62-.71.15-.3.23-.63.23-1s-.08-.71-.23-1.01c-.15-.3-.36-.53-.62-.71-.26-.18-.55-.26-.86-.26s-.62.09-.88.26c-.26.18-.47.41-.62.71s-.23.63-.23,1.01.08.7.23,1,.36.54.62.71c.26.18.55.26.88.26Z"/>
                                        <path class="logo-text" style="fill: #0f293d;" d="M30.17,8.71V2.53h1.29v.58c.43-.46.98-.7,1.65-.7.43,0,.82.1,1.15.31.33.21.6.49.79.86.19.36.29.79.29,1.28v3.85h-1.29v-3.64c0-.45-.12-.8-.35-1.06s-.55-.38-.95-.38c-.28,0-.53.06-.74.19-.22.12-.4.3-.55.52v4.37h-1.29Z"/>
                                        <path class="logo-text" style="fill: #0f293d;" d="M38.57,8.81c-.53,0-1.01-.14-1.45-.43-.44-.28-.79-.67-1.04-1.15s-.38-1.02-.38-1.62.13-1.13.39-1.61c.26-.48.61-.86,1.05-1.14.44-.28.93-.42,1.48-.42.3,0,.59.05.86.14.28.09.53.23.77.41V.31l1.29-.25v8.65h-1.28v-.55c-.47.43-1.03.65-1.67.65ZM38.76,7.6c.3,0,.58-.06.83-.17.25-.12.47-.29.64-.51v-2.6c-.18-.21-.39-.37-.65-.49-.26-.12-.53-.17-.83-.17-.34,0-.64.09-.91.26-.27.17-.49.41-.64.7-.16.3-.24.63-.24,1.01s.08.71.24,1.01c.16.3.37.53.64.71s.58.26.91.26Z"/>
                                        <polygon class="logo-plus" style="fill: #00dbff;" points="50.96 3.59 48.1 3.59 48.1 .73 46.42 .73 46.42 3.59 43.56 3.59 43.56 5.27 46.42 5.27 46.42 8.13 48.1 8.13 48.1 5.27 50.96 5.27 50.96 3.59"/>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        
                        <!-- Content -->
                        <h1 class="text-primary" style="color: #0f293d; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">
                            Welcome to Diamond Plus!
                        </h1>
                        
                        <p class="text-secondary" style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                            ${firstName ? `Hi ${firstName}, your` : 'Your'} Diamond Plus account has been created. Click the button below to set your password and get started.
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${resetLink}" class="button-primary" style="display: inline-block; padding: 16px 32px; background-color: #00dbff; color: #0f293d; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Set Your Password
                            </a>
                        </div>
                        
                        <!-- Expiry Notice -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0; text-align: center;">
                            🕐 This link expires in 1 hour for security reasons
                        </p>
                        
                        <!-- Security Tips -->
                        <div class="security-tips" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                            <h3 style="color: #0f293d; font-size: 16px; margin: 0 0 15px 0;">Password Security Tips:</h3>
                            <ul style="color: #666666; font-size: 14px; line-height: 22px; margin: 0; padding-left: 20px;">
                                <li>Use at least 8 characters</li>
                                <li>Include uppercase and lowercase letters</li>
                                <li>Add numbers and special characters</li>
                                <li>Don't reuse passwords from other sites</li>
                            </ul>
                        </div>
                        
                        <!-- Alternative Link -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="${resetLink}" style="color: #00dbff; word-break: break-all;">${resetLink}</a>
                        </p>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center;">
                            <p class="text-secondary" style="color: #999999; font-size: 12px; margin: 0;">
                                This email was sent because an account was created for you on Diamond Plus.<br>
                                If you didn't expect this email, please contact support.<br><br>
                                © 2025 Diamond Plus. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // auth
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: cors
    });
  }

  try {
    const payload = await req.json();
    const email = payload?.email?.trim().toLowerCase();
    if (!email) return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: cors
    });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ensure user exists (create → tolerate 422)
    let userId = null;
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        ghl_contact_id: payload.contactId || "",
        first_name: payload.first_name || "",
        last_name: payload.last_name || "",
        source: payload.source || "ghl",
        created_via: payload.tag || "ghl-webhook",
        needs_password_set: true,
        phone: payload.phone || ""
      }
    });

    if (created.error) {
      if (created.error.status !== 422) {
        return new Response(JSON.stringify({
          error: created.error.message,
          stage: "createUser"
        }), {
          status: 500,
          headers: cors
        });
      }
      // resolve existing id
      const list = await admin.auth.admin.listUsers();
      const existing = list.data.users.find((u) => u.email?.toLowerCase() === email);
      if (!existing) return new Response(JSON.stringify({
        error: "User exists but cannot resolve ID"
      }), {
        status: 500,
        headers: cors
      });
      userId = existing.id;
      
      // optional metadata refresh
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existing.user_metadata,
          ghl_contact_id: payload.contactId || existing.user_metadata?.ghl_contact_id,
          first_name: payload.first_name || existing.user_metadata?.first_name,
          last_name: payload.last_name || existing.user_metadata?.last_name
        }
      });
    } else {
      userId = created.data.user.id;
    }

    // upsert profile (public.profiles)
    await admin.from("profiles").upsert({
      id: userId,
      diamond_user_id: payload.contactId || null,
      email,
      full_name: `${payload.first_name || ""} ${payload.last_name || ""}`.trim() || null,
      role: "user",
      metadata: {
        tag: payload.tag || "",
        source: payload.source || "ghl"
      }
    }, {
      onConflict: "id"
    });

    // Generate recovery link using admin API
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://diamondplusportal.com/reset-password'
      }
    });

    if (linkError || !linkData) {
      return new Response(JSON.stringify({
        error: linkError?.message || 'Failed to generate recovery link',
        stage: 'generateLink'
      }), {
        status: 500,
        headers: cors
      });
    }

    // Send custom email via Mailgun
    const formData = new FormData();
    formData.append('from', Deno.env.get('MAILGUN_FROM') || 'Diamond Plus <noreply@diamondplusportal.com>');
    formData.append('to', email);
    formData.append('subject', 'Welcome to Diamond Plus - Set Your Password');
    formData.append('html', getWelcomeEmailTemplate(linkData.properties.action_link, payload.first_name));

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${Deno.env.get('MAILGUN_DOMAIN')}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`api:${Deno.env.get('MAILGUN_API_KEY')}`)
        },
        body: formData
      }
    );

    if (!mailgunResponse.ok) {
      const error = await mailgunResponse.text();
      return new Response(JSON.stringify({
        error: 'Failed to send email',
        details: error,
        stage: 'mailgun'
      }), {
        status: 500,
        headers: cors
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Welcome email sent successfully",
      userId,
      email,
      flow_type: "password_setup"
    }), {
      status: 200,
      headers: cors
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e?.message || String(e),
      stage: "unhandled"
    }), {
      status: 500,
      headers: cors
    });
  }
});
```

## Key Changes from Your Template:

1. **Title**: "Welcome to Diamond Plus!" instead of "Reset Your Password"
2. **Message**: Welcome message with optional first name
3. **Button**: "Set Your Password" instead of "Reset Password"
4. **Footer**: Updated to reflect account creation instead of password reset
5. **Dynamic Link**: Uses the actual recovery link from `generateLink()`

## Environment Variables Summary:

```bash
# Supabase (already have these)
SUPABASE_URL=https://birthcsvtmayyxrzzyhh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mailgun (add these)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=mg.diamondplusportal.com
MAILGUN_FROM=Diamond Plus <noreply@diamondplusportal.com>
```

## Testing:

1. Deploy the Edge Function with these env vars
2. Test with a real email to verify:
   - Email arrives with correct branding
   - Link format is correct
   - Link takes user to `/auth/confirm`
   - User lands on `/reset-password`
   - Password can be set successfully

## Important: Implicit vs OTP Flow

The `generateLink` API with `type: 'recovery'` generates an **implicit grant flow** link with tokens in the hash fragment:
```
https://diamondplusportal.com/reset-password#access_token=...&refresh_token=...&type=recovery
```

Your `/reset-password` page has been updated to handle both:
1. **Implicit flow** (from `generateLink`): Detects tokens in hash and calls `setSession`
2. **OTP flow** (from regular password reset emails): Expects session from `/auth/confirm`

This ensures compatibility with both admin-generated links and user-initiated password resets.
