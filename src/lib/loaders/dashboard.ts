import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

interface WelcomeLesson {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  progress: number
  isStartHere?: boolean
  isNextUp?: boolean
  muxPlaybackId?: string
}

export async function getWelcomeLessons(): Promise<WelcomeLesson[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  try {
    // Get Diamond Plus module content
    const modules = await prisma.dp_content.findMany({
      where: {
        type: 'module',
        is_published: true
      },
      include: {
        dp_videos: {
          include: {
            dp_progress: {
              where: {
                user_id: session.user.id
              },
              take: 1
            }
          },
          orderBy: {
            order_index: 'asc'
          }
        }
      },
      orderBy: {
        order_index: 'asc'
      }
    })

    // Collect all videos from all modules
    const allLessons: WelcomeLesson[] = []
    let firstIncompleteFound = false

    modules.forEach((module) => {
      module.dp_videos.forEach((video, videoIndex) => {
        const userProgress = video.dp_progress?.[0]
        const progressPercentage = userProgress?.completed 
          ? 100 
          : userProgress?.progress_seconds && video.duration
            ? Math.round((userProgress.progress_seconds / video.duration) * 100)
            : 0
        const isComplete = progressPercentage === 100

        // Mark first video as "Start Here" if no progress anywhere
        const isStartHere = allLessons.length === 0 && allLessons.every(l => l.progress === 0)
        
        // Mark first incomplete video as "Next Up"
        const isNextUp = !isComplete && !firstIncompleteFound && allLessons.some(l => l.progress > 0)
        if (isNextUp) {
          firstIncompleteFound = true
        }

        allLessons.push({
          id: video.id,
          title: video.title,
          description: module.title, // Use module title as description
          thumbnailUrl: video.thumbnail_url || module.thumbnail_url || null,
          progress: progressPercentage,
          isStartHere,
          isNextUp,
          muxPlaybackId: video.mux_playback_id || undefined
        })
      })
    })

    // Take only first 8 videos for the welcome rail
    return allLessons.slice(0, 8)
  } catch (error) {
    console.error("Error fetching welcome lessons:", error)
    return []
  }
}

interface RecentPodcast {
  id: string
  title: string
  description: string
  duration: number
  episodeNumber: number
  publishedAt: Date
  muxPlaybackId: string
}

export async function getRecentPodcasts(): Promise<RecentPodcast[]> {
  try {
    // Query dp_podcasts directly for reliability
    const podcasts = await prisma.dp_podcasts.findMany({
      where: {
        published: true,
        mux_playback_id: {
          not: null
        }
      },
      orderBy: {
        episode_number: 'desc'
      }
    })

    return podcasts.map((podcast) => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description || '',
      duration: podcast.duration || 0,
      episodeNumber: podcast.episode_number || 1,
      publishedAt: podcast.published_at || podcast.created_at,
      muxPlaybackId: podcast.mux_playback_id || '',
      requiresToken: (podcast as any).mux_policy === 'signed'
    }))
  } catch (error) {
    console.error("Error fetching recent podcasts:", error)
    return []
  }
}

interface WelcomeVideo {
  id: string
  title: string
  description: string | null
  muxPlaybackId: string | null
  duration: number | null
  thumbnailUrl: string | null
  order: number
}

export async function getWelcomeVideos(): Promise<WelcomeVideo[]> {
  // Hardcoded welcome videos for now
  const welcomeVideos = [
    {
      id: '1',
      title: 'Getting Started',
      description: null,
      muxPlaybackId: 's1owStS37QXJ02jgP3PVe7v69jgt012jWIz7ON7Kot01cM',
      duration: 434, // 7:14
      thumbnailUrl: null,
      order: 1
    },
    {
      id: '2',
      title: 'Simplify Your Business',
      description: null,
      muxPlaybackId: 's7Iqqf8uwbWK3hBoDHB18X1bLCU6hzn8EWX02JsYfbww',
      duration: 703, // 11:43
      thumbnailUrl: null,
      order: 2
    },
    {
      id: '3',
      title: 'Learn The Business',
      description: null,
      muxPlaybackId: 'jAlafTCO201hAfUqfd008kwMPsrlYesHf029TDYUeE97UM',
      duration: 1055, // 17:35
      thumbnailUrl: null,
      order: 3
    },
    {
      id: '4',
      title: 'LeadGen System',
      description: null,
      muxPlaybackId: 'crwlkghZAZNzftqx00Z02oyekmuHQuBHKTFMEYGYLQOK8',
      duration: 1426, // 23:46
      thumbnailUrl: null,
      order: 4
    },
    {
      id: '5',
      title: 'Coming Soon',
      description: null,
      muxPlaybackId: null,
      duration: null,
      thumbnailUrl: null,
      order: 5
    }
  ]

  // Generate thumbnail URLs for videos with muxPlaybackId
  return welcomeVideos.map(video => ({
    ...video,
    thumbnailUrl: video.thumbnailUrl || (video.muxPlaybackId 
      ? `https://image.mux.com/${video.muxPlaybackId}/thumbnail.png?time=5`
      : null)
  }))
}
