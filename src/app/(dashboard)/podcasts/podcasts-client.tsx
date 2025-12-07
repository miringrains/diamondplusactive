'use client'

import { useState } from 'react'
import { PodcastPlayer } from '@/components/podcast-player'

interface Podcast {
  id: string
  title: string
  description: string
  duration: number
  episodeNumber: number
  publishedAt: string
  muxPlaybackId: string
  requiresToken?: boolean
}

interface PodcastsClientProps {
  initialPodcasts: Podcast[]
}

export default function PodcastsClient({ initialPodcasts }: PodcastsClientProps) {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)

  if (initialPodcasts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600">No episodes available yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PodcastPlayer
      episodeNumber={initialPodcasts[currentEpisodeIndex].episodeNumber}
      title={initialPodcasts[currentEpisodeIndex].title}
      description={initialPodcasts[currentEpisodeIndex].description}
      muxPlaybackId={initialPodcasts[currentEpisodeIndex].muxPlaybackId}
      duration={initialPodcasts[currentEpisodeIndex].duration}
      requiresToken={initialPodcasts[currentEpisodeIndex].requiresToken || false}
      episodes={initialPodcasts}
      currentEpisodeIndex={currentEpisodeIndex}
      onEpisodeChange={setCurrentEpisodeIndex}
    />
  )
}

