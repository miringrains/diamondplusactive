# Auth Pages Fix - Incremental Validation Checklist

## Overview
This document provides step-by-step validation checks to perform during the auth pages migration to ensure functionality is maintained throughout the process.

## Pre-Implementation Checks

### 1. Baseline Functionality Test
Before making any changes, document current behavior:

```bash
# Check current build status
cd /root/diamond-plus/core
npm run build 2>&1 | grep -E "(○|ƒ|λ)" | grep -E "(register|reset-password|set-password|logout)"
```

Expected output showing static pages (○):
```
├ ○ /register
├ ○ /reset-password  
├ ○ /set-password
├ ○ /logout
```

### 2. Create Test Accounts
```bash
# Store test credentials
echo "Test User 1: test1@diamondplus.test / TestPass123!" > test-accounts.txt
echo "Test User 2: test2@diamondplus.test / TestPass456!" >> test-accounts.txt
```

## Phase 1: Register Page Checks

### Step 1.1: After Creating register-form.tsx
```bash
# Syntax check
npx tsc --noEmit src/app/\(auth\)/register/register-form.tsx

# Import validation
grep -E "use client|createClient|useRouter|useState" src/app/\(auth\)/register/register-form.tsx
```
✅ Should see "use client" at top
✅ Should see client-side imports only

### Step 1.2: After Converting page.tsx to Server Component
```bash
# Check for "use client" removal
grep "use client" src/app/\(auth\)/register/page.tsx
```
❌ Should return nothing (no "use client")

```bash
# Verify server imports
grep -E "auth|redirect|searchParams" src/app/\(auth\)/register/page.tsx
```
✅ Should see auth import and searchParams parameter

### Step 1.3: Build Test (Register Only)
```bash
# Quick build to check single page
cd /root/diamond-plus/core
npx next build --debug 2>&1 | grep -A2 -B2 "/register"
```
✅ Should show `ƒ /register` (dynamic) not `○ /register` (static)

### Step 1.4: Runtime Test (Development Mode)
```bash
# Start dev server in background
npm run dev &
DEV_PID=$!
sleep 10

# Test register page loads
curl -s http://localhost:3000/register | grep -E "(Create your account|Sign up)"

# Check for hydration errors in console
curl -s http://localhost:3000/register | grep -i "hydration"

# Stop dev server
kill $DEV_PID
```
✅ Should see registration form content
❌ Should NOT see hydration errors

## Phase 2: Reset Password Page Checks

### Step 2.1: After Creating reset-password-form.tsx
```bash
# Verify form component structure
grep -E "export.*function.*ResetPasswordForm" src/app/\(auth\)/reset-password/reset-password-form.tsx
```
✅ Should find the component export

### Step 2.2: After Converting page.tsx
```bash
# Check dynamic configuration
grep -E "dynamic.*=.*force-dynamic|searchParams" src/app/\(auth\)/reset-password/page.tsx
```
✅ Should see either dynamic export or searchParams

### Step 2.3: API Route Integration Test
```bash
# Test reset endpoint exists
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -w "\nHTTP Status: %{http_code}\n"
```
✅ Should return 200 or 400 (not 404)

## Phase 3: Set Password Page Checks

### Step 3.1: Token Validation Check
```bash
# Verify server-side token handling
grep -E "auth\(\)|session|cookies" src/app/\(auth\)/set-password/page.tsx
```
✅ Should see auth() call for session check

### Step 3.2: Invite Flow Test
```bash
# Check middleware allows access
grep "set-password" src/middleware.ts
```
✅ Should be in publicRoutes array

## Phase 4: Logout Page Checks

### Step 4.1: Simple Redirect Test
```bash
# Verify it's just a redirect
wc -l src/app/\(auth\)/logout/page.tsx
```
✅ Should be less than 20 lines (simple redirect)

## Incremental Build Checks

### After Each Page Conversion
```bash
# Run targeted build check
cd /root/diamond-plus/core
NODE_OPTIONS="--max-old-space-size=2048" npx next build 2>&1 | tee build-progress.log

# Check specific routes
grep -E "├ (○|ƒ|λ) /(register|reset-password|set-password|logout)" build-progress.log
```

Progress tracking:
- [ ] /register - Should change from ○ to ƒ
- [ ] /reset-password - Should change from ○ to ƒ  
- [ ] /set-password - Should change from ○ to ƒ
- [ ] /logout - Should change from ○ to ƒ

