"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function TestAuthFlowPage() {
  const [data, setData] = useState<any>({
    cookies: {},
    session: null,
    user: null,
    error: null,
    logs: []
  })

  const addLog = (message: string) => {
    setData(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toISOString()}: ${message}`]
    }))
  }

  useEffect(() => {
    checkEverything()
  }, [])

  async function checkEverything() {
    const supabase = getSupabaseBrowserClient()
    
    // Get all cookies
    const allCookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key) acc[key] = value
      return acc
    }, {})
    
    addLog('Checking cookies...')
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    addLog(session ? 'Session found' : 'No session found')
    
    // Check user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    addLog(user ? `User found: ${user.email}` : 'No user found')
    
    setData(prev => ({
      ...prev,
      cookies: allCookies,
      session,
      user,
      error: sessionError || userError
    }))
  }

  async function testPasswordReset() {
    const supabase = getSupabaseBrowserClient()
    const email = prompt('Enter email for password reset test:')
    if (!email) return
    
    addLog(`Sending password reset to ${email}...`)
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      
      if (error) {
        addLog(`Error: ${error.message}`)
      } else {
        addLog('Password reset email sent!')
        addLog(`Check email and click the link`)
      }
    } catch (err) {
      addLog(`Exception: ${err}`)
    }
  }

  async function refreshSession() {
    const supabase = getSupabaseBrowserClient()
    addLog('Refreshing session...')
    
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      addLog(`Refresh error: ${error.message}`)
    } else {
      addLog('Session refreshed')
      checkEverything()
    }
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    addLog('Signing out...')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`Sign out error: ${error.message}`)
    } else {
      addLog('Signed out')
      checkEverything()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Auth Flow Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cookies</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(data.cookies, null, 2)}
          </pre>
          <p className="text-sm text-gray-600 mt-2">
            Look for cookies starting with 'sb-' - these are Supabase auth cookies
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(data.session, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(data.user, null, 2)}
          </pre>
        </div>

        {data.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Error</h2>
            <pre className="bg-red-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(data.error, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <Button onClick={checkEverything}>Refresh Data</Button>
            <Button onClick={testPasswordReset} variant="outline">Test Password Reset</Button>
            <Button onClick={refreshSession} variant="outline">Refresh Session</Button>
            <Button onClick={signOut} variant="destructive">Sign Out</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-gray-100 p-4 rounded space-y-1 text-sm font-mono max-h-64 overflow-y-auto">
            {data.logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Test Password Reset" and enter your email</li>
            <li>Check your email and click the reset link</li>
            <li>After being redirected, come back to this page</li>
            <li>Click "Refresh Data" to see if cookies/session were set</li>
            <li>If you see a session with your email, the auth flow is working</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
