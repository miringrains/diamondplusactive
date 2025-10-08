import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

// Create a Supabase client for use in the browser
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  if (!anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  
  // For browser environment, we use the createBrowserClient which handles cookies automatically
  return createSupabaseBrowserClient<Database>(url, anonKey, {
    auth: {
      detectSessionInUrl: true, // Let Supabase handle PKCE codes from URLs
      persistSession: true,
      autoRefreshToken: true
    }
  })
}

// For backwards compatibility
export const createBrowserClient = createClient
export const getSupabaseBrowserClient = createClient
