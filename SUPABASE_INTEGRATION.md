# Supabase Integration Guide for Diamond+

## Configuration Completed

### 1. Database Schema
- ✅ `profiles` table with Diamond+ user ID linking
- ✅ `session_sync` table for session management
- ✅ RLS policies for secure access
- ✅ Automatic user sync triggers
- ✅ Helper functions for migration

### 2. Supabase Connection Details
- **Project URL**: `https://birthcsvtmayyxrzzyhh.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (stored in client files)
- **API Keys**: 
  - Publishable: `sb_publishable_57VLnklcIHh9IBK9bdnsWQ_xHEQ7xkE`
  - Secret: `sb_secret_kEKD2WU95tUFLSZ-DBt8tA_mv-nlhef`

### 3. Files Created
- `/src/lib/supabase/client.ts` - Browser client
- `/src/lib/supabase/server.ts` - Server client for SSR
- `/src/lib/supabase/database.types.ts` - TypeScript types
- `/src/middleware.ts` - Main middleware with Supabase session refresh
- `/src/lib/supabase/auth-helpers.ts` - Auth integration helpers
- `/src/components/providers/hybrid-auth-provider.tsx` - React context for dual auth

## Integration Steps

### Step 1: Update Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://birthcsvtmayyxrzzyhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcnRoY3N2dG1heXl4cnp6eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU2MjgsImV4cCI6MjA3Mzk1MTYyOH0.rqvnSSt5as1JBiqqEH02ktTwfdUvqp7armaImUizFfA
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Step 2: Middleware Configuration
The `middleware.ts` now includes proper Supabase session refresh:
```typescript
// The middleware automatically refreshes auth tokens using auth.getUser()
// This is critical for PKCE flow and proper session management
// See /src/middleware.ts for the full implementation
```

### Step 3: Wrap App with Hybrid Auth Provider
In your root layout:
```typescript
import { HybridAuthProvider } from '@/components/providers/hybrid-auth-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <SessionProvider>
          <HybridAuthProvider>
            {children}
          </HybridAuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
```

### Step 4: Use Hybrid Auth in Components
```typescript
import { useHybridAuth } from '@/components/providers/hybrid-auth-provider'

export function MyComponent() {
  const { 
    isAuthenticated, 
    nextAuthSession, 
    supabaseUser 
  } = useHybridAuth()
  
  // Your component logic...
}
```

## Migration Strategy

### Phase 1: Parallel Authentication (Current)
- Both NextAuth and Supabase work side-by-side
- Users can authenticate with either system
- Sessions are synced between systems

### Phase 2: Gradual Feature Migration
1. Start with non-critical features (e.g., user preferences)
2. Move to Supabase RLS for new API endpoints
3. Migrate existing endpoints one by one

### Phase 3: Full Migration
1. Move all authentication to Supabase
2. Keep existing user data in your database
3. Use Supabase for sessions and JWT tokens only

## API Usage Examples

### Server-Side (App Router)
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Your API logic...
}
```

### Client-Side
```typescript
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const supabase = getSupabaseBrowserClient()

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .single()
```

## Security Best Practices

1. **Never expose service role key** - Only use in server-side code
2. **Use RLS policies** - All tables should have RLS enabled
3. **Validate JWT tokens** - Always verify tokens server-side
4. **Sync user roles** - Keep roles synchronized between systems

## Support & Next Steps

1. Test authentication flow with a test user
2. Implement user migration script for existing users
3. Set up monitoring for auth events
4. Configure email templates in Supabase dashboard
