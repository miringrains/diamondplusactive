# Video Stopping Analysis - Diamond District

## Current Issue
Videos play for a while, then stop unexpectedly. This is happening in a PRODUCTION environment.

## Potential Causes & Solutions

### 1. Missing Preload Configuration
**Current**: No explicit preload settings in MuxPlayer
```javascript
<MuxPlayer
  streamType="on-demand"
  autoPlay={false}
  // Missing: preload settings
/>
```

**Solution**: Add preload configuration
```javascript
<MuxPlayer
  streamType="on-demand"
  autoPlay={false}
  preload="metadata"  // or "auto" for better buffering
/>
```

### 2. Missing Max Buffer Configuration
**Issue**: No buffer length settings, using defaults
**Solution**: Add buffer configuration to prevent stalling
```javascript
<MuxPlayer
  streamType="on-demand"
  autoPlay={false}
  maxBufferLength={30}  // Buffer 30 seconds ahead
  maxMaxBufferLength={600}  // Maximum buffer of 10 minutes
/>
```

### 3. Tab Visibility Handling
**Current**: We handle visibility change but might not be optimal
```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      flushProgress()
    }
  }
  // ...
}, [flushProgress])
```

**Issue**: Browser might pause video when tab is not visible
**Solution**: Force play on visibility restore
```javascript
const handleVisibilityChange = () => {
  if (document.hidden) {
    flushProgress()
  } else {
    // Resume playback if it was playing before
    const player = playerRef.current
    if (player && wasPlayingRef.current) {
      player.play()
    }
  }
}
```

### 4. Progress Save Interrupting Playback
**Current**: Debounced at 5 seconds
```javascript
const saveServerProgress = useCallback(
  debounce(async (position: number) => {
    // API call
  }, 5000),
  [lessonId, isSubLesson]
)
```

**Issue**: Frequent saves might cause micro-interruptions
**Solution**: Increase debounce time
```javascript
debounce(async (position: number) => {
  // API call
}, 15000)  // Save every 15 seconds instead
```

### 5. Token Expiration During Playback
**Current**: Token expires after 1 hour (3600 seconds)
**Issue**: Long videos might have tokens expire mid-playback

**Solution**: Implement proactive token refresh
```javascript
useEffect(() => {
  if (!requiresToken) return
  
  // Refresh token 5 minutes before expiry
  const refreshInterval = setInterval(() => {
    refreshToken()
  }, 55 * 60 * 1000)  // 55 minutes
  
  return () => clearInterval(refreshInterval)
}, [requiresToken, refreshToken])
```

### 6. Network Quality Detection
**Missing**: No adaptive quality or network detection
**Solution**: Add error recovery and quality adaptation
```javascript
const handleError = useCallback((event: any) => {
  const error = event?.detail?.error || event?.error
  
  // Retry on network errors
  if (error?.code === 'NETWORK_ERROR') {
    retryCount.current++
    if (retryCount.current < 3) {
      setTimeout(() => {
        const player = playerRef.current
        if (player) {
          player.load()  // Reload the video
        }
      }, 1000 * retryCount.current)  // Exponential backoff
    }
  }
}, [])
```

### 7. Missing MuxPlayer Advanced Props
**Current**: Basic configuration only
**Solution**: Add comprehensive MuxPlayer configuration
```javascript
<MuxPlayer
  // Current props
  playbackId={playbackId}
  streamType="on-demand"
  autoPlay={false}
  
  // Add these for better stability
  preload="auto"
  preferPlayback="mse"  // Use Media Source Extensions
  minBufferLength={2}
  maxBufferLength={30}
  maxMaxBufferLength={600}
  backBufferLength={30}
  targetLiveWindow={10}
  
  // Error handling
  errorTranslatorFunction={(error) => {
    console.error('[MuxPlayer] Playback error:', error)
    return `Playback error: ${error.message}`
  }}
  
  // Performance
  lowLatencyMode={false}  // Better for VOD stability
  
  // Analytics
  disableTracking={false}
  disableCookies={false}
/>
```

## Immediate Actions

1. **Add Preload Setting**
   ```javascript
   preload="auto"
   ```

2. **Increase Progress Debounce**
   ```javascript
   debounce(..., 15000)  // From 5000
   ```

3. **Add Retry Logic**
   - Implement automatic retry on network errors
   - Add exponential backoff

4. **Monitor Performance**
   - Add logging for buffer events
   - Track when videos stop/stall

## Testing Approach

1. Test with long videos (>1 hour) to check token expiry
2. Test with poor network conditions
3. Test with tab switching
4. Monitor browser console for any errors

## Production Monitoring

Add these logs to track the issue:
```javascript
// In handleTimeUpdate
if (player.buffered.length > 0) {
  const bufferedEnd = player.buffered.end(player.buffered.length - 1)
  const bufferHealth = bufferedEnd - player.currentTime
  
  if (bufferHealth < 2) {
    console.warn('[MuxPlayer] Low buffer:', bufferHealth)
  }
}

// Track stalls
player.addEventListener('waiting', () => {
  console.warn('[MuxPlayer] Video stalled at', player.currentTime)
})

player.addEventListener('stalled', () => {
  console.warn('[MuxPlayer] Video stalled (network)')
})
```
