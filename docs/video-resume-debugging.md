# Video Resume Debugging Guide

## Changes Made

### 1. Fixed localStorage Initialization
The video component now reads from localStorage IMMEDIATELY on mount, not waiting for server data:

```typescript
// OLD: Video starts at 0 while waiting for server
initialTime={isLoadingProgress ? 0 : currentPosition}

// NEW: Uses localStorage position immediately
const getInitialPosition = () => {
  const stored = localStorage.getItem(PROGRESS_STORAGE_KEY(lesson.id))
  if (stored) {
    const parsed = JSON.parse(stored)
    return parsed.position || 0
  }
  return initialProgress?.positionSeconds || 0
}
const [currentPosition, setCurrentPosition] = useState(getInitialPosition)
```

### 2. Multiple Resume Strategies
The video player now tries multiple approaches to ensure resume works:

1. **Pre-Plyr Seek**: Sets currentTime before Plyr initialization
2. **Post-Plyr Force**: Forces seek after Plyr is ready
3. **Metadata Event**: Seeks when video metadata loads
4. **Canplay Event**: Backup seek on canplay event
5. **Ready Event**: Final attempt in Plyr ready event

### 3. Console Logging
Added extensive console logging with `[Resume]` and `[VideoPlayer]` prefixes:

```
[Resume] Found localStorage position: 123s
[Resume] Initial position: 123s
[VideoPlayer] Initializing with src: /api/videos/..., initialTime: 123
[VideoPlayer] loadedmetadata fired. InitialTime: 123, Duration: 600
[VideoPlayer] Attempting to seek to 123s
[VideoPlayer] Resume setup complete at 123s
```

## How to Test

### 1. Check Browser Console
Open DevTools (F12) and watch for the console logs:

```javascript
// In console, check localStorage
localStorage.getItem('lesson_progress_YOUR_LESSON_ID')

// Should see something like:
// {"position":123,"completed":false,"timestamp":1702345678901}
```

### 2. Test Resume Flow
1. Watch a video for 30+ seconds
2. Navigate away (or refresh)
3. Return to the video
4. Check console for resume logs
5. Video should be paused at last position
6. "Resume from X:XX" overlay should appear

### 3. Clear Test Data
To test from scratch:
```javascript
// Clear all progress data
Object.keys(localStorage)
  .filter(k => k.startsWith('lesson_progress_'))
  .forEach(k => localStorage.removeItem(k))
```

### 4. Debug Checklist
- [ ] localStorage has position data
- [ ] Console shows "[Resume] Found localStorage position"
- [ ] Console shows "[VideoPlayer] Attempting to seek"
- [ ] Video element paused at correct time
- [ ] Resume overlay visible
- [ ] No errors in console

## Common Issues

### Issue: Video Still Starts at 0:00

**Check 1**: Is localStorage working?
```javascript
// Test localStorage
localStorage.setItem('test', 'works')
console.log(localStorage.getItem('test')) // Should print "works"
```

**Check 2**: Is progress being saved?
- Watch video, pause, check Network tab for POST to `/api/progress`
- Response should be 200 OK

**Check 3**: Browser Extensions
- Some privacy extensions block localStorage
- Try in incognito mode

### Issue: Resume Position Wrong

**Check**: Compare localStorage vs server
```javascript
// Get lesson ID from URL
const lessonId = window.location.pathname.split('/').pop()

// Check localStorage
const local = JSON.parse(localStorage.getItem(`lesson_progress_${lessonId}`))
console.log('Local position:', local?.position)

// Check server (in Network tab)
// Look for GET request to /api/progress/{lessonId}
```

### Issue: Video Jumps Around

This might happen if:
1. Server has different position than localStorage
2. Multiple resume attempts conflict

Solution: Clear cache and localStorage, start fresh

## Architecture Summary

```
Page Load
    ↓
LessonViewEnhanced
    ├─ Read localStorage (instant)
    ├─ Set currentPosition state
    └─ Pass to VideoPlayerEnhanced
           ↓
VideoPlayerEnhanced
    ├─ Initialize Plyr
    ├─ Set video.currentTime
    ├─ Wait for metadata
    ├─ Seek to position
    ├─ Pause video
    └─ Show resume overlay
```

## Production Testing

After deployment:
1. Clear browser cache (Ctrl+Shift+R)
2. Test on multiple browsers
3. Test with slow network (DevTools throttling)
4. Test cross-device sync (login on phone + desktop)
