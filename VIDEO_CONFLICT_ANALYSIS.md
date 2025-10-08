# Video Playback Conflict Analysis

## Issues Found in SubLessonViewWrapper

### 1. State Updates on Every Time Update
```tsx
const handleProgress = (seconds: number) => {
    setCurrentPosition(seconds)  // ❌ Updates state every second!
    // ...
}
```
This causes React to re-render the entire component tree every second.

### 2. Duplicate Progress Saving
- `SubLessonViewWrapper` has its own `saveProgress` (debounced at 10s)
- `MuxPlayerEnhanced` also has internal progress saving (debounced at 15s)
- Both are trying to save to the same endpoint

### 3. Polling Interval for Processing Status
```tsx
const pollInterval = setInterval(async () => {
    // Polls every 5 seconds
}, 5000)
```
This might be interfering with playback if it causes re-renders.

### 4. Multiple State Variables
- `currentPosition` state
- `videoDuration` state  
- `completed` state
- `processingStatus` state
- `muxToken` state

Each state update can trigger re-renders that might affect the player.

## Solution

We need to:
1. Remove state updates from time updates
2. Use refs instead of state for progress tracking
3. Let MuxPlayerEnhanced handle all progress internally
4. Remove the polling interval once video is ready
