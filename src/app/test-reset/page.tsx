'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const supabase = createClient()
  
  async function testReset() {
    setLoading(true)
    setResult(null)
    
    try {
      // Test 1: Without any redirectTo
      const { data: data1, error: error1 } = await supabase.auth.resetPasswordForEmail(email)
      
      // Test 2: With redirectTo using .Token
      const { data: data2, error: error2 } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://diamondplusportal.com/auth/confirm'
      })
      
      setResult({
        test1: { data: data1, error: error1 },
        test2: { data: data2, error: error2 }
      })
    } catch (err) {
      setResult({ error: err })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Reset Password</h1>
      
      <div className="space-y-4">
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          onClick={testReset}
          disabled={loading || !email}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Reset'}
        </button>
        
        {result && (
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="font-bold">After receiving the email:</h2>
        <ol className="list-decimal list-inside space-y-2 mt-2">
          <li>Right-click the reset button in the email</li>
          <li>Copy the link address</li>
          <li>Paste it here to see what URL you got</li>
          <li>Check if it has token_hash and type parameters</li>
        </ol>
      </div>
    </div>
  )
}
