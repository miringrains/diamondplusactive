import { CookieOptions } from '@supabase/ssr'

/**
 * Get consistent cookie options for Supabase across the platform
 * This ensures all cookies are set with the same domain configuration
 */
export function getSupabaseCookieOptions(req?: Request | { headers: Headers }): Partial<CookieOptions> {
  // Determine the host
  let host = 'diamondplusportal.com'
  
  if (req) {
    const headers = req instanceof Request ? req.headers : req.headers
    host = headers.get('x-forwarded-host') || headers.get('host') || 'diamondplusportal.com'
  }
  
  // For localhost, don't set domain
  if (host.includes('localhost')) {
    return {
      path: '/',
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 24 * 365, // 1 year
    }
  }
  
  // For production, use the base domain without subdomain
  // This allows cookies to be shared across all subdomains
  const baseDomain = host
    .replace('www.', '')
    .replace('admin.', '')
    .replace('staging.', '')
    .replace('dev.', '')
  
  return {
    domain: `.${baseDomain}`, // .diamondplusportal.com
    path: '/',
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  }
}

/**
 * Get all possible cookie names that Supabase might use
 */
export function getSupabaseCookieNames(projectRef: string = 'birthcsvtmayyxrzzyhh'): string[] {
  return [
    `sb-${projectRef}-auth-token`,
    `sb-${projectRef}-auth-token-code-verifier`,
    `sb-${projectRef}-auth-token.0`,
    `sb-${projectRef}-auth-token.1`,
    // Legacy formats
    `sb-access-token`,
    `sb-refresh-token`,
  ]
}

/**
 * Clear all Supabase cookies with all possible domain variations
 * This ensures we clean up any duplicate cookies
 */
export function clearAllSupabaseCookies(
  cookieSetter: (name: string, value: string, options: CookieOptions) => void,
  req?: Request | { headers: Headers }
) {
  const projectRef = 'birthcsvtmayyxrzzyhh'
  const cookieNames = getSupabaseCookieNames(projectRef)
  
  // Get the host to determine domains to clear
  let host = 'diamondplusportal.com'
  if (req) {
    const headers = req instanceof Request ? req.headers : req.headers
    host = headers.get('x-forwarded-host') || headers.get('host') || 'diamondplusportal.com'
  }
  
  // Clear cookies with different domain variations
  const domains = [
    undefined, // No domain (exact host match)
    `.${host.replace('www.', '')}`, // Current subdomain
    '.diamondplusportal.com', // Base domain
  ]
  
  cookieNames.forEach(name => {
    domains.forEach(domain => {
      // Clear with maxAge: 0
      cookieSetter(name, '', {
        path: '/',
        maxAge: 0,
        ...(domain && { domain }),
      })
      
      // Also clear with expires in the past (belt and suspenders)
      cookieSetter(name, '', {
        path: '/',
        expires: new Date(0),
        ...(domain && { domain }),
      })
    })
  })
}
