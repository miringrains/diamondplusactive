# Video Infrastructure Optimization Plan

## Current Status

### ✅ What's Working
1. **AWS S3 configured** with credentials and bucket
2. **Video upload API** at `/api/upload`
3. **Authentication** - Admin-only access
4. **File size limits**:
   - API: 5GB for S3, 1GB for local
   - Nginx: 1GB (just updated from 500MB)
   - Next.js: 1GB in serverActions config

### ⚠️ Current Limitations for 900MB Videos
1. **Direct upload** - Single POST request can timeout
2. **No compression** - 900MB files served as-is
3. **No HLS conversion** - Large files stream poorly
4. **Memory intensive** - Entire file loaded into buffer
5. **No progress tracking** - Upload appears frozen

## Recommended Improvements

### Phase 1: Immediate Fixes (Can handle 900MB now)
✅ **Already Done:**
- Updated nginx `client_max_body_size` to 1GB
- S3 configured for 5GB uploads
- Authentication and role checking in place

### Phase 2: Chunked Upload Implementation
```typescript
// New API: /api/upload/chunk
// Supports resumable uploads for large files
```

**Benefits:**
- Upload progress tracking
- Resume on connection failure
- Lower memory usage
- Better user experience

### Phase 3: Video Processing Pipeline
1. **FFmpeg Integration** for:
   - Compression (reduce 900MB to ~200-300MB)
   - HLS conversion for adaptive streaming
   - Thumbnail generation
   
2. **Background Processing**:
   - Queue system (Bull/BullMQ)
   - Process videos after upload
   - Email notification when ready

### Phase 4: CDN & Optimization
1. **CloudFront CDN** for S3 videos
2. **Adaptive bitrate streaming** with HLS
3. **Progressive download** for better UX

## Quick Start Guide for 900MB Videos

### Option 1: Direct S3 Upload (Works Now)
```bash
# Your S3 is configured and ready
# Max file size: 5GB
# Videos will upload directly to S3
```

**Steps:**
1. Go to `/admin/courses/[courseId]`
2. Click "Add Lesson"
3. Select your 900MB MP4 file
4. Wait for upload (may take 2-5 minutes)
5. Video will be stored in S3 with signed URLs

### Option 2: Implement S3 Multipart Upload
```javascript
// Add to /src/lib/s3.ts
import { Upload } from "@aws-sdk/lib-storage"

export async function uploadLargeVideo(
  file: File,
  onProgress?: (progress: number) => void
) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `videos/${Date.now()}-${file.name}`,
      Body: file,
      ContentType: file.type,
    },
    partSize: 10 * 1024 * 1024, // 10MB chunks
    queueSize: 4, // 4 parallel uploads
  })

  upload.on("httpUploadProgress", (progress) => {
    if (onProgress && progress.loaded && progress.total) {
      onProgress((progress.loaded / progress.total) * 100)
    }
  })

  await upload.done()
  return upload.key
}
```

### Option 3: Video Compression Script
```bash
# Install FFmpeg on server
sudo apt update
sudo apt install ffmpeg -y

# Compress video (reduce size by 60-70%)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Convert to HLS for streaming
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 23 -preset medium \
  -c:a aac -b:a 128k \
  -hls_time 10 -hls_list_size 0 \
  -f hls output.m3u8
```

## Testing Large Video Upload

### 1. Check Current Limits
```bash
# Nginx limit (should show 1G)
grep client_max_body_size /etc/nginx/sites-available/diamond-district

# Test S3 connection
curl -X POST https://watch.zerotodiamond.com/api/test-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zerotodiamond.com","password":"your-password"}'
```

### 2. Monitor Upload
```bash
# Watch PM2 logs during upload
pm2 logs diamond-district --lines 50

# Check server resources
htop

# Monitor network
iftop
```

## Recommended Next Steps

1. **For immediate use** (900MB files):
   - ✅ System is ready for 900MB uploads
   - Use S3 storage (already configured)
   - Expect 2-5 minute upload times

2. **For better UX**:
   - Implement multipart upload (code above)
   - Add upload progress bar
   - Show upload speed and time remaining

3. **For optimization**:
   - Set up video compression pipeline
   - Convert to HLS for better streaming
   - Implement CDN for global delivery

## Environment Variables Check
```bash
# Verify these are set in .env.local
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
S3_BUCKET_NAME=diamond-district-videos
```

## Current Infrastructure Summary

| Component | Limit | Status |
|-----------|-------|--------|
| Nginx | 1GB | ✅ Ready |
| Next.js API | 5GB (S3), 1GB (local) | ✅ Ready |
| S3 Storage | No limit | ✅ Configured |
| Upload UI | Basic form | ⚠️ No progress bar |
| Video Player | Plyr.js with HLS support | ✅ Ready |
| Streaming | Direct S3 signed URLs | ✅ Working |

## Conclusion

**Your system CAN handle 900MB video uploads right now** using S3 storage. The infrastructure is in place:
- Nginx allows 1GB uploads
- S3 is configured and working
- API supports up to 5GB for S3 uploads
- Signed URLs provide secure streaming

