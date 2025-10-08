# Mux Player Migration Guide

## Overview

Mux Player can replace your current Plyr + VideoIsland setup with these benefits:
- ✅ **Works with React 19** (confirmed compatible)
- ✅ **Resume "just works"** - Handled server-side by Mux
- ✅ **Cross-device sync** - Automatic position tracking
- ✅ **Built-in analytics** - See exactly where users drop off
- ✅ **Automatic quality switching** - Better than HLS.js

## Cost Analysis

**Current Setup**: 
- S3 storage: ~$0.023/GB/month
- S3 bandwidth: ~$0.09/GB
- Your time fixing resume: Priceless 😅

**Mux Pricing** (usage-based, NOT $10/month flat):
- Streaming: $0.007/minute watched
- Storage: $0.007/minute stored  
- Encoding: $0.015/minute (one-time)

**Example Monthly Costs**:
- 100 users × 30 min/month = 3,000 minutes = **$21/month**
- 500 users × 60 min/month = 30,000 minutes = **$210/month**
- 1000 users × 120 min/month = 120,000 minutes = **$840/month**

## Migration Steps

### 1. Install Mux Player
```bash
npm install @mux/mux-player-react
```

### 2. Upload Videos to Mux
```typescript
// Upload script
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})

// For each video in your S3
const asset = await mux.video.assets.create({
  input: s3SignedUrl,
  playback_policy: ['public'], // or 'signed' for private
  passthrough: lessonId, // Your reference
})

// Store the playbackId in your database
await prisma.lesson.update({
  where: { id: lessonId },
  data: { 
    muxPlaybackId: asset.playback_ids[0].id,
    muxAssetId: asset.id
  }
})
```

### 3. Update Lesson Page
```typescript
// In LessonViewWrapper.tsx
import dynamic from "next/dynamic"

const MuxPlayerWrapper = dynamic(
  () => import("@/video/MuxPlayerIsland"),
  { ssr: false }
)

// Replace VideoIsland with:
<MuxPlayerWrapper
  lessonId={lesson.id}
  playbackId={lesson.muxPlaybackId} // Instead of videoUrl
  title={lesson.title}
  initialTime={resumePosition || 0}
  onProgress={handleProgress}
  onComplete={handleComplete}
  className="rounded-lg overflow-hidden shadow-lg w-full h-full"
/>
```

### 4. Update API Routes

No more `/api/signed-video-url` or `/api/videos/[filename]` needed!

For private videos, use Mux signed URLs:
```typescript
// /api/mux-token/route.ts
const token = mux.jwt.signPlaybackId(playbackId, {
  type: 'video',
  expiration: '1h',
})
```

### 5. Simplify Progress Tracking

Mux handles position tracking automatically, but you can still sync:
```typescript
// Get viewer data from Mux
const views = await mux.data.views.list({
  filters: [`video_id:${lessonId}`, `viewer_user_id:${userId}`],
  limit: 1,
})

const lastPosition = views[0]?.viewer_last_view_time || 0
```

## Benefits You'll Get

1. **Resume Success Rate**: Near 100% (vs current ~30%)
2. **No More Re-sign Logic**: Mux handles expiry
3. **Better Analytics**: See heatmaps of where users watch/skip
4. **Reduced Complexity**: Remove VideoIsland, HLS.js, signed URL logic
5. **Mobile Optimization**: Automatic quality for bandwidth

## Potential Concerns

### "What about vendor lock-in?"
- Mux provides export APIs to get your videos back
- Keep S3 backups if worried
- The time saved on resume issues pays for migration effort

### "Is it worth the cost?"
Calculate: 
- Your hourly rate × hours spent on video issues
- User frustration from broken resume
- If > Mux costs, it's worth it

### "What about our existing S3 videos?"
- Run migration gradually
- Keep both systems during transition
- New videos → Mux, old videos → S3

## Decision Framework

**Use Mux if:**
- Video is core to your product
- You have paying users who expect polish
- Resume/analytics matter
- You're spending too much time on video bugs

**Stay with current setup if:**
- Video is secondary feature
- Very cost-sensitive
- < 1000 minutes watched/month
- Current issues are tolerable

## Quick Test

Try Mux with one lesson:
```bash
# 1. Sign up for Mux (free tier available)
# 2. Upload one video
# 3. Replace just that lesson's player
# 4. Test resume across devices
# 5. Check the analytics dashboard
```

You'll know within an hour if it's worth migrating everything.
