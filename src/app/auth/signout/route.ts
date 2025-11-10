import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { clearAllSupabaseCookies } from '@/lib/supabase/cookie-config'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient(req)

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'
  const response = NextResponse.redirect(new URL('/login', origin), {
    status: 302,
  })
  
  // Clear all possible Supabase cookies with all domain variations
  // This ensures we clean up any duplicate cookies
  clearAllSupabaseCookies(
    (name, value, options) => response.cookies.set(name, value, options),
    req
  )
  
  return response
}
