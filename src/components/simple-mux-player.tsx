'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface SimpleMuxPlayerProps {
  playbackId: string
  className?: string
  onEnded?: () => void
}

export function SimpleMuxPlayer({ playbackId, className = '', onEnded }: SimpleMuxPlayerProps) {
  const [tokens, setTokens] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch tokens when component mounts or playbackId changes
    async function fetchTokens() {
      try {
        const response = await fetch('/api/mux/playback-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playbackId })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        setTokens(data.tokens)
      } catch (err: any) {
        console.error('[SimpleMuxPlayer] Error:', err)
        setError(err.message)
      }
    }

    fetchTokens()
  }, [playbackId])

  if (error) {
    return (
      <div className={`${className} bg-black rounded-lg flex items-center justify-center`}>
        <div className="text-red-500 text-center p-8">
          <p className="font-semibold">Unable to load video</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!tokens) {
    return (
      <div className={`${className} bg-black rounded-lg flex items-center justify-center`}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    )
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={tokens}
      streamType="on-demand"
      className={className}
      onEnded={onEnded}
      theme="minimal"
      primaryColor="#FFFFFF"
      secondaryColor="#000000"
      accentColor="#176FFF"
      style={{
        '--media-control-background': 'rgba(0, 0, 0, 0.7)',
        '--media-control-hover-background': 'rgba(0, 0, 0, 0.8)',
        '--media-range-track-background': 'rgba(255, 255, 255, 0.3)',
        '--media-range-track-progress-background': '#176FFF',
        '--media-range-thumb-background': '#FFFFFF',
        '--media-time-buffered-color': 'rgba(255, 255, 255, 0.4)',
        '--media-font-family': 'system-ui, -apple-system, sans-serif'
      } as any}
    />
  )
}
