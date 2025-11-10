# Diamond Plus Cleanup Action Plan

## 🎯 Primary Goal
**PRESERVE `diamondplusportal.com` functionality** - This is the ONLY critical system that must remain stable.

## ⚠️ CRITICAL: Password Reset System

### Current Situation:
- **Admin Bypass** (`/api/admin-reset-password`) - **MUST BE PRESERVED**
  - This is the ONLY reliable way for users to set first-time passwords
  - Uses service role key to bypass all Supabase auth issues
  - Currently used by both `/reset-password` and `/set-password` pages
  
- **The Problem**: Supabase password reset is broken
  - PKCE recovery session not established correctly
  - Code verifier cookies conflict/fail through redirects
  - `updateUser()` silently hangs instead of updating password
  - Multiple conflicting implementations scattered across auth pages

### What to Keep:
```
PRESERVE THESE FILES:
✅ /core/src/app/api/admin-reset-password/route.ts
✅ /core/src/app/(auth)/set-password/
✅ /core/src/app/(auth)/reset-password/
✅ SUPABASE_SERVICE_ROLE_KEY in environment
```

### What's a Mess (Document Before Removing):
```
REVIEW THESE BEFORE CLEANUP:
❓ /core/src/app/(auth)/test-auth-flow/
❓ /core/src/app/(auth)/test-password-reset/
❓ /core/src/app/(auth)/test-pkce-flow/
❓ /core/src/app/(auth)/debug-auth-session/
❓ /core/src/app/(auth)/debug-password-reset/
❓ /core/src/app/api/debug-update-password/
❓ /core/src/app/api/reset-password/
❓ Multiple PKCE/token/OTP implementations
```

### Testing Password Reset:
```bash
# Test admin bypass is working
curl -X POST https://diamondplusportal.com/api/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newpassword123",
    "token": "'$(echo -n "test@example.com:recovery" | base64)'"
  }'

# Test set-password page
open https://diamondplusportal.com/set-password?email=test@example.com

# Test reset-password page
open https://diamondplusportal.com/reset-password
```

## 📋 Pre-Cleanup Checklist

### 1. Verify Current Functionality
```bash
# Check that dp-core is running properly
pm2 status dp-core
pm2 logs dp-core --lines 50

# Test critical endpoints
curl https://diamondplusportal.com
curl https://diamondplusportal.com/api/auth/session
```

### 2. Create Backups
```bash
# Backup current working state
cd /root/diamond-plus
tar -czf ../diamond-plus-backup-$(date +%Y%m%d).tar.gz .

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 ~/pm2-backup-$(date +%Y%m%d).pm2

# Note current environment
pm2 info dp-core > ~/dp-core-info-backup.txt
```

## 🧹 Phase 1: Remove Inactive Services (Safe)

### Step 1.1: Stop and Delete Unused PM2 Processes
```bash
# Remove development environments
pm2 delete dp-dev
pm2 delete dp-staging
pm2 delete diamond-plus-preview

# Keep dp-admin for now (foundation for later)
# pm2 stop dp-admin  # Just stop it, don't delete

# Save PM2 state
pm2 save
```

### Step 1.2: Remove Nginx Configs for Inactive Domains
```bash
# Disable staging and dev sites
sudo rm /etc/nginx/sites-enabled/staging.diamondplusportal.com
sudo rm /etc/nginx/sites-enabled/dev.diamondplusportal.com

# Archive the configs (don't delete)
sudo mkdir -p /etc/nginx/archived-sites
sudo mv /etc/nginx/sites-available/staging.diamondplusportal.com /etc/nginx/archived-sites/
sudo mv /etc/nginx/sites-available/dev.diamondplusportal.com /etc/nginx/archived-sites/

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 🗑️ Phase 2: Clean Up Core Platform Files

### Step 2.1: Remove Admin Components from Core
```bash
cd /root/diamond-plus/core

# Remove admin components that shouldn't be in core
rm -rf src/components/admin/

# Remove admin-specific API routes
rm -rf src/app/admin/
rm -rf src/app/api/admin/
```

### Step 2.2: Remove Duplicate Video Players
```bash
# Keep only the essential players
cd /root/diamond-plus/core/src/components

