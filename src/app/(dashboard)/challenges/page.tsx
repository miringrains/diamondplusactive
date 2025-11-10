import { prisma } from '@/lib/db'
import ChallengesClient from './challenges-client'

export default async function ChallengesPage() {
  // Fetch challenge videos from database
  const challengeVideos = await prisma.challenge_videos.findMany({
    where: {
      challenge_id: 'challenge-9',
      published: true,
      mux_playback_id: {
        not: null
      }
    },
    orderBy: {
      order_index: 'asc'
    }
  })

  // Transform to match expected format
  const challenge9Videos = challengeVideos.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    muxPlaybackId: video.mux_playback_id,
    thumbnailUrl: video.thumbnail_url,
    duration: video.duration,
    requiresToken: video.mux_policy === 'signed'
  }))

  return <ChallengesClient challenge9Videos={challenge9Videos} />
}