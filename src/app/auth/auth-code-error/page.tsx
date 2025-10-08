import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Authentication Error</h2>
          <p className="mt-2 text-gray-600">
            The authentication link is invalid or has expired.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This can happen if:
          </p>
          <ul className="text-sm text-gray-600 list-disc text-left pl-8 space-y-1">
            <li>The link has already been used</li>
            <li>The link has expired (links are valid for 1 hour)</li>
            <li>The link was modified or corrupted</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link href="/forgot-password">
            <Button className="w-full">
              Request a new password reset link
            </Button>
          </Link>
          
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
