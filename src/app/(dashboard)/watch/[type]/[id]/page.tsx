import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VideoPlayerWithPlaylist from './video-player-with-playlist'
import { prisma } from '@/lib/db'

// Force dynamic rendering for Vercel (requires database access)
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getVideoContent(type: string, id: string) {
  // Handle group calls
  if (type === 'group-calls') {
    const videos = await prisma.group_calls.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        mux_playback_id: true,
        duration: true,
        thumbnail_url: true,
        call_date: true,
      },
      where: {
        mux_playback_id: {
          not: null,
        },
        published: true,
      },
      orderBy: {
        call_date: 'desc',
      },
    })

    const currentIndex = videos.findIndex(video => video.id === id)
    if (currentIndex === -1 || !videos[currentIndex].mux_playback_id) {
      return null
    }

    return {
      title: 'Weekly Group Calls',
      description: 'Join our weekly group calls for training, Q&A, and community support',
      currentVideoIndex: currentIndex,
      videos: videos.map((video, index) => ({
        id: video.id,
        title: video.title || 'Untitled Call',
        duration: video.duration ? (() => {
          const hours = Math.floor(video.duration / 3600)
          const minutes = Math.floor((video.duration % 3600) / 60)
          const seconds = Math.round(video.duration % 60)
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })() : '00:00:00',
        playbackId: video.mux_playback_id || '',
        thumbnailUrl: video.thumbnail_url || null,
        isCurrentlyPlaying: index === currentIndex,
        isCompleted: false,
        requiresToken: true
      }))
    }
  }

  // Handle scripts
  if (type === 'scripts') {
    const videos = await prisma.script_videos.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        mux_playback_id: true,
        duration: true,
        thumbnail_url: true,
        order: true,
      },
      where: {
        mux_playback_id: {
          not: null,
        },
        published: true,
      },
      orderBy: {
        order: 'asc',
      },
    })

    const currentIndex = videos.findIndex(video => video.id === id)
    if (currentIndex === -1 || !videos[currentIndex].mux_playback_id) {
      return null
    }

    return {
      title: 'Scripts & Live Prospecting',
      description: 'Master the art of prospecting with proven scripts and techniques',
      currentVideoIndex: currentIndex,
      videos: videos.map((video, index) => ({
        id: video.id,
        title: video.title || 'Untitled Video',
        duration: video.duration ? (() => {
          const hours = Math.floor(video.duration / 3600)
          const minutes = Math.floor((video.duration % 3600) / 60)
          const seconds = Math.round(video.duration % 60)
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })() : '00:00:00',
        playbackId: video.mux_playback_id || '',
        thumbnailUrl: video.thumbnail_url || null,
        isCurrentlyPlaying: index === currentIndex,
        isCompleted: false,
        requiresToken: true
      }))
    }
  }

  // Handle challenge videos
  if (type === 'challenges') {
    const videos = await prisma.challenge_videos.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        mux_playback_id: true,
        duration: true,
        thumbnail_url: true,
        order_index: true,
        challenge_id: true,
        mux_policy: true,
      },
      where: {
        mux_playback_id: {
          not: null,
        },
        published: true,
      },
      orderBy: {
        order_index: 'asc',
      },
    })

    const currentIndex = videos.findIndex(video => video.id === id)
    if (currentIndex === -1 || !videos[currentIndex].mux_playback_id) {
      return null
    }

    const currentVideo = videos[currentIndex]
    const challengeTitle = currentVideo.challenge_id === 'challenge-9' 
      ? 'Challenge 9: Set More Listing Appointments' 
      : `Challenge: ${currentVideo.challenge_id}`

    return {
      title: challengeTitle,
      description: 'Complete challenge training to accelerate your growth',
      currentVideoIndex: currentIndex,
      videos: videos.map((video, index) => ({
        id: video.id,
        title: video.title || 'Untitled Video',
        duration: video.duration ? (() => {
          const hours = Math.floor(video.duration / 3600)
          const minutes = Math.floor((video.duration % 3600) / 60)
          const seconds = Math.round(video.duration % 60)
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })() : '00:00:00',
        playbackId: video.mux_playback_id || '',
        thumbnailUrl: video.thumbnail_url || null,
        isCurrentlyPlaying: index === currentIndex,
        isCompleted: false,
        requiresToken: video.mux_policy === 'signed'
      }))
    }
  }

  // Handle welcome videos (hardcoded for now)
  if (type === 'welcome') {
    const welcomeVideos = [
      {
        id: '1',
        title: 'Getting Started',
        mux_playback_id: 's1owStS37QXJ02jgP3PVe7v69jgt012jWIz7ON7Kot01cM',
        duration: 434, // 7:14
        thumbnail_url: null
      },
      {
        id: '2',
        title: 'Simplify Your Business',
        mux_playback_id: 's7Iqqf8uwbWK3hBoDHB18X1bLCU6hzn8EWX02JsYfbww',
        duration: 703, // 11:43
        thumbnail_url: null
      },
      {
        id: '3',
        title: 'Learn The Business',
        mux_playback_id: 'jAlafTCO201hAfUqfd008kwMPsrlYesHf029TDYUeE97UM',
        duration: 1055, // 17:35
        thumbnail_url: null
      }
      // Note: Videos 4-5 are placeholders and only shown on dashboard, not in playlist
    ]

    const currentIndex = welcomeVideos.findIndex(video => video.id === id)
    if (currentIndex === -1) {
      return null
    }

    return {
      title: 'Welcome Videos',
      description: `Get started with Diamond Plus

Resources:
• 90 Day Action Plan: https://drive.google.com/file/d/1zmqEv8N02NBQIr4W8lAJBvrpeklBjtmv/view?usp=sharing
• $100k Month Framework: https://docs.google.com/document/d/1Eiemi-dEkiO6cXhAHzNadZUibQt7eNM-2cKI56u-0Hw/edit?tab=t.0#heading=h.wwsy9hhw1i4m
• ISA SOP: https://drive.google.com/drive/folders/1tLWg0a8260JAYSV9Z4sOjxDoNWwmhGkA
• Scripts: https://diamondplusportal.com/scripts`,
      currentVideoIndex: currentIndex,
      videos: welcomeVideos.map((video, index) => ({
        id: video.id,
        title: video.title,
        duration: video.duration ? (() => {
          const hours = Math.floor(video.duration / 3600)
          const minutes = Math.floor((video.duration % 3600) / 60)
          const seconds = Math.round(video.duration % 60)
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        })() : '00:00:00',
        playbackId: video.mux_playback_id || '',
        thumbnailUrl: video.thumbnail_url || null,
        isCurrentlyPlaying: index === currentIndex,
        isCompleted: false,
        requiresToken: true
      }))
    }
  }

  return null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}): Promise<Metadata> {
  const { type, id } = await params
  const content = await getVideoContent(type, id)
  
  if (!content) {
    return {
      title: 'Video Not Found',
    }
  }

  return {
    title: `${content.title} | Diamond Plus`,
    description: content.description,
  }
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id } = await params
  const content = await getVideoContent(type, id)
  
  if (!content) {
    notFound()
  }

  return <VideoPlayerWithPlaylist content={content} type={type} id={id} />
}