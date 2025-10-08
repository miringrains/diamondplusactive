# Video Playback Fix - Play/Pause/Restart Issue

## Problem
The Mux video was playing for a second, pausing, then restarting. This was causing a poor user experience.

## Root Cause
The issue was caused by **double-setting the playback position**:

1. MuxPlayer was given `startTime={currentTime}` prop
2. Video started playing from that position
3. When metadata loaded, `handleLoadedMetadata` was manually setting `player.currentTime = currentTime` again
4. This caused the video to jump back to the start position

Additionally, the `currentTime` state was being updated during playback, which could trigger re-renders and potentially reset the `startTime` prop.

## Fixes Applied

### 1. Removed Manual currentTime Setting
- Removed the line `player.currentTime = currentTime` from `handleLoadedMetadata`
- The MuxPlayer's `startTime` prop already handles initial positioning

### 2. Separated Initial Time from Current Time
- Changed `initialStartTime` to use `useRef` instead of state
- This prevents re-renders from affecting the initial start position
- `currentTime` state is now only used for tracking playback progress

### 3. Added Key Prop
- Added `key={playbackId}` to MuxPlayer
- Ensures a fresh mount when switching between videos

## Code Changes

**Before:**
```javascript
// This was causing the jump back
const handleLoadedMetadata = useCallback(() => {
  if (player && currentTime > 0) {
    player.currentTime = currentTime  // ❌ Double-setting position
  }
}, [currentTime])

// currentTime was used for both initial and tracking
const [currentTime, setCurrentTime] = useState(getInitialTime())
```

**After:**
```javascript
// Clean separation of concerns
const initialStartTime = useRef(getInitialTime())
const [currentTime, setCurrentTime] = useState(0)

const handleLoadedMetadata = useCallback(() => {
  setIsReady(true)
  console.log(`[MuxPlayer] Player ready, initialStartTime: ${initialStartTime.current}s`)
  // Let startTime prop handle positioning
}, [])

// MuxPlayer uses stable initial time
<MuxPlayer
  key={playbackId}
  startTime={initialStartTime.current}
  // ... other props
/>
```

## Result
Videos now play smoothly without the pause/restart issue. The resume functionality continues to work as expected.
