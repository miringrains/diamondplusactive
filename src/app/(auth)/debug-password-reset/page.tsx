"use client"

import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DebugPasswordResetPage() {
  const [email, setEmail] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [currentUrl, setCurrentUrl] = useState("")

  const addLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const log = data 
      ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}`
      : `[${timestamp}] ${message}`
    setLogs(prev => [...prev, log])
  }

  const checkCurrentState = async () => {
    addLog("=== CHECKING CURRENT STATE ===")
    
    // Check URL
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
      addLog("Current URL", window.location.href)
    }
    
    // Check cookies
    const cookies = document.cookie.split(';').filter(c => c.includes('sb-'))
    addLog("Supabase cookies", cookies)
    
    // Check session
    const supabase = getSupabaseBrowserClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      addLog("Session error", sessionError)
    } else if (session) {
      addLog("Session found", {
        user: session.user.email,
        expires_at: session.expires_at,
        aal: session.user.aal,
        amr: session.user.amr
      })
    } else {
      addLog("No session found")
    }
    
    // Check user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      addLog("User error", userError)
    } else if (user) {
      addLog("User found", {
        email: user.email,
        id: user.id,
        aal: user.aal
      })
    } else {
      addLog("No user found")
    }
  }

  const sendPasswordReset = async () => {
    if (!email) {
      addLog("ERROR: Please enter an email")
      return
    }
    
    addLog("=== SENDING PASSWORD RESET ===")
    addLog("Email", email)
    
    const supabase = getSupabaseBrowserClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://diamondplusportal.com'
    
    // Show what redirectTo we're using
    const redirectTo = `${origin}/auth/callback?next=/reset-password`
    addLog("RedirectTo URL", redirectTo)
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      })
      
      if (error) {
        addLog("Reset password error", error)
      } else {
        addLog("Password reset email sent successfully")
        addLog("Check your email and click the link")
        addLog("The link should look like:")
        addLog("https://[project].supabase.co/auth/v1/verify?token=pkce_[code]&type=recovery&redirect_to=[redirectTo]")
      }
    } catch (err) {
      addLog("Exception", err)
    }
  }

  const clearLogs = () => setLogs([])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Password Reset Flow Debugger</h1>
          
          <div className="space-y-4">
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <h2 className="font-semibold text-blue-900 mb-2">Current URL:</h2>
              <code className="text-sm bg-blue-100 px-2 py-1 rounded">{currentUrl || 'Click "Check Current State" to see URL'}</code>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Email for password reset:</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={sendPasswordReset} className="bg-blue-600 hover:bg-blue-700">
                Send Password Reset
              </Button>
              <Button onClick={checkCurrentState} variant="outline">
                Check Current State
              </Button>
              <Button onClick={clearLogs} variant="outline">
                Clear Logs
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Click "Check Current State" or send a password reset.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-900">Expected Flow:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter email and click "Send Password Reset"</li>
            <li>Check email for reset link (should contain pkce_ code)</li>
            <li>Click the link - it should go to /auth/confirm</li>
            <li>/auth/confirm detects PKCE code and redirects to /auth/callback</li>
            <li>/auth/callback exchanges code for session</li>
            <li>You're redirected to /reset-password with active session</li>
            <li>Come back here and click "Check Current State" to verify session</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
