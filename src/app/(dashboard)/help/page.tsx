import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { SupportForm } from "./support-form"

export default async function HelpPage() {
  const session = await auth()
  
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[var(--hero-bg)] to-[var(--page-bg)] py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-[var(--ink)]/70 mb-6">
            <Link href="/dashboard" className="hover:text-[var(--ink)] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[var(--ink)]">Support</span>
          </nav>
          <h1 className="text-4xl font-bold text-[var(--ink)] mb-4">Need Support?</h1>
          <p className="text-lg text-[var(--ink)]/80">
            Complete the attached form with your questions / concerns and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
      
      <div className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <SupportForm 
            user={{
              name: session?.user?.name,
              email: session?.user?.email
            }}
          />
        </div>
      </div>
    </div>
  )
}