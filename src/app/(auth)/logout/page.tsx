import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function LogoutPage() {
  // Simply redirect to the signout API route
  redirect('/auth/signout')
}