For optimal performance with 900MB files, consider implementing:
1. Multipart upload for better reliability
2. Video compression to reduce file sizes
3. HLS conversion for adaptive streaming
4. Upload progress indicators for better UX

---

# Diamond Plus - Comprehensive Action Plan

## Executive Summary
This action plan outlines the transformation of Diamond District into Diamond Plus, a single-offer coaching portal with 8 modules, private podcasts, coaching events, member directory, and Q&A functionality.

## Phase 1: Component & Functionality Retention Analysis

### A. Core Components to Retain from Diamond District

#### 1. Authentication & Authorization ✓
- **Keep**: NextAuth.js v5 with JWT sessions (30-day expiry)
- **Keep**: Role-based access (USER → DIAMOND_PLUS_MEMBER, ADMIN)
- **Keep**: Protected routes via middleware
- **Modify**: Update role names in database and throughout codebase
- **Remove**: GoHighLevel integration (not needed for Diamond Plus)

#### 2. Video Infrastructure ✓
- **Keep**: MuxPlayerEnhanced component with all features:
  - Signed JWT playback
  - Progress tracking with debouncing
  - Resume functionality (localStorage + server sync)
  - Token auto-refresh
  - Fullscreen, quality switching, playback rates
- **Keep**: Mux webhook handlers for asset status
- **Keep**: Progress API endpoints (`/api/progress/*`)
- **Add**: Mux audio player variant for podcasts

#### 3. UI Components ✓
- **Keep**: All shadcn/ui components (Button, Card, Dialog, Form, etc.)
- **Keep**: AppShell with responsive sidebar
- **Keep**: Container patterns and responsive padding
- **Update**: Color scheme to Diamond Plus branding
- **Remove**: Course-specific layouts

#### 4. Database Models ✓
- **Keep**: User, Progress models
- **Transform**: Course → Program (single), Lesson → Module/Lesson hierarchy
- **Add**: Podcast, CoachingEvent, CoachingReplay, MemberProfile, Thread/Post models
- **Keep**: Prisma as ORM

### B. Features to Remove/Replace
- Course marketplace functionality
- Multi-course support (only one program)
- Payment/checkout flows
- External video storage options (Mux only)

## Phase 2: Community Platform Selection

### Recommended Solution: Giscus (GitHub Discussions)

**Why Giscus?**
- Modern, actively maintained (better than utterances)
- Uses GitHub Discussions (threaded, categorized)
- React component with TypeScript support
- SSR compatible with Next.js 15
- Free and scales infinitely
- Members already need accounts (can use GitHub)

**Integration Plan:**
```typescript
// Install
npm install @giscus/react

// Component usage
<Giscus
  repo="your-org/diamond-plus-discussions"
  repoId="..."
  category="Q&A"
  categoryId="..."
  mapping="pathname"  // /modules/[id] → unique thread
  theme="dark"
  lang="en"
/>
```

**Benefits:**
- Zero infrastructure cost
- Moderation tools built-in
- Markdown support
- Reactions and nested replies
- Search functionality
- Email notifications

### Alternative: Custom Solution with Supabase

If GitHub auth is undesirable:
- Use existing Supabase database
- Create Thread/Post/Reply tables
- Real-time subscriptions for live updates
- Build minimal UI with shadcn components
- ~2 weeks additional development

## Phase 3: Implementation Nuances

### A. Data Architecture

```prisma
// Updated schema excerpt
model User {
  id            String @id @default(cuid())
  email         String @unique
  name          String?
  role          Role @default(DIAMOND_PLUS_MEMBER)
  memberProfile MemberProfile?
  // ... existing fields
}

enum Role {
  ADMIN
  DIAMOND_PLUS_MEMBER
}

model Program {
  id          String @id @default(cuid())
  name        String @default("Diamond Plus")
  description String?
  modules     Module[]
}

model Module {
  id          String @id @default(cuid())
  programId   String
  program     Program @relation(...)
  order       Int
  title       String
  description String?
  thumbnail   String?
  lessons     Lesson[]
  threads     Thread[]  // Q&A threads
}

model Podcast {
  id           String @id @default(cuid())
  title        String
  description  String?
  muxPlaybackId String
  muxAssetId   String
  duration     Int?
  transcript   String? @db.Text
  publishedAt  DateTime
  order        Int
}

model CoachingEvent {
  id          String @id @default(cuid())
  title       String
  description String?
  scheduledAt DateTime
  joinUrl     String?
  replay      CoachingReplay?
}

model CoachingReplay {
  id            String @id @default(cuid())
  eventId       String @unique
  event         CoachingEvent @relation(...)
  muxPlaybackId String
  muxAssetId    String
  duration      Int?
  publishedAt   DateTime
}

model MemberProfile {
  id             String @id @default(cuid())
  userId         String @unique
  user           User @relation(...)
  displayName    String
  industry       String?
  impossibleGoal String? @db.Text
  bio            String? @db.Text
  avatarUrl      String?
  isPublic       Boolean @default(true)
}

model Thread {
  id        String @id @default(cuid())
  moduleId  String
  module    Module @relation(...)
  authorId  String
  author    User @relation(...)
  title     String
  content   String @db.Text
  isPinned  Boolean @default(false)
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        String @id @default(cuid())
  threadId  String
  thread    Thread @relation(...)
  authorId  String
  author    User @relation(...)
  content   String @db.Text
  createdAt DateTime @default(now())
}
```