# Remove duplicates (keeping MuxPlayerEnhanced.tsx)
rm -f video-player.tsx
rm -f video-player-client.tsx
rm -f video-player-disabled.tsx
rm -f video-player-enhanced.tsx
rm -f video-player-error-boundary.tsx
rm -f video-island.tsx
rm -f MuxPlayerUncontrolled.tsx
rm -f MuxLessonPlayer.tsx
rm -f simple-mux-player.tsx

# Verify the kept files exist
ls -la MuxPlayerEnhanced.tsx simple-mux-player-enhanced.tsx podcast-player.tsx hls-audio-player.tsx
```

### Step 2.3: Remove Unused Upload Infrastructure
```bash
cd /root/diamond-plus/core

# Remove S3 and upload-related code
rm -f src/lib/s3.ts
rm -f src/lib/s3-multipart.ts
rm -f src/lib/upload-manager.ts
rm -f src/lib/video-processor.ts

# Remove upload API routes
rm -rf src/app/api/upload/
rm -rf src/app/api/uploadthing/
rm -rf src/app/api/videos/

# Remove upload directories
rm -rf uploads/
```

### Step 2.4: Remove OpenTelemetry
```bash
cd /root/diamond-plus/core

# Remove telemetry code
rm -rf src/lib/telemetry/
rm -f src/lib/otel.ts
rm -f src/instrumentation.ts
```

### Step 2.5: Clean Up Test and Legacy Files (WITH CAUTION)
```bash
cd /root/diamond-plus

# FIRST: Document password reset test pages before removal
echo "=== Password Reset Test Pages Content ===" > password-reset-backup.txt
cat core/src/app/(auth)/test-auth-flow/page.tsx >> password-reset-backup.txt 2>/dev/null
cat core/src/app/(auth)/test-password-reset/page.tsx >> password-reset-backup.txt 2>/dev/null
cat core/src/app/(auth)/test-pkce-flow/page.tsx >> password-reset-backup.txt 2>/dev/null
cat core/src/app/(auth)/debug-auth-session/page.tsx >> password-reset-backup.txt 2>/dev/null
cat core/src/app/(auth)/debug-password-reset/page.tsx >> password-reset-backup.txt 2>/dev/null

# Remove test files from root
rm -f core/test-*.js
rm -f core/fix-*.js
rm -f admin/test-*.js
rm -f admin/fix-*.js

# Remove auth test/debug pages (after backing up)
rm -rf core/src/app/(auth)/test-auth-flow/
rm -rf core/src/app/(auth)/test-password-reset/
rm -rf core/src/app/(auth)/test-pkce-flow/
rm -rf core/src/app/(auth)/debug-auth-session/
rm -rf core/src/app/(auth)/debug-password-reset/
rm -rf core/src/app/api/debug-update-password/

