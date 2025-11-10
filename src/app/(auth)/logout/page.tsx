"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()
  
  useEffect(() => {
    const handleLogout = async () => {
      const supabase = getSupabaseBrowserClient()
      
      // Clear client-side session first
      await supabase.auth.signOut()
      
      // Clear any stale cookies
      document.cookie.split(";").forEach(c => {
        if (c.trim().startsWith('sb-')) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.diamondplusportal.com")
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        }
      })
      
      // Then call server route to clear server-side session
      await fetch('/auth/signout', { method: 'POST' })
      
      // Redirect to login
      router.push('/login')
    }
    
    handleLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  )
}