import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Content-Type": "application/json",
};
const REDIRECT_TO = "https://diamondplusportal.com/auth/confirm?flow=invite";
const WEBHOOK_SECRET = "birthcsvtmayyxrzzyhh";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // auth
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: cors });
  }

  try {
    const payload = await req.json();
    const email = payload?.email?.trim().toLowerCase();
    if (!email) return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: cors });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ensure user exists (create → tolerate 422)
    let userId: string | null = null;
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
        phone: payload.phone || "",
      },
    });
    if (created.error) {
      if (created.error.status !== 422) {
        return new Response(JSON.stringify({ error: created.error.message, stage: "createUser" }), { status: 500, headers: cors });
      }
      // resolve existing id
      const list = await admin.auth.admin.listUsers();
      const existing = list.data.users.find((u: any) => u.email?.toLowerCase() === email);
      if (!existing) return new Response(JSON.stringify({ error: "User exists but cannot resolve ID" }), { status: 500, headers: cors });
      userId = existing.id;
      // optional metadata refresh
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existing.user_metadata,
          ghl_contact_id: payload.contactId || existing.user_metadata?.ghl_contact_id,
          first_name: payload.first_name || existing.user_metadata?.first_name,
          last_name: payload.last_name || existing.user_metadata?.last_name,
        },
      });
    } else {
      userId = created.data.user.id;
    }

    // upsert profile (public.profiles)
    await admin.from("profiles").upsert(
      {
        id: userId!,
        diamond_user_id: payload.contactId || null,
        email,
        full_name: `${payload.first_name || ""} ${payload.last_name || ""}`.trim() || null,
        role: "user",
        metadata: { tag: payload.tag || "", source: payload.source || "ghl" },
      },
      { onConflict: "id" }
    );

    // Send password reset email for first-time setup
    // Using admin client to send email, but with anon context for proper link generation
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { data, error } = await anonClient.auth.resetPasswordForEmail(email, {
      redirectTo: REDIRECT_TO,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          stage: "signInWithOtp",
        }),
        { status: 500, headers: cors }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset link sent to email",
        userId,
        email,
        flow_type: "recovery",
      }),
      { status: 200, headers: cors }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e), stage: "unhandled" }), { status: 500, headers: cors });
  }
});