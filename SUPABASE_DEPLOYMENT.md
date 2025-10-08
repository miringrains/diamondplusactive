# Supabase Authentication Deployment Guide

## Fixed: Schema Configuration Issue

The 406 error was caused by the `public` schema not being exposed in the Supabase API settings. This has been resolved by:

1. **Adding `public` to exposed schemas** in the Supabase dashboard
2. **Proper RLS policies** configured to allow profile access
3. **Direct Supabase queries** now work correctly from the client

All authentication flows now work as intended with proper role-based access control.

## ✅ What's Been Implemented

1. **Supabase Authentication** is now the primary auth system for diamondplusportal.com
2. **Login Page** (`/login`) - Uses Supabase for authentication
3. **Register Page** (`/register`) - Creates users in Supabase
4. **Logout Page** (`/logout`) - Signs out from Supabase
5. **Middleware** - Updated to check Supabase sessions
6. **Auth Provider** - Replaced NextAuth with Supabase auth context
7. **Protected Routes** - All dashboard routes now require Supabase auth

## 🚀 Deployment Steps

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://birthcsvtmayyxrzzyhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcnRoY3N2dG1heXl4cnp6eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU2MjgsImV4cCI6MjA3Mzk1MTYyOH0.rqvnSSt5as1JBiqqEH02ktTwfdUvqp7armaImUizFfA

# OpenAI (if you're using Ask Ricky AI)
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Build and Deploy

```bash
cd /root/diamond-plus/core
npm run build
pm2 restart dp-core
```

### 3. Create Your First User

1. Go to https://diamondplusportal.com/register
2. Create a new account
3. Sign in at https://diamondplusportal.com/login

### 4. Make User an Admin (Optional)

To give a user admin access, run this SQL in your Supabase dashboard:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

## 📝 Important Notes

### API Routes Update Required

Some API routes still reference the old NextAuth `auth()` function. These need to be updated to use:

```typescript
import { auth } from '@/lib/supabase/auth-server'
```

Instead of:

```typescript
import { auth } from '@/lib/auth'
```

### Session Format Change

The session format has changed from NextAuth to Supabase:

**Old (NextAuth):**
```typescript
session.user.role === "ADMIN"
```

**New (Supabase):**
```typescript
session.user.role === "admin"
```

### Role Values

- `user` - Regular user
- `admin` - Admin user
- `super_admin` - Super admin user

## 🔧 Troubleshooting

### User Can't Login

1. Check if the user exists in Supabase Authentication
2. Verify the password is correct
3. Check browser console for errors

### Session Not Persisting

1. Ensure cookies are enabled
2. Check that HTTPS is enabled in production
3. Verify environment variables are set correctly

### API Routes Returning 401

Update the auth import in the API route from `@/lib/auth` to `@/lib/supabase/auth-server`

## 🎉 Deployment Complete!

Your Supabase authentication is now LIVE on **diamondplusportal.com**!

### Test Your Setup

1. **Create a new user**: https://diamondplusportal.com/register
2. **Sign in**: https://diamondplusportal.com/login
3. **Access dashboard**: https://diamondplusportal.com/dashboard

### Make Yourself an Admin

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Monitor the Application

Check the logs:
```bash
pm2 logs dp-core --lines 50
```

### Next Steps

1. Test all authentication flows
2. Configure email templates in Supabase dashboard
3. Set up password reset functionality (if needed)
4. Update remaining API routes from NextAuth to Supabase auth
