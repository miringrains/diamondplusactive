'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [tokenLoading, setTokenLoading] = useState(requiresToken)
  const [playerKey, setPlayerKey] = useState(0)
  const retryCountRef = useRef(0)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    // Only fetch tokens if required
    if (!requiresToken) {
      setTokenLoading(false)
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
        setTokenLoading(false)
      } catch (err: any) {
        console.error('[SimpleMuxPlayerEnhanced] Token fetch error:', err)
        setError('token-fetch')
        setTokenLoading(false)
      }
    }

    fetchTokens()
  }, [playbackId, requiresToken, videoType, videoId])

  // Error handler with retry logic
  const handleError = (event: any) => {
    const errorDetail = event?.detail?.error || event?.error || event
    const errorMessage = errorDetail?.message || event?.detail?.message || ''
    
    console.error('[SimpleMuxPlayerEnhanced] Playback error:', {
      message: errorMessage,
      code: errorDetail?.code,
      detail: errorDetail,
      retryCount: retryCountRef.current
    })

    // PIPELINE_ERROR_DECODE - Browser codec or network segment issue
    if (errorMessage.includes('PIPELINE_ERROR_DECODE') || 
        errorMessage.includes('decode error') ||
        errorMessage.includes('decode')) {
      
      if (retryCountRef.current < 3) {
        console.log(`[SimpleMuxPlayerEnhanced] Decode error, retry ${retryCountRef.current + 1}/3`)
        retryCountRef.current++
        
        // Force remount with exponential backoff
        setTimeout(() => {
          setPlayerKey(prev => prev + 1)
        }, Math.pow(2, retryCountRef.current - 1) * 1000)
        
        return
      }
      
      // After 3 retries, show user-friendly error
      console.error('[SimpleMuxPlayerEnhanced] Decode error after 3 retries')
      setError('playback-decode')
      return
    }

    // Network errors (MEDIA_ERR_NETWORK = 2, HLS segment failures)
    if (errorDetail?.code === 2 || 
        errorDetail?.code === 'NETWORK_ERROR' ||
        errorMessage.includes('network') ||
        errorMessage.includes('Network')) {
      
      if (retryCountRef.current < 3) {
        console.log(`[SimpleMuxPlayerEnhanced] Network error, retry ${retryCountRef.current + 1}/3`)
        retryCountRef.current++
        
        // Wait then reload player
        setTimeout(() => {
          setPlayerKey(prev => prev + 1)
        }, 2000 * retryCountRef.current)
        
        return
      }
      
      console.error('[SimpleMuxPlayerEnhanced] Network error after 3 retries')
      setError('network-error')
      return
    }

    // Generic error
    console.error('[SimpleMuxPlayerEnhanced] Unhandled error:', errorMessage)
    setError('playback-error')
  }

  // Reset retry count on successful play
  const handlePlay = () => {
    if (retryCountRef.current > 0) {
      console.log('[SimpleMuxPlayerEnhanced] Playback successful, resetting retry count')
      retryCountRef.current = 0
    }
  }

  // Handle manual retry
  const handleRetry = () => {
    console.log('[SimpleMuxPlayerEnhanced] Manual retry triggered')
    retryCountRef.current = 0
    setError(null)
    setPlayerKey(prev => prev + 1)
    
    // Refetch tokens if needed
    if (requiresToken) {
      setTokenLoading(true)
      setTokens(null)
    }
  }

  // Error UI
  if (error === 'playback-decode') {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white space-y-4 max-w-md">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="font-semibold text-lg">Video Playback Issue</p>
            <p className="text-sm text-white/80">
              Your browser is having trouble decoding this video. This can happen due to network conditions or browser compatibility.
            </p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-[#176FFF] hover:bg-[#176FFF]/90 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'network-error') {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white space-y-4 max-w-md">
            <div className="text-4xl mb-2">📡</div>
            <p className="font-semibold text-lg">Connection Issue</p>
            <p className="text-sm text-white/80">
              Unable to load video segments. Please check your internet connection.
            </p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-[#176FFF] hover:bg-[#176FFF]/90 text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'token-fetch') {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white space-y-4 max-w-md">
            <p className="font-semibold text-lg">Unable to Load Video</p>
            <p className="text-sm text-white/80">
              Could not fetch video authorization. Please refresh the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#176FFF] hover:bg-[#176FFF]/90 text-white rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'playback-error') {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white space-y-4 max-w-md">
            <p className="font-semibold text-lg">Playback Error</p>
            <p className="text-sm text-white/80">
              An error occurred during video playback.
            </p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-[#176FFF] hover:bg-[#176FFF]/90 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main player with aspect ratio wrapper
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Show loading state while tokens are fetching - DON'T render player yet */}
      {tokenLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-sm">Loading secure video...</p>
          </div>
        </div>
      ) : (
        /* Mux Player - only render when tokens are ready or not required */
        <MuxPlayer
          key={`${playbackId}-${playerKey}`}
          ref={playerRef}
          playbackId={playbackId}
          tokens={requiresToken && tokens ? tokens : undefined}
          streamType="on-demand"
          preload="metadata"
          className="w-full h-full"
          onEnded={onEnded}
          onError={handleError}
          onPlay={handlePlay}
          theme="minimal"
          primaryColor="#FFFFFF"
          secondaryColor="#000000"
          accentColor="#176FFF"
          playsInline
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
      )}
    </div>
  )
}
