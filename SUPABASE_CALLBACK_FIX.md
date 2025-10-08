# Supabase PKCE Callback Fix

## Problem
The password reset flow was hanging on `exchangeCodeForSession` because we were trying to handle the OAuth callback in a client component (`page.tsx`), but Supabase's PKCE flow requires server-side handling for proper cookie management.

## Solution
Converted `/auth/callback` from a client component to a server route handler (`route.ts`).

### Key Changes:
1. **Deleted** `/auth/callback/page.tsx` (client component)
2. **Created** `/auth/callback/route.ts` (server route handler)
3. **Added** PKCE configuration to both client and server Supabase instances

### Working Implementation:

```typescript
// /auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const flow = searchParams.get('flow')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createSupabaseServerClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully exchanged - redirect based on flow
      if (flow === 'recovery') {
        return NextResponse.redirect(new URL('/reset-password', request.url))
      }
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Something went wrong
  return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
}
```

## Why This Works
- Server-side handling allows proper HTTP-only cookie management
- The PKCE code exchange happens in a secure server environment
- No client-side timing issues or browser restrictions

## Complete Flow:
1. User requests password reset at `/forgot-password`
2. Email sent with link to Supabase's `/auth/v1/verify`
3. Supabase redirects to `/auth/callback?code=...&flow=recovery`
4. Server exchanges code for session and sets cookies
5. Server redirects to `/reset-password`
6. User updates password and is redirected to login
