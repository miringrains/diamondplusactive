# Authentication Debug Guide

## Issue: "Something went wrong!" when returning to a lesson

### Symptoms
- User briefly sees the video before error screen appears
- Error shows "The lesson might not exist or has been removed"
- Only happens when returning to a previously started lesson

### Root Cause
The authentication is failing on client-side API requests. The server-side render succeeds (that's why you see the video briefly), but subsequent client-side requests fail authentication.

### Debugging Steps

1. **Check PM2 Logs**
```bash
pm2 logs diamond-district --lines 100 | grep -E "(Auth failed|Video API|Progress)"
```

2. **Check OpenTelemetry Traces**
```bash
# Look for auth failures
grep "auth.failed" /var/log/otel-collector/traces.json | jq .
```

3. **Test Authentication Flow**
```bash
# Test if cookies are being sent properly
curl -I https://watch.zerotodiamond.com/lessons/[LESSON_ID] -v 2>&1 | grep -i cookie
```

### Common Causes

1. **Cookie Configuration Issues**
   - Secure cookies not working properly
   - SameSite policy preventing cookies on API requests
   - Cookie prefix mismatch between server and client

2. **CORS/Origin Issues**
   - Client-side requests from different origin
   - Missing CORS headers on API routes

3. **Session Timeout**
   - JWT token expired
   - Session not being refreshed properly

4. **Race Conditions**
   - Client trying to fetch data before auth is established
   - Multiple concurrent requests causing auth state issues

### Quick Fixes to Try

1. **Clear Browser Data**
   - Clear all cookies for watch.zerotodiamond.com
   - Try in incognito/private browsing mode

2. **Force Refresh**
   - Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
   - This forces server-side render which often works

3. **Check Console**
   - Open browser developer console
   - Look for 401 errors on API calls
   - Check if cookies are being sent with requests

### Monitoring Commands

```bash
# Watch for auth failures in real-time
pm2 logs diamond-district | grep -E "(No session|Auth failed|401)"

# Check recent API errors
tail -f /var/log/otel-collector/traces.json | jq 'select(.attributes[]?.key=="auth.failed")'

# Monitor video API calls
pm2 logs diamond-district | grep "Video API"
```

### Permanent Solutions

1. **Update Cookie Configuration**
   - Ensure SameSite=None for cross-origin requests
   - Add proper CORS headers to API routes

2. **Implement Token Refresh**
   - Add middleware to refresh JWT tokens
   - Handle token expiration gracefully

3. **Add Client-Side Auth Check**
   - Check auth status before making API calls
   - Implement retry logic with auth refresh

4. **Better Error Handling**
   - Show more specific error messages
   - Add retry button that refreshes auth
