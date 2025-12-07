import { prisma } from '@/lib/db'
import ChallengesClient from './challenges-client'

// Force dynamic rendering for Vercel (requires database access)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ChallengesPage() {
  // Fetch Challenge 9 videos
  const challenge9Data = await prisma.challenge_videos.findMany({
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

  // Fetch Challenge 8 videos
  const challenge8Data = await prisma.challenge_videos.findMany({
    where: {
      challenge_id: 'challenge-8',
      published: true,
      mux_playback_id: {
        not: null
      }
    },
    orderBy: {
      order_index: 'asc'
    }
  })

  // Fetch Challenge 6 videos
  const challenge6Data = await prisma.challenge_videos.findMany({
    where: {
      challenge_id: 'challenge-6',
      published: true,
      mux_playback_id: {
        not: null
      }
    },
    orderBy: {
      order_index: 'asc'
    }
  })

  // Transform Challenge 9
  const challenge9Videos = challenge9Data.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    muxPlaybackId: video.mux_playback_id,
    thumbnailUrl: video.thumbnail_url,
    duration: video.duration,
    requiresToken: video.mux_policy === 'signed'
  }))

  // Transform Challenge 8
  const challenge8Videos = challenge8Data.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    muxPlaybackId: video.mux_playback_id,
    thumbnailUrl: video.thumbnail_url,
    duration: video.duration,
    requiresToken: video.mux_policy === 'signed'
  }))

  // Transform Challenge 6
  const challenge6Videos = challenge6Data.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    muxPlaybackId: video.mux_playback_id,
    thumbnailUrl: video.thumbnail_url,
    duration: video.duration,
    requiresToken: video.mux_policy === 'signed'
  }))

  return <ChallengesClient challenge9Videos={challenge9Videos} challenge8Videos={challenge8Videos} challenge6Videos={challenge6Videos} />
}