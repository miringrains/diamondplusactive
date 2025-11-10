import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { BusinessAuditForm } from "./business-audit-form"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function BusinessAuditPage() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  // Split user name into first and last
  const nameParts = (session.user.name || '').trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Get phone from profile if available
  let phone: string | null = null
  try {
    const supabase = await createSupabaseServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', session.user.id)
      .single()
    
    if (profile?.metadata) {
      const metadata = profile.metadata as Record<string, any>
      phone = metadata.phone || null
    }
  } catch (error) {
    console.error('Error fetching user phone:', error)
  }
  
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[var(--hero-bg)] to-[var(--page-bg)] py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-[var(--ink)]/70 mb-6">
            <Link href="/dashboard" className="hover:text-[var(--ink)] transition-colors">
              <Home className="w-4 h-4 inline mr-1" />
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[var(--ink)]">Monthly Business Audit</span>
          </nav>
          <h1 className="text-4xl font-bold text-[var(--ink)] mb-4">
            🎯 Diamond+ Monthly Business Audit 🎯
          </h1>
          <p className="text-lg text-[var(--ink)]/80">
            This audit helps track your business growth, identify bottlenecks, and ensure your goals align with the Diamond+ 90-Day Action Plan. Complete this form at the end of each month.
          </p>
        </div>
      </div>
      
      <div className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <BusinessAuditForm 
            user={{
              firstName,
              lastName,
              email: session.user.email || '',
              phone
            }}
          />
        </div>
      </div>
    </div>
  )
}
