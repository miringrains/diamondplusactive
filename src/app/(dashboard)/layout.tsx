import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { ScrollToTop } from "@/components/scroll-to-top"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <>
      <ScrollToTop />
      <DashboardShell 
        user={{
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          avatar_url: session.user.avatar_url,
        }}
      >
        {children}
      </DashboardShell>
    </>
  )
}

