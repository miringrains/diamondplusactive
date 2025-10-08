# Video Player & Resume System Audit

## Current Architecture

### File Structure
```
src/
├── app/(dashboard)/lessons/[id]/
│   ├── page.tsx                 # Server component
│   └── LessonViewClient.tsx     # Client component
├── components/
│   └── video-player.tsx         # Plyr wrapper
└── app/api/progress/
    ├── route.ts                 # POST /api/progress
    └── [lessonId]/
        ├── route.ts             # GET/PUT/POST /api/progress/[lessonId]
        └── notes/route.ts       # PUT /api/progress/[lessonId]/notes
```

### Data Flow

```
┌──────────────┐     ┌────────────────┐     ┌────────────┐
│ Server Page  │────▶│ LessonViewClient│────▶│ VideoPlayer│
│   (SSR)      │     │   (Client)      │     │   (Plyr)   │
└──────────────┘     └────────────────┘     └────────────┘
       │                      │                     │
       ▼                      ▼                     ▼
   DB Query              Progress API          DOM Events
   (Progress)            GET/POST             timeupdate
```

### Props Contract

Server → Client:
```typescript
{
  lesson: {
    id: string
    title: string
    description: string | null
    duration: number | null  // seconds
  }
  course: {
    title: string
    slug: string
  }
  videoUrl: string  // /api/videos/{filename} or absolute URL
  initialProgress: {
    completed: boolean
    positionSeconds: number
    notes?: string
    lastWatched?: string  // ISO string
  } | null
  previousLesson: { id, title } | null
  nextLesson: { id, title } | null
}
```

### API Contracts

**GET /api/progress/[lessonId]**
```json
{
  "success": true,
  "progress": {
    "id": "...",
    "completed": false,
    "positionSeconds": 123,
    "durationSeconds": 600,
    "watchTime": 123,
    "notes": "...",
    "lastWatched": "2024-01-01T..."
  }
}
```

**POST /api/progress**
```json
// Request
{
  "lessonId": "...",
  "watchTime": 123,
  "positionSeconds": 123,
  "durationSeconds": 600,
  "completed": false
}
// Response
{ "success": true }
```

### Event Wiring

1. **VideoPlayer Component**:
   - Listens to Plyr `ready` event → resumes at `initialTime`
   - Listens to Plyr `timeupdate` → calls `onProgress` callback
   - Additional 15-second interval for progress (redundant)
   - Listens to Plyr `ended` → calls `onComplete`

2. **LessonViewClient Component**:
   - `handleProgress`: Updates local state, throttled API call (5s)
   - `handleComplete`: Immediate API call with completed=true
   - No visibility/pagehide listeners

## Current Issues

### 1. Resume Timing Problem
- **Issue**: Resume happens in Plyr `ready` event, which may fire before video metadata loads
- **Symptom**: Seek fails or jumps to wrong position if duration unknown
- **Root cause**: No wait for `loadedmetadata` event

### 2. Double Progress Tracking
- **Issue**: Both `timeupdate` events AND 15-second interval
- **Symptom**: Duplicate API calls, inconsistent progress
- **Root cause**: Redundant tracking mechanisms

### 3. Missing Persistence on Navigation
- **Issue**: No visibility/pagehide listeners
- **Symptom**: Progress lost when backgrounding app or closing tab
- **Root cause**: Only persists during active playback

### 4. Race Conditions
- **Issue**: Initial progress fetch in useEffect after component mounts
- **Symptom**: Brief flash of position 0 before resuming
- **Root cause**: Not waiting for both metadata and progress data

### 5. Layout Issues
- **Current**: Side-by-side flex layout with variable spacing
- **Problems**: 
  - Notes panel not sticky
  - Inconsistent padding/gaps
  - Poor mobile experience (notes take full width)

### 6. API Inefficiencies
- **Issue**: Full progress object returned on updates
- **Issue**: No validation of duration limits
- **Issue**: watchTime vs positionSeconds confusion

## Required Fixes

1. **Proper Resume Sequence**:
   - Wait for `loadedmetadata` before seeking
   - Fetch progress in parallel with video load
   - Clamp position to valid range

2. **Clean Event Handling**:
   - Single source of truth for progress tracking
   - Add visibility/pagehide listeners
   - Proper cleanup on unmount

3. **Responsive Layout**:
   - CSS Grid for desktop (2 columns)
   - Sticky notes panel with scroll
   - Collapsible notes on mobile

4. **API Hardening**:
   - Stricter validation
   - Minimal response payloads
   - Clear field semantics