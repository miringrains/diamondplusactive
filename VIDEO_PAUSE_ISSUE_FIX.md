# Video Pause Issue Fix - PRODUCTION

## Problem Reported
1. Video pauses every 1 second during playback
2. When pressing play after pause, video restarts from beginning
3. Broken image in top left corner (logo)

## Root Causes Identified

### 1. Duplicate Progress Saving
**Issue**: Two components were saving progress simultaneously
- `MuxPlayerEnhanced` was saving progress internally (debounced at 15s)
- `SubLessonViewWrapper` was also saving progress via onProgress callback (debounced at 2s)
- Both were hitting the same API endpoint `/api/progress/sub-lessons/[id]`

**Fix**: Modified `MuxPlayerEnhanced` to only save progress internally when no onProgress callback is provided

### 2. StartTime Prop Issue
**Issue**: The startTime prop was being applied continuously, causing restarts
- When video was paused and played again, it would jump back to initial time

**Fix**: Only apply startTime on initial load:
```javascript
startTime={!hasSetInitialTime.current ? initialStartTime.current : undefined}
```

### 3. Logo Image Error
**Issue**: Logo component couldn't handle errors in server-side rendering

**Fix**: Made Logo component a client component with error handling:
```javascript
"use client"
// ...
onError={(e) => {
  console.error('[Logo] Failed to load image:', e);
  (e.target as HTMLImageElement).style.display = 'none';
}}
```

## Changes Applied

### 1. MuxPlayerEnhanced.tsx
- Added conditional progress saving logic
- Fixed startTime to only apply on initial load
- Added debug logging for pause events
- Added warning when video pauses unexpectedly

### 2. logo.tsx
- Made it a client component
- Added onError handler to hide broken images

## Debug Features Added

The following console logs will help diagnose issues:
- `[MuxPlayer] Pause event triggered` - Shows when and why video pauses
- `[MuxPlayer] Video paused unexpectedly at X seconds` - Warns of unexpected pauses
- `[Logo] Failed to load image` - Shows if logo fails to load

## Testing Instructions

1. Clear browser cache
2. Navigate to a video lesson
3. Video should play continuously without pausing every second
4. Pause/play should work normally without restarting
5. Check console for any debug messages
6. Logo should either display or be hidden if it fails to load

## Deployment Status
- Deployed: 2025-08-14 20:10 UTC
- Build: Successful
- PM2: Online (restart count: 10)
