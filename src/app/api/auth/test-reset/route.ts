import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Get Supabase config
    const config = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      appOrigin: process.env.NEXT_PUBLIC_APP_ORIGIN,
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      config,
      session: {
        exists: !!session,
        user: session?.user?.email,
        aal: session?.user?.aal,
        amr: session?.user?.amr,
        error: sessionError
      },
      user: {
        exists: !!user,
        email: user?.email,
        aal: user?.aal,
        error: userError
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
