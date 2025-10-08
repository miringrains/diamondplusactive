"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TestPasswordResetPage() {
  const [email, setEmail] = useState("anna@breakthruweb.com")
  const [logs, setLogs] = useState<string[]>([])
  const [resetLinkData, setResetLinkData] = useState<any>(null)
  const supabase = getSupabaseBrowserClient()

  const addLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const log = data 
      ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}`
      : `[${timestamp}] ${message}`
    setLogs(prev => [...prev, log])
    console.log(message, data)
  }

  // Check current session on mount
  useEffect(() => {
    async function checkCurrentState() {
      addLog("Checking current auth state...")
      
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog("Session error", error)
      } else {
        addLog("Current session", {
          hasSession: !!session,
          user: session?.user?.email,
          aal: session?.user?.aal
        })
      }
    }
    
    checkCurrentState()
  }, [])

  async function testPasswordReset() {
    setLogs([])
    addLog("Starting password reset test for", email)
    
    try {
      // Step 1: Request password reset
      addLog("Step 1: Requesting password reset...")
      const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "https://diamondplusportal.com"
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${ORIGIN}/auth/confirm?type=recovery&next=/reset-password`,
      })
      
      if (error) {
        addLog("Reset request failed", error)
        return
      }
      
      addLog("Reset email sent successfully", data)
      
      // Step 2: Check what Supabase is generating
      addLog("Step 2: Checking Supabase configuration...")
      
      // Get Supabase project info
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      addLog("Supabase URL", supabaseUrl)
      
      // Try to intercept the email content (this won't work in production but helps debug)
      addLog("Note: In production, check your email for the reset link format")
      addLog("Expected format: https://[project].supabase.co/auth/v1/verify?token_hash=...&type=recovery")
      addLog("If you see ?code= instead of ?token_hash=, Supabase is using PKCE instead of OTP")
      
      // Step 3: Test OTP verification manually
      addLog("Step 3: To test manually:")
      addLog("1. Check your email for the reset link")
      addLog("2. Copy the token_hash value from the URL")
      addLog("3. Use the 'Test OTP Verification' section below")
      
    } catch (err) {
      addLog("Unexpected error", err)
    }
  }
  
  async function testOtpVerification(tokenHash: string) {
    addLog("Testing OTP verification with token_hash:", tokenHash)
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type: 'recovery',
        token_hash: tokenHash
      })
      
      if (error) {
        addLog("OTP verification failed", error)
        return
      }
      
      addLog("OTP verification successful", data)
      
      // Check session after verification
      const { data: { session } } = await supabase.auth.getSession()
      addLog("Session after OTP verification", {
        hasSession: !!session,
        user: session?.user?.email,
        aal: session?.user?.aal
      })
      
    } catch (err) {
      addLog("Unexpected error during OTP verification", err)
    }
  }
  
  async function testUpdatePassword(newPassword: string) {
    addLog("Testing password update...")
    
    try {
      const { data, error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })
      
      if (error) {
        addLog("Password update failed", error)
        return
      }
      
      addLog("Password updated successfully", data)
      
    } catch (err) {
      addLog("Unexpected error during password update", err)
    }
  }
  
  async function signOut() {
    addLog("Signing out...")
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog("Sign out error", error)
    } else {
      addLog("Signed out successfully")
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Password Reset Flow Tester</h1>
      
      {/* Test Controls */}
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Step 1: Request Password Reset</h2>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1"
            />
            <Button onClick={testPasswordReset}>
              Send Reset Email
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Step 2: Test OTP Verification</h2>
          <p className="text-sm text-gray-600 mb-2">
            Paste the token_hash from your email link here (the part after token_hash=)
          </p>
          <div className="flex gap-2">
            <Input
              id="token-hash"
              placeholder="Paste token_hash here"
              className="flex-1"
            />
            <Button onClick={() => {
              const tokenHash = (document.getElementById('token-hash') as HTMLInputElement).value
              testOtpVerification(tokenHash)
            }}>
              Verify OTP
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Step 3: Update Password</h2>
          <div className="flex gap-2">
            <Input
              id="new-password"
              type="password"
              placeholder="New password"
              className="flex-1"
            />
            <Button onClick={() => {
              const password = (document.getElementById('new-password') as HTMLInputElement).value
              testUpdatePassword(password)
            }}>
              Update Password
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Utilities</h2>
          <div className="flex gap-2">
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reload Page
            </Button>
            <Button onClick={() => setLogs([])} variant="outline">
              Clear Logs
            </Button>
          </div>
        </div>
      </div>
      
      {/* Logs */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Analysis */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Common Issues:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If the email link has <code>?code=</code> instead of <code>?token_hash=</code>, Supabase is using PKCE flow</li>
          <li>If the link goes to <code>/auth/callback</code>, the email template is wrong</li>
          <li>If OTP verification fails with "expired", the link was already used or is too old</li>
          <li>If password update fails with "no session", the OTP verification didn't establish a recovery session</li>
        </ul>
      </div>
    </div>
  )
}
