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
