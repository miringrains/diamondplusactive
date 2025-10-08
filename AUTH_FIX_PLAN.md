# Auth Pages Fix Plan - Diamond Plus Portal

## Executive Summary

**Problem**: Auth pages (register, reset-password, set-password) are client components that can't access cookies during build, causing static rendering and breaking auth flows.

**Solution**: Convert to server components following the working `/login` pattern:
1. Server component handles auth checks and receives searchParams (makes it dynamic)
2. Client component handles only the form UI and interactions
3. No "use client" on page.tsx files
4. All cookie/session checks happen server-side

**Result**: All auth pages will render dynamically (ƒ) and work correctly with Supabase auth.

## Current Status

### ❌ Broken Auth Pages (Static Rendered - ○)
1. `/register` - 27.5 kB - Client component
2. `/reset-password` - 4.26 kB - Client component  
3. `/set-password` - 6.09 kB - Client component
4. `/logout` - 1.69 kB - Client component
5. `/debug-invite` - 1.55 kB - Unknown
6. `/test-auth-flow` - 4.14 kB - Unknown
7. `/test-ghl-user` - 1.6 kB - Unknown

### ✅ Working Auth Pages (Dynamic Rendered - ƒ)
1. `/login` - 4.97 kB - Server component with client form
2. `/auth/confirm` - API route (already dynamic)
3. `/auth/signout` - API route (already dynamic)

## Root Cause
Client components (`"use client"`) cannot access cookies during static generation, breaking auth flows that need session/token validation.

## Fix Strategy

### Option A: Quick Fix (Add Dynamic Export)
Add to each broken page:
```typescript
export const dynamic = 'force-dynamic'
```

### Option B: Proper Fix (Convert to Server Components)
Follow the `/login` pattern:
1. Server component for page (no "use client")
2. Accept searchParams (makes it dynamic automatically)
3. Client component for form only
4. Pass messages/errors as props

**Note**: The login page is dynamic because it uses `searchParams`. This is cleaner than forcing dynamic.

## Implementation Plan

### Phase 1: Register Page
**File**: `/src/app/(auth)/register/page.tsx`

**Current Structure**:
```typescript
"use client"
// All logic in client component
// Direct Supabase calls
// Client-side redirects
```

**Target Structure**:
```typescript
// page.tsx - Server Component (NO "use client")
import RegisterForm from './register-form'
import Image from "next/image"
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Check if already logged in
  const session = await auth()
  if (session) {
    redirect('/dashboard')
  }

  const message = searchParams?.message as string
  const error = searchParams?.error as string
  
  return (
    <div className="flex min-h-screen">
      {/* Left side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <RegisterForm message={message} error={error} />
        </div>
      </div>
      {/* Right side - Same as login */}
    </div>
  )
}

// register-form.tsx - Client Component (MOVE all existing logic here)
"use client"
// Move ALL the existing register page content here
// Keep the exact same implementation
// Just wrap it to accept props
```

### Phase 2: Reset Password Page
**File**: `/src/app/(auth)/reset-password/page.tsx`

**Current Issues**:
- Client component checking for session
- Can't validate reset token server-side
- Vulnerable to client-side manipulation

**Target Structure**:
```typescript
// page.tsx - Server Component
export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage() {
  // Verify session from /auth/confirm route
  const session = await auth()
  if (!session) {
    return <InvalidTokenMessage />
  }
  
  return <ResetPasswordForm />
}
```

### Phase 3: Set Password Page
**File**: `/src/app/(auth)/set-password/page.tsx`

**Similar to reset-password**:
- Must validate session server-side
- Must check if user needs password set
- Must handle invite flows

### Phase 4: Logout Page
**File**: `/src/app/(auth)/logout/page.tsx`

**Should be simple redirect**:
```typescript
import { redirect } from 'next/navigation'

export default async function LogoutPage() {
  // Simply redirect to the signout API route
  redirect('/auth/signout')
}
```

## Code Migration Pattern

### Before (Client Component):
```typescript
"use client"
export default function RegisterPage() {
  const [state, setState] = useState()
  // All logic here
  return <form>...</form>
}
```

### After (Split Architecture):
```typescript
// page.tsx - Server Component
export default async function RegisterPage({ searchParams }) {
  const session = await auth()
  if (session) redirect('/dashboard')
  
  return <RegisterForm {...searchParams} />
}

// register-form.tsx - Client Component  
"use client"
export default function RegisterForm({ message, error }) {
  const [state, setState] = useState()
  // All logic moved here
  return <form>...</form>
}
```

## Critical Consistency Points

