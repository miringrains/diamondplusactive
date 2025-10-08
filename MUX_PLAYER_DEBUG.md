# Mux Player Debug Guide

## Changes Applied Based on Official Docs

1. **Metadata Format**: Changed to camelCase for React component
   - `video_id` → `videoId`
   - `video_title` → `videoTitle`  
   - `viewer_user_id` → `viewerUserId`

2. **Added `accentColor` prop**: Set to `#17ADE9` as recommended

3. **Removed `startTime` prop**: Let player handle initial state

4. **Added Debug Logging**:
   - Token generation and refresh
   - Error events with full details
   - Initial setup state

## What to Check in Browser Console

1. Look for `[MuxPlayer] Initial setup:` - shows if token is present
2. Look for `[MuxPlayer] Error event:` - shows detailed error info
3. Check Network tab for 403 errors on `.m3u8` requests

## Common Issues

### 403 Forbidden
- Token is invalid or expired
- Check `aud` claim is `"v"` not `"video"`
- Check `kid` is in JWT header not payload
- Verify signing key matches Mux dashboard

### Video Not Loading
- Check if `playbackId` is correct
- Verify `requiresToken` matches asset settings
- Look for CORS errors in console

### Playback Issues
- Player remounting (check React DevTools)
- State updates causing re-renders
- Competing progress handlers

## Testing Steps

1. Open browser console
2. Navigate to a video lesson
3. Look for debug logs
4. Check Network tab for failed requests
5. Verify player mounts only once (React DevTools)