# Remove media files that shouldn't be in repo
rm -f core/public/*.mp4
rm -f core/public/*.webp
rm -f admin/*.mp4
rm -f admin/*.mp3
rm -f admin/*.webp

# Clean up duplicate configs
rm -f core/next.config.js  # Keep only .ts version
rm -f core/ecosystem.config.js  # Keep only .prod version
```

### Step 2.6: Archive Documentation
```bash
cd /root/diamond-plus

# Create archive directory
mkdir -p archived-docs/core
mkdir -p archived-docs/admin

# Move old documentation (keep only essential ones)
mv core/*.md archived-docs/core/ 2>/dev/null || true
mv admin/*.md archived-docs/admin/ 2>/dev/null || true

# Restore essential docs
mv archived-docs/core/README.md core/ 2>/dev/null || true
```

## 📦 Phase 3: Update Dependencies

### Step 3.1: Update Core package.json
```bash
cd /root/diamond-plus/core

# Create a clean package.json removing unused dependencies
# First, backup current one
cp package.json package.json.backup
```

Create new minimal `package.json`:
```json
{
  "name": "diamond-plus-core",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@auth/prisma-adapter": "^2.10.0",
    "@hookform/resolvers": "^5.2.1",
    "@mux/mux-node": "^12.4.0",
    "@mux/mux-player-react": "^3.5.3",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/ssr": "^0.7.0",
    "@supabase/supabase-js": "^2.75.0",
    "@tanstack/react-query": "^5.84.1",
    "@types/jsonwebtoken": "^9.0.10",
    "axios": "^1.11.0",
    "bcryptjs": "^3.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.23.22",
    "googleapis": "^161.0.0",
    "jsonwebtoken": "^9.0.2",
    "lodash.debounce": "^4.0.8",
    "lodash.throttle": "^4.1.1",
    "lucide-react": "^0.536.0",
    "next": "15.4.5",
    "next-themes": "^0.4.6",
    "openai": "^6.2.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.62.0",
    "react-intersection-observer": "^9.16.0",
    "sharp": "^0.34.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "zod": "^4.0.14"
  },
  "devDependencies": {
    "@prisma/client": "^6.13.0",
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.19.9",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^16.5.1",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "prisma": "^6.13.0",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "tsx": "^4.20.4",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### Step 3.2: Reinstall Dependencies
```bash
cd /root/diamond-plus/core

# Remove old modules and lock file
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install

# Verify build still works
npm run build
```

## 🔒 Phase 4: Secure Diamond District Separation

### Step 4.1: Remove Any Diamond District References
```bash
cd /root/diamond-plus

# Find and review any cross-references
grep -r "watch.zerotodiamond\|diamond-district\|dd_" core/ --exclude-dir=node_modules --exclude-dir=.next

# Remove any found references (manually review each)
```

### Step 4.2: Ensure Complete Separation
```bash
# Verify no shared dependencies or configs
ls -la /root/diamond-district/  # This should be completely separate
ls -la /root/diamond-plus/     # This should have no references to above
```

## ✅ Phase 5: Final Testing & Verification

### Step 5.1: Test Core Functionality
```bash
cd /root/diamond-plus/core

# Restart the application
pm2 restart dp-core

# Monitor logs
pm2 logs dp-core --lines 100

# Test critical features:
# 1. Login: https://diamondplusportal.com/login
# 2. Dashboard: https://diamondplusportal.com/dashboard
# 3. Video playback
# 4. Google Calendar integration
# 5. AI bot functionality
# 6. PASSWORD RESET (CRITICAL):
#    - Set Password: https://diamondplusportal.com/set-password?email=test@example.com
#    - Reset Password: https://diamondplusportal.com/reset-password
#    - Verify admin bypass endpoint works
```

### Step 5.2: Clean PM2 and System
```bash
# Clean PM2 logs
pm2 flush

# Update PM2 startup
pm2 save
pm2 startup systemd -u root --hp /root

# Clean system
apt autoremove -y
apt autoclean
```

## 🔄 Phase 6: Admin Portal (Future Reference)

### Current State:
- Admin portal foundation exists at `/root/diamond-plus/admin`
- Currently broken and not in use
- Manual video uploads being done directly to Mux/database

### When Ready to Fix:
1. Debug Supabase auth integration
2. Fix Mux upload functionality
3. Implement proper content management UI
4. Test thoroughly before going live

### For Now:
```bash
# Just stop the admin portal
pm2 stop dp-admin
# Don't delete - keep foundation for later
```

## 📊 Expected Results

After cleanup:
- ✅ `diamondplusportal.com` fully functional
- ✅ Password reset admin bypass still working
- ✅ Cleaner codebase (50%+ less files)
- ✅ Faster builds and deploys
- ✅ Lower server resource usage
- ✅ Clear separation from Diamond District
- ✅ Admin portal foundation preserved for future

## 🔴 Known Issues to Address Later

1. **Password Reset Complexity**:
   - Multiple conflicting PKCE/token/OTP implementations
   - Supabase recovery flow broken (cookies/redirects)
   - Currently relying on admin bypass workaround
   - Need to clean up and consolidate in future

   Future Action: Once the system is fully cleaned and stable, revisit Supabase PKCE/OTP integration from scratch using a single recovery path and explicit cookie binding.


2. **Admin Portal**:
   - Upload functionality broken
   - Needs proper Mux integration fixes
   - Currently doing manual uploads

## ⚠️ Rollback Plan

If anything breaks:
```bash
# Restore from backup
cd /root
tar -xzf diamond-plus-backup-[date].tar.gz

# Restore PM2 state
pm2 resurrect ~/pm2-backup-[date].pm2

# Rebuild and restart
cd /root/diamond-plus/core
npm install
npm run build
pm2 restart dp-core
```

## 🚦 Execution Order

1. **Do Phase 1 first** - Remove PM2 processes (very safe)
2. **Test diamondplusportal.com** - Ensure still working
3. **Do Phase 2** - File cleanup (moderate risk)
4. **Test again**
5. **Do Phase 3** - Update dependencies (higher risk)
6. **Full testing**
7. **Do Phase 4-5** - Final cleanup and verification

Take breaks between phases and test thoroughly!
