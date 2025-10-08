# Diamond District Production Fixes Summary

## ⚠️ CRITICAL: This is a LIVE PRODUCTION Environment

Real users are watching videos and experiencing these issues in real-time.

## Issues Fixed Today

### 1. Mux 403 Forbidden Errors ✅
- **Problem**: Videos wouldn't play due to JWT token validation failures
- **Root Cause**: 
  - `kid` was in JWT payload instead of header
  - `aud` was "video" instead of "v"
- **Fix**: Updated `src/lib/mux.ts` to use correct JWT structure

### 2. 502 Bad Gateway Errors ✅
- **Problem**: Intermittent connection failures between nginx and Next.js
- **Root Cause**: nginx using `localhost` which resolves to both IPv4/IPv6
- **Fix**: Changed nginx config to use explicit `127.0.0.1`

### 3. 400 Bad Request on Progress Endpoints ✅
- **Problem**: Progress tracking failing with 400 errors
- **Root Cause**: 
  - Wrong endpoint for sub-lessons
  - Schema validation errors
- **Fix**: 
  - Added `isSubLesson` prop to route to correct endpoint
  - Made schema fields optional with proper defaults

### 4. Video Play/Pause/Restart Bug ✅
- **Problem**: Video would play for 1 second, pause, then restart
- **Root Cause**: Double-setting playback position (startTime + manual currentTime)
- **Fix**: Removed manual currentTime setting, use only startTime prop

### 5. Video Stopping/Stalling Issues ✅
- **Problem**: Videos stopping unexpectedly during playback
- **Potential Causes**: Multiple factors addressed
- **Fixes Applied**:
  - Added `preload="auto"` for better buffering
  - Increased progress save debounce: 2s → 15s
  - Added tab visibility handling with auto-resume
  - Implemented network error retry (3 attempts)
  - Added stall detection logging

### 6. UI Brand Consistency ✅
- **Problem**: Player controls were red instead of brand blue
- **Fix**: Changed colors to #17ADE9 (brand blue)

### 7. Video Pausing Every Second ✅
- **Problem**: Video would pause every 1 second, restart on play
- **Root Causes**:
  - Duplicate progress saving (MuxPlayerEnhanced + SubLessonViewWrapper)
  - StartTime prop being continuously applied
  - Logo component SSR error
- **Fixes**:
  - Conditional progress saving based on onProgress callback
  - StartTime only applied on initial mount
  - Made Logo a client component with error handling

## Key Lessons Learned

1. **Production is Not Development**
   - Always `npm run build` before `pm2 restart`
   - Test locally first, but remember production has different constraints

2. **Be Explicit with Network Config**
   - Use `127.0.0.1` not `localhost` in production proxies
   - IPv6 can cause unexpected issues

3. **Follow API Documentation Exactly**
   - Mux expects `aud: "v"` not `aud: "video"`
   - JWT `kid` must be in header, not payload

4. **Don't Over-Engineer Simple Things**
   - MuxPlayer's `startTime` prop works fine alone
   - Don't manually set currentTime if using startTime

5. **Consider User Experience**
   - Saving progress every 2 seconds is excessive
   - Tab switching shouldn't break video playback
   - Network hiccups should recover gracefully

## Current Production Status

- **Application**: Online and stable
- **Video Playback**: Working with signed URLs
- **Progress Tracking**: Saving every 15 seconds
- **Error Recovery**: Automatic retry on network failures
- **Monitoring**: Console warnings for diagnostics

## Files Modified

1. `/src/lib/mux.ts` - JWT token generation
2. `/src/components/MuxPlayerEnhanced.tsx` - Player stability
3. `/src/app/api/progress/sub-lessons/[subLessonId]/route.ts` - Schema fixes
4. `/src/app/(dashboard)/courses/.../SubLessonViewWrapper.tsx` - Routing fix
5. `/etc/nginx/sites-enabled/diamond-district` - Proxy configuration

## Next Steps

1. Monitor browser console for any stall warnings
2. Check if users still report stopping issues
3. Consider adding more aggressive buffering if needed
4. Set up proper error tracking (Sentry, etc.)

## Commands for Future Reference

```bash
# Proper production deployment
pm2 stop diamond-district
npm run build
pm2 start diamond-district

# Check status
pm2 status
pm2 logs diamond-district --lines 50

# Test endpoints
curl -I https://watch.zerotodiamond.com
curl https://watch.zerotodiamond.com/api/auth/session
```

---
Remember: Every change affects real users. Test thoroughly, deploy carefully.
