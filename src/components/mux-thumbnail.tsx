'use client'

import { useEffect, useState } from 'react'

interface MuxThumbnailProps {
  playbackId: string
  alt: string
  width?: number
  height?: number
  time?: number
  className?: string
  fallbackSrc?: string
}

export function MuxThumbnail({
  playbackId,
  alt,
  width = 640,
  height = 360,
  time = 5,
  className = '',
  fallbackSrc
}: MuxThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchThumbnailUrl() {
      try {
        // Fetch signed token directly (all our videos require signed URLs)
        const response = await fetch('/api/mux/playback-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            playbackId,
            thumbnailParams: {
              width,
              height,
              time,
              fit_mode: 'smartcrop'
            }
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch thumbnail token')
        }

        const data = await response.json()
        if (data.tokens?.thumbnail) {
          // For signed thumbnails, parameters are in the token, not the URL
          const signedUrl = `https://image.mux.com/${playbackId}/thumbnail.png?token=${data.tokens.thumbnail}`
          setThumbnailUrl(signedUrl)
        } else {
          // Fallback to public URL anyway
          const publicUrl = `https://image.mux.com/${playbackId}/thumbnail.png?width=${width}&height=${height}&time=${time}&fit_mode=smartcrop`
          setThumbnailUrl(publicUrl)
        }
      } catch (err) {
        console.error('[MuxThumbnail] Error:', err)
        setError(true)
        if (fallbackSrc) {
          setThumbnailUrl(fallbackSrc)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchThumbnailUrl()
  }, [playbackId, width, height, time, fallbackSrc])

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`} style={{ aspectRatio: `${width}/${height}` }} />
    )
  }

  if (error && !thumbnailUrl) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
        <span className="text-gray-500 text-sm">No thumbnail</span>
      </div>
    )
  }

  return (
    <img
      src={thumbnailUrl || ''}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        setError(true)
        if (fallbackSrc && thumbnailUrl !== fallbackSrc) {
          setThumbnailUrl(fallbackSrc)
        }
      }}
      loading="lazy"
      style={{ aspectRatio: `${width}/${height}` }}
    />
  )
}
