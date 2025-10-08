# 🚀 Diamond Plus CORE - Quick Start Guide

## What is Diamond Plus CORE?
The main Diamond Plus platform (diamondplusportal.com) - an 8-module business acceleration platform for real estate agents.

## Key Commands

### Start/Stop/Restart
```bash
cd /root/diamond-plus/core
pm2 restart dp-core
pm2 logs dp-core --lines 50
```

### Deploy Changes
```bash
cd /root/diamond-plus/core
git pull origin main
npm install
npm run build
pm2 restart dp-core
```

### Check Status
```bash
pm2 list                    # See all apps
pm2 info dp-core           # Detailed info
pm2 logs dp-core --lines 100  # View logs
```

## File Locations

### Important Files
- **Login Page**: `src/app/(auth)/login/login-form.tsx`
- **Middleware**: `src/middleware.ts`
- **Auth Config**: `src/lib/auth.ts`
- **Environment**: `.env` and `.env.local`
- **PM2 Config**: `ecosystem.config.js`

### Key Directories
- **Pages**: `src/app/(dashboard)/`
- **API Routes**: `src/app/api/`
- **Components**: `src/components/`
- **Lib/Utils**: `src/lib/`

## Authentication

### Test User
- Email: `kevin@breakthruweb.com`
- Password: `Lovemym60@`
- URL: https://diamondplusportal.com/login

### How Auth Works
1. User submits login form
2. POST to `/api/supabase-login`
3. Supabase validates credentials
4. Server sets cookies (`sb-access-token`, `sb-refresh-token`)
5. Redirects to `/dashboard`
6. Middleware checks cookies on protected routes

## Common Tasks

### Add New User
1. Go to https://supabase.com/dashboard
2. Select project: birthcsvtmayyxrzzyhh
3. Authentication > Users > Add user
4. Check "Auto Confirm User"

### Check Logs
```bash
# Real-time logs
pm2 logs dp-core

# Last 100 lines
pm2 logs dp-core --lines 100

# Clear logs
pm2 flush dp-core
```

### Fix "Cannot GET /route" Errors
```bash
cd /root/diamond-plus/core
npm run build
pm2 restart dp-core
```

### Update Environment Variables
1. Edit `.env` or `.env.local`
2. Restart with: `pm2 restart dp-core --update-env`

## Quick Debugging

### Login Not Working?
1. Check server is running: `pm2 list`
2. Check logs: `pm2 logs dp-core --lines 50`
3. Test endpoint: `node scripts/test-login.js`
4. Clear browser cookies

**Login works but redirects back to login?**
- This is a cookie handling issue (Fixed Sept 21, 2025)
- Middleware must use proper Supabase cookie methods
- Don't manually set auth cookies
- See COMPLETE_SYSTEM_DOCUMENTATION.md > Common Issues

### Page Not Loading?
1. Check if route exists: `ls src/app/(dashboard)/`
2. Check middleware exclusions in `src/middleware.ts`
3. Rebuild if needed: `npm run build && pm2 restart dp-core`

### Database Issues?
1. Check Supabase status: https://status.supabase.com/
2. Verify env vars are set: `grep SUPABASE .env`
3. Test connection in Supabase dashboard

## Port Reference
- 3020: Diamond Plus CORE (this app)
- 3021: Diamond Plus Admin
- 3000: Diamond District (watch.zerotodiamond.com)

## URLs
- **Live Site**: https://diamondplusportal.com
- **Admin**: https://admin.diamondplusportal.com
- **Supabase**: https://supabase.com/dashboard/project/birthcsvtmayyxrzzyhh

---
Remember: This is the CORE app for Diamond Plus, not Diamond District!
