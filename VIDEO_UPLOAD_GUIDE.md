# Video Upload & Configuration Guide for Diamond Plus

## Quick Start

To add new videos to any section of Diamond Plus:

### 1. Upload to Mux

1. Go to your Mux dashboard (Production environment)
2. Upload your video
3. Set to **Private** for premium content
4. Note down:
   - **Asset ID**: e.g., `ZOJ2qmr9s9J8hWxGvEdRXR7YBRcDL2HlTvWZs3DMIdc`
   - **Playback ID**: e.g., `LAqKP00m02x9U4gZYp4954yMFT9dWt01GrmUSZTK9bTXW4`

### 2. Add to Database

Use this script template:

```javascript
// scripts/add-videos-to-[section].js
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addVideo() {
  const video = await prisma.[table_name].create({
    data: {
      title: "Your Video Title",
      description: "Video description",
      mux_playback_id: "YOUR_PLAYBACK_ID",
      mux_asset_id: "YOUR_ASSET_ID",
      thumbnail_url: `https://image.mux.com/YOUR_PLAYBACK_ID/thumbnail.png`,
      duration: 3600, // Duration in seconds
      published: true,
      // Add any section-specific fields
    }
  })
  console.log('Added video:', video.id)
}

addVideo()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run with: `node scripts/add-videos-to-[section].js`

## Key Components

### 1. SimpleMuxPlayer
Location: `/src/components/simple-mux-player.tsx`

Use this for all video playback:
```tsx
<SimpleMuxPlayer
  playbackId={video.mux_playback_id}
  className="w-full aspect-video"
  onEnded={() => console.log('Video ended')}
/>
```

### 2. MuxThumbnail
Location: `/src/components/mux-thumbnail.tsx`

Use this for all video thumbnails:
```tsx
<MuxThumbnail
  playbackId={video.mux_playback_id}
  alt={video.title}
  width={640}
  height={360}
  className="w-full h-full object-cover"
/>
```

## Environment Configuration

Your `.env` file must have:
```env
# Mux API Credentials
MUX_TOKEN_ID="11af1ce0-bfeb-41d7-98c2-5f0465d7545c"
MUX_TOKEN_SECRET="[your-token-secret]"

# Mux Signing Keys (for private videos)
MUX_SIGNING_KEY_ID="3FFIw1z7j4G8bbqwAs00HCfGEKHfBhgybnANglVnLwwQ"
MUX_SIGNING_KEY_BASE64="[your-base64-encoded-private-key]"
MUX_SIGNED_PLAYBACK=true
```

## Database Schema Template

For new video sections, add a table like:

```sql
CREATE TABLE your_section_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  mux_playback_id VARCHAR(255),
  mux_asset_id VARCHAR(255),
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Page Template

For a new video section page:

```tsx
// app/(dashboard)/your-section/page.tsx
import { prisma } from '@/lib/db'
import YourSectionClient from './your-section-client'

export default async function YourSectionPage() {
  const videos = await prisma.your_section_videos.findMany({
    where: { published: true },
    orderBy: { created_at: 'desc' }
  })

  return <YourSectionClient videos={videos} />
}
```

## Client Component Template

```tsx
// app/(dashboard)/your-section/your-section-client.tsx
'use client'

import { MuxThumbnail } from '@/components/mux-thumbnail'
import Link from 'next/link'

export default function YourSectionClient({ videos }) {
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.round(seconds % 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Link key={video.id} href={`/watch/your-section/${video.id}`}>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-video">
              <MuxThumbnail
                playbackId={video.mux_playback_id}
                alt={video.title}
                width={640}
                height={360}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{video.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{video.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

## Watch Page Template

Create watch pages at: `/app/(dashboard)/watch/[type]/[id]/page.tsx`

The existing watch page infrastructure will handle:
- Video playback with signed URLs
- Playlist sidebar
- Navigation between videos

Just add your section to the `getVideoContent` function.

## Troubleshooting

### Videos not playing?
1. Check Mux dashboard - is the video "Ready"?
2. Verify signing credentials match your Mux environment
3. Check browser console for token errors

### Thumbnails not loading?
1. Ensure `next.config.js` has `image.mux.com` in allowed domains
2. Check if video is private - thumbnails need signed tokens too

### Duration showing incorrectly?
Store duration in seconds in database, format with the `formatDuration` function

## Helper Scripts

### Check video status:
```javascript
// scripts/check-mux-status.js
import Mux from '@mux/mux-node'

const mux = new Mux()
const asset = await mux.video.assets.retrieve('ASSET_ID')
console.log('Status:', asset.status)
console.log('Duration:', asset.duration)
```

### Batch import videos:
```javascript
// scripts/batch-import.js
const videos = [
  { title: "Video 1", assetId: "...", playbackId: "...", duration: 3600 },
  { title: "Video 2", assetId: "...", playbackId: "...", duration: 2400 },
]

for (const video of videos) {
  await prisma.videos.create({ data: video })
}
```

## Best Practices

1. **Always use private videos** for premium content
2. **Store durations** when adding videos (get from Mux asset details)
3. **Use consistent naming** for database fields: `mux_playback_id`, `mux_asset_id`
4. **Test locally first** before deploying
5. **Monitor Mux usage** to avoid unexpected costs

## Support

- Mux Dashboard: https://dashboard.mux.com
- Mux Docs: https://docs.mux.com
- Our components: `/src/components/simple-mux-player.tsx` and `/src/components/mux-thumbnail.tsx`

