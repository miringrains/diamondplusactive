import { prisma } from '@/lib/db'
import ScriptsClient from './scripts-client'

// Force dynamic rendering for Vercel (requires database access)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ScriptsPage() {
  // Fetch script videos from database
  const scriptVideos = await prisma.script_videos.findMany({
    where: {
      published: true,
      mux_playback_id: {
        not: null
      }
    },
    orderBy: {
      order: 'asc'
    }
  })

  // Transform to match expected format
  const liveProspectingVideos = scriptVideos.map((video) => ({
    id: video.id,
    title: video.title,
    duration: video.duration ? (() => {
      const hours = Math.floor(video.duration / 3600);
      const minutes = Math.floor((video.duration % 3600) / 60);
      const seconds = Math.round(video.duration % 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    })() : '',
    muxPlaybackId: video.mux_playback_id,
    vimeoId: video.vimeo_id,
    thumbnailUrl: video.thumbnail_url
  }))

  return <ScriptsClient liveProspectingVideos={liveProspectingVideos} />
}
