'use client'

import { useEffect, useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'

interface SimpleMuxPlayerEnhancedProps {
  playbackId: string
  className?: string
  onEnded?: () => void
  requiresToken?: boolean
  videoType?: 'group-calls' | 'scripts' | 'challenges' | 'welcome'
  videoId?: string
}

export function SimpleMuxPlayerEnhanced({ 
  playbackId, 
  className = '', 
  onEnded,
  requiresToken = false,
  videoType = 'group-calls',
  videoId
}: SimpleMuxPlayerEnhancedProps) {
  const [tokens, setTokens] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(requiresToken)

  useEffect(() => {
    // Only fetch tokens if required
    if (!requiresToken) {
      setLoading(false)
      return
    }

    async function fetchTokens() {
      try {
        // Since all videos are signed Mux assets, use the same endpoint
        const endpoint = '/api/mux/playback-token'
        const body = { playbackId }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        // Handle different response formats
        if (data.tokens) {
          setTokens(data.tokens)
        } else {
          // For endpoints that return tokens directly
          setTokens(data)
        }
        setLoading(false)
      } catch (err: any) {
        console.error('[SimpleMuxPlayerEnhanced] Error:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchTokens()
  }, [playbackId, requiresToken, videoType, videoId])

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

  if (loading) {
    return (
      <div className={`${className} bg-black rounded-lg flex items-center justify-center`}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading secure video...</p>
        </div>
      </div>
    )
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={requiresToken ? tokens : undefined}
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
