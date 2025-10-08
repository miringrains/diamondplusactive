# Diamond District UI Shell Deployment Plan

**Date**: August 17, 2025  
**Release**: release-ui-shell-20250817-132246.tar.gz  
**Environment**: Production (watch.zerotodiamond.com)

## Pre-Deployment Checklist

- [x] Git status clean (only untracked diff file)
- [x] No database migrations in changeset
- [x] PM2 app running (diamond-district)
- [x] Node.js v20.19.4 available
- [x] package-lock.json present

## Deployment Steps

### 1. Backup Current State
```bash
cd /root/project/diamond-district
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz src/app src/components docs
```

### 2. Apply UI Changes
```bash
# Extract new UI files over existing installation
tar -xzf releases/release-ui-shell-20250817-132246.tar.gz
```

### 3. Build Application
```bash
# Build with production optimizations
NODE_ENV=production npm run build
```

### 4. Reload Application
```bash
# Graceful reload with PM2 (zero downtime)
pm2 reload diamond-district
```

### 5. Verify Deployment
```bash
# Check PM2 status
pm2 status diamond-district

# Test homepage
curl -s -o /dev/null -w "%{http_code}" https://watch.zerotodiamond.com/

# Test a lesson route
curl -s -o /dev/null -w "%{http_code}" https://watch.zerotodiamond.com/dashboard
```

## Rollback Plan

If issues occur:

```bash
# 1. Stop application
pm2 stop diamond-district

# 2. Restore from backup
tar -xzf backup-[timestamp].tar.gz

# 3. Rebuild
npm run build

# 4. Restart
pm2 restart diamond-district
```

## Post-Deployment Validation

1. Navigate to https://watch.zerotodiamond.com
2. Check sidebar behavior (collapse/expand)
3. Visit course listing page
4. Open a video lesson
5. Verify no horizontal scroll
6. Test on mobile viewport

## Notes

- This deployment uses PM2's reload feature for zero-downtime deployment
- No npm install needed (no dependency changes)
- No database migrations required
- Build time: ~1-2 minutes
- Total deployment time: ~3-4 minutes
