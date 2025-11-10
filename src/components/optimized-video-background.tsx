'use client'

import { useState, useEffect } from 'react'

interface OptimizedVideoBackgroundProps {
  src: string
  poster?: string
  className?: string
}

export default function OptimizedVideoBackground({ 
  src, 
  poster,
  className = "absolute inset-0 w-full h-full object-cover"
}: OptimizedVideoBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    // Preload video after component mounts
    const video = document.createElement('video')
    video.src = src
    video.load()
    
    video.addEventListener('canplaythrough', () => {
      setIsLoaded(true)
      // Small delay to ensure smooth transition
      setTimeout(() => setShowVideo(true), 100)
    })

    return () => {
      video.remove()
    }
  }, [src])

  return (
    <>
      {/* Gradient placeholder while loading */}
      <div className={`${className} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`} />
      
      {/* Optional poster image */}
      {poster && !showVideo && (
        <img 
          src={poster} 
          alt="" 
          className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      
      {/* Video with fade-in effect */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`${className} transition-opacity duration-1000 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
        style={{ display: isLoaded ? 'block' : 'none' }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  )
}