### 1. Session Handling
All pages MUST use the same auth check:
```typescript
import { auth } from '@/lib/auth'

const session = await auth()
```

### 2. Supabase Client Usage
- Server components: `createSupabaseServerClient()`
- Client components: `getSupabaseBrowserClient()`
- Never mix them!

### 3. Redirect Patterns
```typescript
// Server component
import { redirect } from 'next/navigation'
redirect('/dashboard')

// Client component
import { useRouter } from 'next/navigation'
router.push('/dashboard')
```

### 4. Error Handling
- Server: Return error components
- Client: Set error state
- API routes: Return JSON errors

### 5. Cookie Management
All auth cookies must be set server-side:
- In API routes
- In server actions
- Never in client components

## File Modification List

### Primary Files to Modify
1. `/src/app/(auth)/register/page.tsx` - Split into page + form
2. `/src/app/(auth)/reset-password/page.tsx` - Convert to server
3. `/src/app/(auth)/set-password/page.tsx` - Convert to server
4. `/src/app/(auth)/logout/page.tsx` - Simplify to redirect

### New Files to Create
1. `/src/app/(auth)/register/register-form.tsx` - Client form
2. `/src/app/(auth)/reset-password/reset-password-form.tsx` - Client form
3. `/src/app/(auth)/set-password/set-password-form.tsx` - Client form

### Files to Review/Update
1. `/src/lib/auth.ts` - Ensure consistent auth helpers
2. `/src/middleware.ts` - Verify public routes list
3. `/src/app/(auth)/layout.tsx` - Consider adding dynamic export here

## Testing Checklist

### Register Flow
- [ ] Can register new user
- [ ] Redirects if already logged in
- [ ] Shows validation errors
- [ ] Sends confirmation email
- [ ] Handles duplicate emails

### Reset Password Flow
- [ ] Can request reset email
- [ ] Email contains valid link
- [ ] Link validates on server
- [ ] Can set new password
- [ ] Old password no longer works

### Set Password Flow
- [ ] Invite links work
- [ ] Session persists after setting
- [ ] Redirects to intended page
- [ ] Handles expired tokens

### Logout Flow
- [ ] Clears all cookies
- [ ] Redirects to login
- [ ] Can't access protected pages

## Rollback Plan

If issues arise:
```bash
# Restore from backup
git pull https://github.com/miringrains/DiamondPlusPortal.git main --force
```

## Implementation Checklist

### Step 1: Create Form Components
- [ ] Create `/src/app/(auth)/register/register-form.tsx`
- [ ] Create `/src/app/(auth)/reset-password/reset-password-form.tsx`  
- [ ] Create `/src/app/(auth)/set-password/set-password-form.tsx`

### Step 2: Convert Pages to Server Components
- [ ] Update `/src/app/(auth)/register/page.tsx` - Remove "use client", add searchParams
- [ ] Update `/src/app/(auth)/reset-password/page.tsx` - Remove "use client", add searchParams
- [ ] Update `/src/app/(auth)/set-password/page.tsx` - Remove "use client", add searchParams
- [ ] Update `/src/app/(auth)/logout/page.tsx` - Simple redirect

### Step 3: Move Logic to Form Components
- [ ] Move all useState, useEffect, form handling to form components
- [ ] Keep exact same logic, just wrapped in component
- [ ] Accept message/error props from parent

### Step 4: Add Server-Side Auth Checks
- [ ] Import `auth` from `@/lib/auth` in each page
- [ ] Check session and redirect if needed
- [ ] Handle error states server-side

### Step 5: Test Each Flow
- [ ] Build and verify all pages show ƒ (dynamic)
- [ ] Test registration with validation
- [ ] Test password reset email flow
- [ ] Test invite/set password flow
- [ ] Test logout clears session

## Common Pitfalls to Avoid

1. **Don't forget searchParams** - This makes pages dynamic automatically
2. **Don't mix client/server imports** - Keep them separate
3. **Don't use useRouter in server components** - Use redirect() instead
4. **Don't access cookies in client components** - Only in server components
5. **Keep the same URLs** - Don't change routes, just implementation

## Success Criteria

Build output should show:
```
├ ƒ /register       (was ○)
├ ƒ /reset-password (was ○)
├ ƒ /set-password   (was ○)
├ ƒ /logout         (was ○)
```

All auth flows working without:
- "Dynamic server usage" errors
- Cookie access errors
- Hydration mismatches
- Auth state inconsistencies

## Emergency Rollback

```bash
# If anything goes wrong
cd /root/diamond-plus/core
git pull https://github.com/miringrains/DiamondPlusPortal.git main --force
pm2 restart dp-core
```