## Runtime Validation Commands

### 1. Quick Server Health Check
```bash
# Check if server starts without errors
timeout 30s npm run dev 2>&1 | grep -E "(ready|error|warn)" | head -20
```

### 2. Auth Flow Test Script
Create `test-auth-flow.sh`:
```bash
#!/bin/bash
BASE_URL="http://localhost:3000"

echo "Testing Auth Pages Load..."
for page in register reset-password set-password login logout; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$page")
  echo "/$page - HTTP $STATUS"
done
```

### 3. Check for Common Issues
```bash
# Hydration errors
curl -s http://localhost:3000/register | grep -i "hydration" && echo "❌ Hydration error found" || echo "✅ No hydration errors"

# Missing dependencies
grep -r "Module not found" .next/server/app/ && echo "❌ Missing modules" || echo "✅ All modules found"

# Cookie errors
grep -r "cookies.*static" .next/server/app/ && echo "❌ Cookie access in static context" || echo "✅ No static cookie access"
```

## Database Session Checks

### Verify Auth State
```bash
# Check active sessions in Supabase
cd /root/diamond-plus/core
cat > check-sessions.js << 'EOF'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSessions() {
  const sessions = await prisma.$queryRaw`
    SELECT id, created_at, updated_at 
    FROM auth.sessions 
    WHERE created_at > NOW() - INTERVAL '1 hour'
    LIMIT 5
  `
  console.log('Recent sessions:', sessions.length)
}

checkSessions().then(() => prisma.$disconnect())
EOF

node check-sessions.js
```

## Warning Signs to Watch For

### 🚨 Red Flags During Implementation

1. **Build Warnings**
```bash
# Check for concerning warnings
npm run build 2>&1 | grep -E "(DYNAMIC_SERVER_USAGE|static.*cookies|Module not found)"
```

2. **TypeScript Errors**
```bash
# Full type check
npx tsc --noEmit
```

3. **Unused Client Hooks**
```bash
# Find client hooks in server components
grep -r "useEffect\|useState\|useRouter" src/app/\(auth\)/ --include="page.tsx"
```

## Quick Rollback Test

### Before Making Changes
```bash
# Create a local backup branch
cd /root/diamond-plus/core
git checkout -b auth-fix-backup
git checkout development
```

### If Something Breaks
```bash
# Quick revert to working state
git diff auth-fix-backup --name-only | xargs git checkout auth-fix-backup --
npm run build
```

## Continuous Monitoring

### Watch Build Output
```bash
# Terminal 1: Watch for build issues
watch -n 30 'cd /root/diamond-plus/core && npm run build 2>&1 | grep -E "(○|ƒ|λ)" | grep -E "(register|reset-password|set-password|logout)"'
```

### Monitor Error Logs
```bash
# Terminal 2: Watch for runtime errors
pm2 logs dp-core --lines 100 | grep -E "(error|Error|ERROR)"
```

## Final Validation Suite

### Run All Tests
```bash
#!/bin/bash
echo "=== Auth Pages Validation Suite ==="

# 1. Build check
echo -n "Build status: "
npm run build 2>&1 | grep -c "✓ Compiled" && echo "✅ Build successful" || echo "❌ Build failed"

# 2. Dynamic routes check
echo -n "Dynamic routes: "
DYNAMIC_COUNT=$(npm run build 2>&1 | grep -E "ƒ /(register|reset-password|set-password|logout)" | wc -l)
echo "$DYNAMIC_COUNT/4 auth pages are dynamic"

# 3. No static auth pages
echo -n "Static auth pages: "
STATIC_COUNT=$(npm run build 2>&1 | grep -E "○ /(register|reset-password|set-password|logout)" | wc -l)
[[ $STATIC_COUNT -eq 0 ]] && echo "✅ None (good)" || echo "❌ Found $STATIC_COUNT static auth pages"

# 4. Server running check
echo -n "Server health: "
timeout 5s npm run dev > /dev/null 2>&1 && echo "✅ Starts without errors" || echo "⚠️  Check manually"

echo "=== Validation Complete ==="
```

## Success Metrics

Each page should pass these checks:
- [ ] Shows `ƒ` (dynamic) in build output
- [ ] No "use client" in page.tsx
- [ ] Has searchParams or dynamic export
- [ ] No hydration errors
- [ ] No cookie access errors
- [ ] Loads in browser without errors
- [ ] Auth flow works end-to-end