### B. Route Structure

```
/dashboard                 → Module grid, latest content cards
/modules                   → All 8 modules grid view
/modules/[moduleId]        → Module detail with lessons + Q&A
/modules/[moduleId]/lessons/[lessonId] → Video playback

/podcasts                  → Private podcast library
/podcasts/[podcastId]      → Individual podcast with transcript

/coaching                  → Upcoming events + replays
/coaching/events/[eventId] → Event details
/coaching/replays/[replayId] → Replay playback

/community/directory       → Member profiles grid
/community/members/[userId] → Individual profile

/me/profile               → Edit own profile
/help                     → Platform help

/admin                    → Admin dashboard
/admin/modules            → Module CRUD
/admin/podcasts           → Podcast CRUD
/admin/coaching           → Event/Replay CRUD
/admin/members            → Member management
```

### C. Dashboard Implementation

```tsx
// app/(app)/dashboard/page.tsx
export default async function DashboardPage() {
  const modules = await getModulesWithProgress()
  const latestPodcast = await getLatestPodcast()
  const nextEvent = await getNextCoachingEvent()
  const latestReplay = await getLatestReplay()
  
  return (
    <>
      {/* Hero Banner */}
      <WelcomeBanner />
      
      {/* Modules Rail */}
      <section>
        <h2>Welcome Course Videos</h2>
        <ModulesCarousel modules={modules} />
      </section>
      
      {/* Podcasts Rail */}
      <section>
        <h2>Diamond+ Podcasts</h2>
        <PodcastsCarousel />
      </section>
      
      {/* Resources Grid */}
      <section>
        <h2>Resources</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ReplayCard replay={latestReplay} />
          <EventCard event={nextEvent} />
          <WorksheetCard />
          <QuestionSubmitCard />
        </div>
      </section>
    </>
  )
}
```

### D. Mux Audio Implementation for Podcasts

```tsx
// components/MuxAudioPlayer.tsx
import MuxPlayer from '@mux/mux-player-react'

export function MuxAudioPlayer({ 
  playbackId, 
  title,
  onProgress 
}: MuxAudioPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      audio
      style={{ height: '60px' }}
      metadata={{
        videoTitle: title,
        viewerUserId: session?.user?.id
      }}
      onTimeUpdate={onProgress}
    />
  )
}
```

### E. Member Directory with Filtering

```tsx
// app/(app)/community/directory/page.tsx
export default async function DirectoryPage({
  searchParams
}: {
  searchParams: { industry?: string; search?: string }
}) {
  const members = await prisma.memberProfile.findMany({
    where: {
      isPublic: true,
      ...(searchParams.industry && { 
        industry: searchParams.industry 
      }),
      ...(searchParams.search && {
        OR: [
          { displayName: { contains: searchParams.search } },
          { bio: { contains: searchParams.search } },
          { impossibleGoal: { contains: searchParams.search } }
        ]
      })
    },
    include: { user: true }
  })
  
  return (
    <>
      <DirectoryFilters />
      <MemberGrid members={members} />
    </>
  )
}
```

## Phase 4: Migration Strategy

### Week 1: Foundation
1. Fork Diamond District as `diamond-plus`
2. Update role enum (USER → DIAMOND_PLUS_MEMBER)
3. Remove course marketplace UI
4. Create new Prisma schema with additions
5. Run migrations on development database

### Week 2: Core Features
1. Build Program/Module/Lesson structure
2. Adapt MuxPlayerEnhanced for audio (podcasts)
3. Create podcast list/detail pages
4. Implement coaching event/replay system
5. Build admin CRUD for all content types

### Week 3: Community Features
1. Set up Giscus repository and categories
2. Integrate Giscus components into module pages
3. Build member profile system
4. Create directory with search/filter
5. Implement profile editing

### Week 4: Polish & Launch
1. Update dashboard with all card types
2. Implement help page with video
3. Style updates for Diamond Plus branding
4. Testing and bug fixes
5. Production deployment

## Phase 5: Technical Considerations

### Performance Optimizations
- Use `unstable_cache` for module/podcast lists
- Implement ISR for rarely-changing content
- Lazy load Giscus components
- Optimize images with Next.js Image

### Security
- Maintain signed Mux URLs for all content
- Validate DIAMOND_PLUS_MEMBER role on all routes
- Sanitize user-generated content in profiles
- Rate limit API endpoints

### Monitoring
- Keep existing Sentry integration
- Add analytics for podcast/replay engagement
- Track Q&A participation metrics
- Monitor Mux bandwidth usage

## Conclusion

This plan provides a clear path from Diamond District to Diamond Plus while:
- Retaining all valuable infrastructure (Mux, auth, UI)
- Adding purpose-built features (podcasts, coaching, community)
- Using proven solutions (Giscus) for complex features
- Maintaining code quality and performance

Total estimated timeline: 4 weeks with one developer, 2-3 weeks with two developers.