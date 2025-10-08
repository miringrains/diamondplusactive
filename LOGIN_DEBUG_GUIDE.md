# Login Debugging Guide

## Issue Fixed
The login button wasn't working because the loading state was stuck. This has been fixed.

## How to Test Login

1. **Open Browser Developer Console** (F12)
2. **Go to**: https://diamondplusportal.com/login
3. **Check Console Tab** for any red errors
4. **Try logging in** with your credentials:
   - Email: kevin@breakthruweb.com
   - Password: Lovemym60@

## What Should Happen

1. Click "Sign in" button
2. Button shows "Signing in..." with spinner
3. After 1-2 seconds, you should be redirected to /dashboard
4. If error, you'll see a red error message

## Common Issues & Solutions

### Issue: Button clicks but nothing happens
**Check**: Browser console for JavaScript errors
**Fix**: Clear browser cache and cookies, then reload

### Issue: "Invalid credentials" error
**Check**: Verify user exists in Supabase Dashboard
**Fix**: Check password is correct or reset password

### Issue: Redirects to localhost
**This was fixed** - login now redirects to https://diamondplusportal.com/dashboard

### Issue: Stuck on "Signing in..."
**This was fixed** - loading state now properly resets

## Debug Commands

```bash
# Check if app is running
pm2 list

# Check recent logs
pm2 logs dp-core --lines 50

# Test login endpoint
curl -X POST https://diamondplusportal.com/api/supabase-login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}' \
  -v

# Restart app if needed
cd /root/diamond-plus/core
pm2 restart dp-core --update-env
```

## Browser Console Debug

Paste this in browser console while on login page:

```javascript
// Test form submission
document.querySelector('form').addEventListener('submit', (e) => {
  console.log('Form submitted!');
});

// Check if buttons are clickable
document.querySelectorAll('button').forEach((btn, i) => {
  console.log(`Button ${i}:`, btn.textContent, 'Disabled:', btn.disabled);
});

// Monitor network requests
console.log('Monitoring network requests to /api/supabase-login...');
```

## If Still Not Working

1. **Clear ALL browser data** for diamondplusportal.com
2. **Try incognito/private mode**
3. **Try a different browser**
4. **Check PM2 logs**: `pm2 logs dp-core --lines 100`
