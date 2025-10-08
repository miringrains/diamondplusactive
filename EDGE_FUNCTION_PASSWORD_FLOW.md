# Edge Function - User Creation with Password Set Flow

## Modified Edge Function

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Content-Type": "application/json"
};

// Use the password reset flow we just implemented
const REDIRECT_TO = "https://diamondplusportal.com/auth/confirm?type=recovery&next=/reset-password";
const WEBHOOK_SECRET = "birthcsvtmayyxrzzyhh";

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

    // CHANGED: Use resetPasswordForEmail instead of signInWithOtp
    // This creates a recovery session that goes to our reset-password page
    const { data, error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: REDIRECT_TO
    });

    if (error) {
      return new Response(JSON.stringify({
        error: error.message,
        stage: "resetPasswordForEmail"
      }), {
        status: 500,
        headers: cors
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Password setup email sent",
      userId,
      email,
      flow_type: "password_reset"
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

## Key Changes

1. **Changed `REDIRECT_TO`** to use the recovery flow:
   ```typescript
   const REDIRECT_TO = "https://diamondplusportal.com/auth/confirm?type=recovery&next=/reset-password";
   ```

2. **Replaced `signInWithOtp`** with `resetPasswordForEmail`:
   ```typescript
   const { data, error } = await admin.auth.resetPasswordForEmail(email, {
     redirectTo: REDIRECT_TO
   });
   ```

3. **Updated response** to reflect password reset flow:
   ```typescript
   flow_type: "password_reset"
   ```

## How It Works

1. GHL webhook creates user account with metadata
2. Instead of sending a magic link, it sends a password reset email
3. User clicks link → goes to `/auth/confirm` → verifies OTP → redirects to `/reset-password`
4. User sets their password on the same reset-password page
5. After setting password, they're redirected to login

## Benefits

- **Reuses existing, tested flow** - no risk of breaking anything
- **Secure** - uses recovery session with proper validation
- **Consistent UX** - same password setting interface
- **No new pages needed** - uses `/reset-password` for both flows

## Email Customization

If you want different email content for new users vs password resets, you can:

1. Add a custom email template in Supabase for "Invite User" 
2. Use `admin.auth.admin.inviteUserByEmail()` instead
3. But still redirect to the same recovery flow

## Alternative: Custom Set Password Page

If you really want a separate page, you could:

1. Keep using `signInWithOtp`
2. Redirect to `/auth/callback?next=/set-password`
3. Create `/set-password` page that:
   - Checks if user is logged in
   - Checks `needs_password_set` metadata
   - Uses `updateUser({ password })` to set password
   - Updates metadata to remove `needs_password_set`

But this adds complexity and more potential failure points.
