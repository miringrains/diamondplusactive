'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldCheck, X } from 'lucide-react'
import Link from 'next/link'

interface PasswordSetupNoticeProps {
  user: any
  isDismissable?: boolean
}

export function PasswordSetupNotice({ user, isDismissable = true }: PasswordSetupNoticeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has password set
    const hasPassword = user?.user_metadata?.has_password === true
    const dismissedKey = `password-setup-dismissed-${user?.id}`
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true'

    // Show notice if no password and not dismissed (or not dismissable)
    setIsVisible(!hasPassword && (!wasDismissed || !isDismissable))
  }, [user, isDismissable])

  const handleDismiss = () => {
    if (isDismissable) {
      const dismissedKey = `password-setup-dismissed-${user?.id}`
      localStorage.setItem(dismissedKey, 'true')
      setIsDismissed(true)
      setIsVisible(false)
    }
  }

  if (!isVisible || isDismissed) return null

  return (
    <Alert className="mb-4 relative bg-amber-50 border-amber-200">
      {isDismissable && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-amber-600 hover:text-amber-800"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <ShieldCheck className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Secure Your Account</AlertTitle>
      <AlertDescription className="text-amber-800 space-y-2">
        <p>
          You're currently using magic links to sign in. For added security and convenience, 
          you can set up a password for your account.
        </p>
        <div className="mt-3">
          <Link href="/me/profile">
            <Button variant="outline" size="sm" className="border-amber-600 text-amber-700 hover:bg-amber-100">
              Set Up Password
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  )
}
