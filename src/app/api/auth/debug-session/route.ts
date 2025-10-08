import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/database.types'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { action, email, password } = await request.json()
  
  const results: any = {
    timestamp: new Date().toISOString(),
    action,
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    if (action === 'check-session') {
      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession()
      results.session = session ? {
        user_email: session.user.email,
        user_id: session.user.id,
        provider: session.user.app_metadata?.provider,
        aal: session.aal,
        amr: session.amr,
        is_recovery: session.amr?.some(factor => factor.method === 'recovery'),
        expires_at: session.expires_at,
      } : null
      results.error = error?.message
      
      // Check user claims
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        results.user = user ? {
          email: user.email,
          aal: user.aal,
          amr: user.amr,
          recovery_sent_at: user.recovery_sent_at,
        } : null
        results.userError = userError?.message
      }
    } else if (action === 'login') {
      // Login normally
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      results.loginSuccess = !!data.session
      results.loginError = error?.message
      if (data.session) {
        results.sessionAfterLogin = {
          user_email: data.session.user.email,
          provider: data.session.user.app_metadata?.provider,
          aal: data.session.aal,
          amr: data.session.amr,
        }
      }
    } else if (action === 'send-reset') {
      // Send password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'}/auth/confirm`
      })
      results.resetSent = !error
      results.resetError = error?.message
    } else if (action === 'logout') {
      // Logout
      const { error } = await supabase.auth.signOut()
      results.logoutSuccess = !error
      results.logoutError = error?.message
    } else if (action === 'test-recovery-link') {
      // Test what a recovery link looks like
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: 'https://diamondplusportal.com/auth/confirm'
        }
      })
      
      if (linkData?.properties?.action_link) {
        const url = new URL(linkData.properties.action_link)
        results.recoveryLink = {
          fullUrl: linkData.properties.action_link,
          path: url.pathname,
          params: Object.fromEntries(url.searchParams),
          hash: url.hash,
        }
      }
      results.linkError = linkError?.message
    }

  } catch (error: any) {
    results.error = error.message
  }

  return NextResponse.json(results)
}

