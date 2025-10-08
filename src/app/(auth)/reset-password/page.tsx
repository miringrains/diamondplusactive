"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function checkSession() {
      try {
        // Just check if we have a user - the confirm route should have set up the session
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.error('No recovery session found:', error)
          router.replace('/forgot-password')
          return
        }
        
        setIsCheckingSession(false)
      } catch (err) {
        console.error('Session check error:', err)
        router.replace('/forgot-password')
      }
    }
    
    checkSession()
  }, [supabase, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading || isCheckingSession) return
    setError(null)

    // Validate passwords
    if (password !== confirmPassword) {
      return setError("Passwords don't match")
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    setIsLoading(true)
    console.log('[reset-password] Starting password update...')
    
    try {
      // Update the user's password
      const { data, error: updateError } = await supabase.auth.updateUser({ password })
      console.log('[reset-password] updateUser response:', { data, error: updateError })
      
      if (updateError) {
        const message = updateError.message.toLowerCase()
        if (message.includes("expired")) {
          setError("Your reset link has expired. Please request a new one.")
        } else if (message.includes("session") || message.includes("auth")) {
          setError("Invalid session. Please request a new reset link.")
        } else {
          setError(`Failed to update password: ${updateError.message}`)
        }
        return
      }

      console.log('[reset-password] Password updated successfully, signing out...')
      // Sign out and redirect to login
      await supabase.auth.signOut()
      router.replace("/login?message=password_reset")
    } catch (err) {
      console.error('[reset-password] Unexpected error:', err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Set new password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
                {error.includes("expired") || error.includes("Invalid") ? (
                  <button
                    type="button"
                    onClick={() => router.replace("/forgot-password")}
                    className="ml-2 underline"
                  >
                    Request a new link
                  </button>
                ) : null}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <Input
                id="password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading || isCheckingSession}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </div>
      </div>

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