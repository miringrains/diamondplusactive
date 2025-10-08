'use client'

import React, { useState, useRef, useEffect } from 'react'
import Hls from 'hls.js'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface HLSAudioPlayerProps {
  episodeNumber: number
  title: string
  description: string
  muxPlaybackId: string
  duration: number
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  podcastLogo?: string
  podcastTitle?: string
  podcastHost?: string
}

export function HLSAudioPlayer({
  episodeNumber,
  title,
  description,
  muxPlaybackId,
  duration,
  onTimeUpdate,
  onEnded,
  podcastLogo = "/diamondstandardpod.webp",
  podcastTitle = "Diamond Stories Podcast",
  podcastHost = "Hosted by Ricky Carruth"
}: HLSAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [bufferedTime, setBufferedTime] = useState(0)
  const [volume, setVolume] = useState(75)
  const [previousVolume, setPreviousVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mux HLS streaming URL
  const streamUrl = `https://stream.mux.com/${muxPlaybackId}.m3u8`

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Initialize HLS
    if (Hls.isSupported()) {
      const hls = new Hls({
        maxLoadingDelay: 4,
        maxBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000, // 60 MB
      })
      
      hlsRef.current = hls
      
      hls.loadSource(streamUrl)
      hls.attachMedia(audio)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        setError(null)
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - please check your connection')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - recovering...')
              hls.recoverMediaError()
              break
            default:
              setError('An error occurred loading the audio')
              break
          }
          setIsLoading(false)
        }
      })
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      audio.src = streamUrl
      setIsLoading(false)
    } else {
      setError('HLS is not supported in this browser')
      setIsLoading(false)
    }

    // Audio event listeners
    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      onTimeUpdate?.(audio.currentTime)
    }

    const updateBuffer = () => {
      if (audio.buffered.length > 0) {
        setBufferedTime(audio.buffered.end(audio.buffered.length - 1))
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }
    const handleCanPlay = () => setIsLoading(false)
    const handleWaiting = () => setIsLoading(true)
    const handlePlaying = () => setIsLoading(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('progress', updateBuffer)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('progress', updateBuffer)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
    }
  }, [streamUrl, onTimeUpdate, onEnded])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(err => {
          setError('Failed to play audio')
          console.error('Play failed:', err)
        })
      }
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, newTime))
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (newValue: number[]) => {
    const volumeValue = newValue[0]
    setVolume(volumeValue)
    setIsMuted(volumeValue === 0)
    if (audioRef.current) {
      audioRef.current.volume = volumeValue / 100
    }
    if (volumeValue > 0) {
      setPreviousVolume(volumeValue)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = previousVolume / 100
        setVolume(previousVolume)
        setIsMuted(false)
      } else {
        setPreviousVolume(volume)
        audioRef.current.volume = 0
        setVolume(0)
        setIsMuted(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / duration) * 100

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Column - Player */}
          <div className="p-8 border-r border-border">
            <audio ref={audioRef} preload="metadata" />
            
            {/* Podcast Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image 
                  src={podcastLogo} 
                  alt={podcastTitle}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {podcastTitle}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {podcastHost}
                </p>
              </div>
            </div>

            {/* Episode Title */}
            <h1 className="text-2xl font-bold text-foreground mb-8">
              {title}
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Time Display */}
            <div className="flex justify-between text-sm text-muted-foreground mb-3">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Progress Bar */}
            <div 
              className="w-full h-2 bg-[#E6E7EB] rounded-full cursor-pointer relative mb-6"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-[#165DFC] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Player Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipBackward}
                className="h-10 w-10"
                disabled={isLoading || !!error}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={togglePlay}
                size="icon"
                className="h-14 w-14 rounded-full bg-[#165DFC] hover:bg-[#165DFC]/90"
                disabled={isLoading || !!error}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                className="h-10 w-10"
                disabled={isLoading || !!error}
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8"
                disabled={isLoading || !!error}
              >
                <Volume2 className={cn("h-4 w-4", isMuted && "opacity-50")} />
              </Button>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
                disabled={isLoading || !!error}
              />
            </div>
          </div>

          {/* Right Column - Description */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Episode Description
            </h3>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              {description}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground pb-6 border-b border-border">
              <div>
                <span>Duration:</span>
                <span className="ml-2 font-medium text-foreground">
                  {formatTime(duration)}
                </span>
              </div>
              <div>
                <span>Episode:</span>
                <span className="ml-2 font-medium text-foreground">
                  #{episodeNumber.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="default" 
                className="w-full bg-[#165DFC] hover:bg-[#165DFC]/90 text-white"
                onClick={() => window.location.href = '/podcasts'}
              >
                More Diamond Stories Podcasts
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}