# Smart Cleanup Plan - Diamond Plus

## 🎯 New Strategy: Clean What Matters, Leave Working Code Alone

### Key Insight
OpenTelemetry is **disabled** and harmless. Removing it caused 100+ syntax errors for zero benefit.

## ✅ What We've Already Done Successfully
1. **Removed inactive PM2 processes** ✓
   - dp-dev, dp-staging, diamond-plus-preview
   - Freed up resources
   
2. **Archived Nginx configs** ✓
   - staging.diamondplusportal.com
   - dev.diamondplusportal.com

## 📋 Smart Cleanup Targets (What Actually Matters)

### 1. **Remove Unused Dependencies** (HIGH VALUE)
These are actively bloating node_modules and build size:
```json
// Can safely remove from package.json:
"@aws-sdk/client-s3": "^3.701.0",
"@aws-sdk/lib-storage": "^3.701.0", 
"@aws-sdk/s3-request-presigner": "^3.701.0",
"uploadthing": "^7.8.0",
"@uploadthing/react": "^7.4.0",
"socket.io": "^4.8.1",
"socket.io-client": "^4.8.1",
"bullmq": "^5.33.1",
"ioredis": "^5.4.2",
"fluent-ffmpeg": "^2.1.3",
"formidable": "^4.0.1",
"plyr": "^3.8.1",
"plyr-react": "^6.0.1",
"hls.js": "^1.5.17"
```

### 2. **Remove Dead Code** (MEDIUM VALUE)
Only remove code that's truly unused:
```bash
# Test/debug pages (already removed earlier)
/core/src/app/(auth)/test-*
/core/src/app/(auth)/debug-*

# Unused API routes
/core/src/app/api/upload/     # S3 upload
/core/src/app/api/uploadthing/
/core/src/app/api/videos/     # Direct video serving

# Unused components
/core/src/components/video-player-*.tsx  # Keep MuxPlayerEnhanced
/core/src/components/admin/   # Admin components in core
```

### 3. **Remove Media Files** (HIGH VALUE - Storage)
```bash
# These shouldn't be in Git
/core/public/*.mp4
/core/public/*.webp
/admin/*.mp4
/admin/*.mp3
```

### 4. **Clean Configuration** (LOW RISK)
```bash
# Remove duplicate configs
/core/next.config.js    # Keep .ts version
/core/ecosystem.config.js  # Keep .prod version
```

## 🚫 What NOT to Touch
1. **OpenTelemetry** - It's disabled and harmless
2. **Any auth-related code** - Too risky
3. **Mux integration** - Core functionality
4. **Supabase code** - Core functionality
5. **Any file currently in use**

## 📝 Safe Cleanup Process

### Step 1: Remove Unused Dependencies
```bash
cd /root/diamond-plus/core

# Backup current package.json
cp package.json package.json.backup-$(date +%Y%m%d)

# Remove unused dependencies
npm uninstall @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
npm uninstall uploadthing @uploadthing/react
npm uninstall socket.io socket.io-client bullmq ioredis
npm uninstall fluent-ffmpeg formidable plyr plyr-react hls.js

# Rebuild to verify
npm run build
```

### Step 2: Remove Truly Dead Code
```bash
# Only remove files that have NO imports
# Use grep to verify each file before removal

# Example check:
grep -r "from.*s3\.ts" src/  # If no results, safe to remove src/lib/s3.ts
```

### Step 3: Remove Media Files
```bash
# Remove video/audio files from repo
find . -name "*.mp4" -o -name "*.mp3" -o -name "*.webp" | grep -v node_modules

# Add to .gitignore
echo "*.mp4" >> .gitignore
echo "*.mp3" >> .gitignore
echo "*.webp" >> .gitignore
```

### Step 4: Test Everything
```bash
# Build
npm run build

# Restart
pm2 restart dp-core

# Test critical paths:
# - Login
# - Video playback
# - Password reset
# - Dashboard
```

## 🎯 Expected Outcomes
- ✅ Smaller node_modules (30-40% reduction)
- ✅ Faster builds
- ✅ Cleaner codebase
- ✅ No breaking changes
- ✅ Telemetry remains ready to enable if needed

## ⚠️ Lessons Learned
1. **Don't remove working code** - If it's not broken, don't fix it
2. **AST-unaware tools are dangerous** - Simple regex can break syntax
3. **Test after each change** - Not at the end
4. **Keep backups** - Always have a rollback plan
5. **Focus on real problems** - Not theoretical cleanliness

## 🚀 Next Steps
1. Remove unused dependencies first (biggest impact)
2. Remove media files from Git
3. Only remove truly dead code with verification
4. Leave OpenTelemetry alone!
