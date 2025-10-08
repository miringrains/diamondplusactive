"use client"

import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"

/**
 * EMAIL TEMPLATE CONFIGURATION (Supabase Dashboard)
 * 
 * Go to: Authentication > Email Templates > Reset Password
 * 
 * The template should use {{ .ConfirmationURL }}
 * Example: <a href="{{ .ConfirmationURL }}">Reset Password</a>
 * 
 * This uses the PKCE flow (default for @supabase/ssr):
 * 1. User clicks link with PKCE code
 * 2. /auth/callback exchanges the code for a session
 * 3. Redirects to /reset-password with recovery session
 * 
 * Make sure your Supabase project's Site URL is set to: https://diamondplusportal.com
 */

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setNotice(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "https://diamondplusportal.com"

      // Redirect to callback endpoint for PKCE code exchange
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${ORIGIN}/auth/callback?next=/reset-password`,
      })

      // Neutral message (prevents enumeration)
      setNotice("If that email exists, we sent a reset link.")
      setEmail("")
    } catch {
      setNotice("If that email exists, we sent a reset link.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Reset your password</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your email and we’ll send a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            {notice && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                {notice}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-[var(--brand)] hover:text-[var(--brand-hover)]">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right — Visual */}
      {/* Right side - Video Only */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/bluediamond.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
