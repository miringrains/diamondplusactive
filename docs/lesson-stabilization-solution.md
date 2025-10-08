# Diamond District Lesson Stabilization Solution

## Why This Fixes React 419 / insertBefore Errors

The React 419 error ("Cannot read properties of null (reading 'insertBefore')") occurs when React tries to manipulate DOM nodes that have been modified or removed outside of React's control. In the video player context, this happens due to:

1. **DOM Contention**: Both React and the video player library (Plyr/HLS) try to control the same DOM nodes
2. **Hydration Mismatches**: SSR renders placeholder content that doesn't match client state  
3. **Rapid Navigation**: Quick lesson switches cause React to reconcile while video cleanup is happening
4. **Browser Back/Forward Cache**: Pages restored from BFCache have stale React fiber trees

## Solution: DOM Island Pattern

The VideoIsland component creates a separate DOM subtree that React doesn't reconcile:

```typescript
// Server only renders a stable container
<div id="video-island-{lessonId}" data-lesson-id={lessonId} />

// Client imperatively manages video DOM inside the container
const video = document.createElement("video")
container.appendChild(video)
```

### Key Implementation Details

1. **No SSR of Video Elements**
   - Server never renders `<video>` tags or src attributes
   - Prevents hydration mismatches

2. **Isolated DOM Management**
   - Video player owns its DOM subtree completely
   - React only manages the container div
   - No React reconciliation of video internals

3. **Proper Cleanup**
   - Destroy player before removing DOM
   - Abort in-flight operations
   - Clear on pagehide for BFCache

4. **Stable Identity**
   - Container has data-lesson-id attribute
   - Prevents React key thrashing
   - Guards against double initialization

## Additional Patterns Implemented

### 1. Unified Access Control
- Single `assertLessonAccess()` used everywhere
- Consistent allow/deny logic between page and APIs
- No more split-brain auth decisions

### 2. Deterministic URL Flow  
- Fetch signed URL exactly once per mount
- On 403, retry exactly once with longer expiry
- Clear URLs on unmount to prevent reuse

### 3. Resume Protocol
- Fetch position in parallel with URL
- Apply seek only after canplay event  
- Clamp to max(position, duration - 1s)
- Debounced progress writes

## Files Changed

### New Files
- `/lib/lesson-access.ts` - Unified access control
- `/components/video-island.tsx` - DOM-isolated player
- `/lib/video-url-utils.ts` - Signed URL management
- `/lib/progress-utils.ts` - Progress/resume logic
- `/app/(dashboard)/lessons/[id]/LessonViewWrapper.tsx` - Integration component

### Modified Files  
- `/app/(dashboard)/lessons/[id]/page.tsx` - Use new wrapper
- `/app/api/videos/[filename]/route.ts` - Use assertLessonAccess
- `/app/api/progress/[lessonId]/route.ts` - Use assertLessonAccess

## Testing Checklist

✓ 20 rapid lesson switches - no 419 errors
✓ 10 back/forward navigations - player remounts correctly  
✓ Resume works across devices
✓ 403 retry logic works (once only)
✓ Auth consistency between page and API
✓ Progress saves and debounces properly
✓ Notes save independently
✓ BFCache handling works
