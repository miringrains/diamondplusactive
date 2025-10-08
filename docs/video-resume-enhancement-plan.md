# Video Resume Enhancement Plan

## Current State

We have a robust video player implementation using:
- **VideoIsland**: DOM-isolated player preventing React 419 errors
- **Plyr + HLS.js**: Reliable playback with good browser support
- **Progress Tracking**: Server-side storage with debounced writes
- **Signed URLs**: Automatic retry on 403 errors

## The Resume Problem

Video resume fails ~70% of the time because:
1. Browsers block programmatic seeking before user interaction
2. HLS needs time to load segments before seeking works
3. Various player states (canplay, loadeddata, ready) fire at different times

## Proposed Solution: Smart Resume System

### 1. Multi-Event Resume Strategy
Instead of relying on a single event, try seeking at multiple points:

```typescript
// In VideoIsland.tsx
const tryResume = () => {
  if (hasResumed || !initialTime) return
  
  const video = videoRef.current
  const player = playerRef.current
  
  if (video && player && video.duration > 0) {
    // Check if we can actually seek
    if (video.seekable.length > 0) {
      const seekable = video.seekable
      for (let i = 0; i < seekable.length; i++) {
        if (initialTime >= seekable.start(i) && initialTime <= seekable.end(i)) {
          player.currentTime = initialTime
          setHasResumed(true)
          return
        }
      }
    }
  }
}

// Try at multiple events
player.on('loadeddata', tryResume)
player.on('canplay', tryResume)
player.on('durationchange', tryResume)
video.addEventListener('loadedmetadata', tryResume)
```

### 2. User Interaction Fallback

Add a prominent "Continue Watching" overlay:

```typescript
interface ResumeOverlayProps {
  time: number
  onResume: () => void
  onDismiss: () => void
}

function ResumeOverlay({ time, onResume, onDismiss }: ResumeOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Continue where you left off?</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Resume from {formatTime(time)}
        </p>
        <div className="flex gap-3">
          <Button onClick={onResume} className="bg-blue-600 hover:bg-blue-700">
            Yes, Resume
          </Button>
          <Button onClick={onDismiss} variant="outline">
            Start from Beginning
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 3. Preload Strategy for HLS

For HLS streams, preload segments around the resume point:

```typescript
if (hlsRef.current && initialTime > 0) {
  // Start loading from a bit before the resume point
  const preloadTime = Math.max(0, initialTime - 5)
  hlsRef.current.startLoad(preloadTime)
}
```

### 4. Cross-Device Sync Enhancement

Improve the sync endpoint to include more context:

```typescript
interface SyncData {
  lessonId: string
  position: number
  duration: number
  timestamp: number
  deviceId: string
  quality: string
  bufferedRanges: Array<{start: number, end: number}>
}
```

### 5. Analytics & Monitoring

Add telemetry to understand why resume fails:

```typescript
addSpanEvent('video.resume.attempt', {
  lessonId,
  targetTime: initialTime,
  videoState: {
    readyState: video.readyState,
    duration: video.duration,
    seekableRanges: Array.from({length: video.seekable.length}, (_, i) => ({
      start: video.seekable.start(i),
      end: video.seekable.end(i)
    })),
    bufferedRanges: Array.from({length: video.buffered.length}, (_, i) => ({
      start: video.buffered.start(i),
      end: video.buffered.end(i)
    }))
  }
})
```

## Implementation Priority

1. **High Priority**: User interaction fallback (guaranteed to work)
2. **Medium Priority**: Multi-event resume strategy
3. **Low Priority**: HLS preload optimization

## Expected Outcome

- **Auto-resume success rate**: 70% → 85%
- **With user fallback**: 100% success rate
- **Better user experience**: Clear communication about resume
- **Analytics**: Understanding of failure patterns

## Next Steps

1. Implement ResumeOverlay component
2. Add multi-event resume logic
3. Deploy and monitor telemetry
4. Iterate based on data

This approach works with our existing infrastructure and doesn't require changing video players or major refactoring.
