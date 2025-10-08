# Uncontrolled Player Fixes - Production

## Summary
Applied critical fixes to make the MuxPlayer truly uncontrolled and prevent the pause/restart loop.

## Key Changes Applied

### 1. Freeze the Player Instance ✅
- Changed key from `playbackId` to `lessonId-playbackId` for stability
- Player mounts once and stays mounted

### 2. Make Player Uncontrolled ✅
- Removed state updates (`setCurrentTime`, `setIsReady`)
- Moved token to ref (`tokenRef`) to prevent re-renders
- Token updates happen directly on player without state changes

### 3. Apply Resume Time Exactly Once ✅
- `initialStartTimeRef` stores resume position (never changes)
- `hasAppliedStartTimeRef` ensures position applied only once
- Applied in `handleLoadedMetadata` with 100ms delay for reliability
- Removed `startTime` prop (set to `undefined`)

### 4. Eliminate Competing Progress Writers ✅
- Removed debounce, using timer refs instead
- Single progress writer active at a time
- Parent handles saves if `onProgress` provided
- Otherwise, internal timer saves every 15 seconds

### 5. Stop Effects That Fire Each Second ✅
- Removed `setCurrentTime` from time updates
- No state updates in `handleTimeUpdate`
- Progress saves scheduled with timer, not debounce
- SubLessonViewWrapper save increased from 2s to 10s

### 6. Stabilize Mux Inputs ✅
- Token stored in ref, not state
- Token refresh doesn't trigger re-renders
- Direct player property update for new tokens
- PlaybackId and lessonId stable throughout session

## Implementation Details

### Token Management (No Re-renders)
```javascript
// Token in ref, not state
const tokenRef = useRef<string | undefined>(initialToken)

// Update player directly
if (player) {
  // @ts-ignore
  player.tokens = { playback: data.token }
}
```

### Progress Saving (Timer-based)
```javascript
// Timer ref instead of debounce
const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

// Schedule saves
progressSaveTimerRef.current = setTimeout(() => {
  saveServerProgress(position)
}, 15000)
```

### Resume Position (Applied Once)
```javascript
// In handleLoadedMetadata
if (!hasAppliedStartTimeRef.current && initialStartTimeRef.current > 0) {
  setTimeout(() => {
    player.currentTime = initialStartTimeRef.current
  }, 100)
}
hasAppliedStartTimeRef.current = true
```

## Files Modified
1. `src/components/MuxPlayerEnhanced.tsx` - Core player fixes
2. `src/app/.../SubLessonViewWrapper.tsx` - Increased save interval

## Testing Checklist
- [ ] Player mounts once (check React DevTools)
- [ ] No pause/restart loop
- [ ] Resume position applied correctly
- [ ] Progress saves work (check Network tab)
- [ ] Token refresh doesn't cause issues
- [ ] Tab switching doesn't break playback

## Production Notes
- Changes applied in-place to existing components
- No new components created (memory constraints)
- Backward compatible with existing API
