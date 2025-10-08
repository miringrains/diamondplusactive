# Supabase Session Duration & Timeout Behavior

## Current Session Configuration

### Cookie Duration
- **Access Token Cookie**: 1 year (`maxAge: 60 * 60 * 24 * 365`)
- **Refresh Token Cookie**: 1 year (`maxAge: 60 * 60 * 24 * 365`)

**Note**: This is just how long the browser stores the cookies, NOT how long the session is valid.

### Actual Session Duration (Supabase Defaults)

By default, Supabase uses these session lifetimes:

1. **Access Token Lifetime**: 1 hour (3,600 seconds)
2. **Refresh Token Lifetime**: 1 week (604,800 seconds)
3. **Session Idle Timeout**: No default idle timeout

### How It Works

```
User Login
    │
    ├─► Access Token (JWT) - Valid for 1 hour
    └─► Refresh Token - Valid for 1 week
         │
         └─► Used to get new Access Token when it expires
```

## What Happens After Timeout?

### 1. Access Token Expires (after 1 hour)
- Supabase client automatically uses the Refresh Token to get a new Access Token
- This happens seamlessly in the background
- User stays logged in without interruption

### 2. Refresh Token Expires (after 1 week of no activity)
- User must log in again
- The middleware (`src/middleware.ts`) will:
  ```javascript
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  ```
- User is redirected to `/login` page

### 3. Active Users
- As long as the user visits the site within 1 week, the session stays active
- Each time the Access Token is refreshed, the Refresh Token's expiry is extended

## Current Implementation Behavior

1. **Page Load on Protected Route**:
   - Middleware checks `supabase.auth.getUser()`
   - If no valid session → Redirect to `/login`
   - If valid session → Allow access

2. **Auto-Refresh**:
   - Supabase SSR client handles token refresh automatically
   - No manual refresh logic needed in the app

3. **Manual Logout**:
   - Clears both tokens
   - Redirects to login page

## Customizing Session Duration

To change session duration, you would need to:

1. **In Supabase Dashboard**:
   - Go to: Settings → Auth → JWT Expiry
   - Adjust "JWT expiry limit" (Access Token)
   - Note: Refresh token duration is fixed at 1 week

2. **For Idle Timeout** (not currently implemented):
   ```javascript
   // Could add to middleware.ts
   const lastActivity = cookies().get('last-activity')
   if (lastActivity && Date.now() - lastActivity > IDLE_TIMEOUT) {
     await supabase.auth.signOut()
     return redirect('/login')
   }
   ```

## Summary

- **Active sessions**: Stay logged in indefinitely (tokens auto-refresh)
- **Inactive for 1 week**: Must log in again
- **Security**: 1-hour Access Token reduces risk if token is compromised
- **User Experience**: Seamless for active users, secure timeout for inactive
