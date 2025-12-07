"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, Check } from "lucide-react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface LoginFormProps {
  redirectTo?: string
  message?: string
  authError?: string
}

export default function LoginForm({ redirectTo = '/dashboard', message, authError }: LoginFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  
  useEffect(() => {
    // Handle messages from URL params
    if (authError === 'auth_error') {
      setError('Authentication failed. Please try again.')
    } else if (authError === 'invalid_recovery_link') {
      setError('Invalid or expired reset link. Please request a new one.')
    } else if (authError === 'auth_callback_error') {
      setError('Failed to process authentication. Please try again.')
    } else if (authError === 'no_code') {
      setError('Invalid authentication request. Please try again.')
    }
  }, [authError])

  // Check if user has password when email changes
  useEffect(() => {
    const checkUser = async () => {
      if (!email || !email.includes('@')) {
        setShowPassword(false)
        setUserExists(null)
        setMagicLinkSent(false)
        return
      }
      
      // Reset magic link sent state when email changes
      setMagicLinkSent(false)
      
      setCheckingUser(true)
      try {
        const response = await fetch('/api/auth/check-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        
        const data = await response.json()
        setUserExists(data.exists)
        setShowPassword(data.hasPassword)
      } catch (err) {
        console.error('Error checking user:', err)
        // Default to showing password field on error
        setShowPassword(true)
        setUserExists(true)
      } finally {
        setCheckingUser(false)
      }
    }
    
    const timer = setTimeout(checkUser, 500)
    return () => clearTimeout(timer)
  }, [email])

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/supabase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          redirectTo: redirectTo,
        }),
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[Login] Non-JSON response:', response.status, contentType)
        throw new Error('Server error - please try again or contact support')
      }

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.success) {
        window.location.href = `https://diamondplusportal.com${data.redirectTo || redirectTo}`
      } else {
        throw new Error('Login failed')
      }
    } catch (error: any) {
      setError(error.message || "Invalid email or password")
      setIsLoading(false)
    }
  }

  async function handleMagicLink() {
    setIsLoading(true)
    setError(null)

    try {
      // Use environment variable for redirect URL (Supabase best practice)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?next=${redirectTo}`,
          shouldCreateUser: false // Don't create new users
        }
      })

      if (error) throw error

      // Magic link sent successfully
      setMagicLinkSent(true)
      setIsLoading(false)
    } catch (error: any) {
      setError(error.message || "Failed to send magic link")
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!userExists) {
      setError("No account found with this email address")
      return
    }
    
    if (showPassword) {
      handlePasswordLogin(e)
    } else {
      handleMagicLink()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error and success messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {(message === 'password_reset_success' || message === 'password_updated') && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
          Password updated successfully! Please log in with your new password.
        </div>
      )}
      {message === 'password_set' && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
          Welcome to Diamond Plus! Your account is ready. Please log in to get started.
        </div>
      )}
      {message === 'password_set_manual_login' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
          Your password has been set successfully. Please log in with your email and new password.
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="input-field"
          placeholder="you@example.com"
        />
      </div>

      {checkingUser && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        </div>
      )}

      {!checkingUser && showPassword && userExists && (
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="input-field"
            placeholder="••••••••"
          />
        </div>
      )}

      {!checkingUser && !showPassword && userExists && email && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-600">
            We'll send you a magic link to sign in
          </p>
        </div>
      )}

      {!checkingUser && userExists === false && email && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
          No account found with this email address
        </div>
      )}

      {showPassword && (
        <div className="flex items-center justify-between">
          <a 
            href="https://zerotodiamond.com" 
            className="text-sm text-[var(--brand)] hover:text-[var(--brand-hover)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Interested in Joining?
          </a>
          <Link
            href="/forgot-password"
            className="text-sm text-[var(--brand)] hover:text-[var(--brand-hover)]"
          >
            Forgot password?
          </Link>
        </div>
      )}

      <Button
        type="submit"
        className="btn-primary w-full"
        disabled={isLoading || checkingUser || !email || (userExists === false) || magicLinkSent}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {showPassword ? 'Signing in...' : 'Sending magic link...'}
          </>
        ) : magicLinkSent ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Check your email
          </>
        ) : (
          <>
            {showPassword ? 'Sign in' : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </>
            )}
          </>
        )}
      </Button>
    </form>
  )
}