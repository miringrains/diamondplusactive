'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Clock, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Import SimpleMuxPlayer and MuxThumbnail for clean video playback
import { SimpleMuxPlayerEnhanced } from '@/components/simple-mux-player-enhanced'
import { MuxThumbnail } from '@/components/mux-thumbnail'

// Video data interface
interface Video {
  id: string
  title: string
  duration: string
  playbackId: string
  thumbnailUrl: string | null
  isCurrentlyPlaying: boolean
  isCompleted?: boolean
  requiresToken?: boolean
}

interface VideoContent {
  title: string
  description: string
  videos: Video[]
  currentVideoIndex: number
}

interface VideoPlayerWithPlaylistProps {
  content: VideoContent
  type: string
  id: string
}

export default function VideoPlayerWithPlaylist({ content, type, id }: VideoPlayerWithPlaylistProps) {
  const router = useRouter()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(content.currentVideoIndex)
  const currentVideo = content.videos[currentVideoIndex]

  const handleVideoSelect = (index: number) => {
    const video = content.videos[index]
    setCurrentVideoIndex(index)
    
    // Update URL when video changes
    if ((type === 'group-calls' || type === 'scripts' || type === 'welcome' || type === 'challenges') && video.id !== id) {
      router.push(`/watch/${type}/${video.id}`)
    }
  }

  const breadcrumbName = type === 'group-calls' ? 'Group Calls' :
                         type === 'scripts' ? 'Scripts & Live Prospecting' :
                         type === 'welcome' ? 'Welcome Videos' :
                         type === 'challenges' ? 'Challenges' :
                         type === 'workshops' ? 'Workshops' :
                         type === 'modules' ? 'Modules' : 'Videos'

  const breadcrumbHref = type === 'group-calls' ? '/group-calls' :
                         type === 'scripts' ? '/scripts' :
                         type === 'welcome' ? '/dashboard' :
                         type === 'challenges' ? '/challenges' :
                         type === 'workshops' ? '/workshops' :
                         type === 'modules' ? '/modules' : '/dashboard'

  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--hero-bg)] to-[var(--page-bg)] py-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-[var(--ink)]/70 mb-6">
            <Link href="/dashboard" className="hover:text-[var(--ink)] transition-colors">
              Dashboard
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <Link href={breadcrumbHref} className="hover:text-[var(--ink)] transition-colors">
              {breadcrumbName}
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-[var(--ink)]">{currentVideo.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player Section */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="bg-black rounded-lg overflow-hidden shadow-xl mb-6">
                <SimpleMuxPlayerEnhanced 
                  playbackId={currentVideo.playbackId}
                  requiresToken={currentVideo.requiresToken || false}
                  videoType={type as any}
                  videoId={currentVideo.id}
                />
              </div>

              {/* Video Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentVideo.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentVideo.duration}
                    </div>
                    {currentVideo.isCompleted && (
                      <span className="text-green-600 font-medium">✓ Completed</span>
                    )}
                  </div>
                  
                  {content.description && (
                    <div className="text-gray-700 leading-relaxed">
                      <VideoDescription description={content.description} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {content.title} ({content.videos.length} videos)
                </h2>
                
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {content.videos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <RelatedVideoItem
                          video={video}
                          isActive={index === currentVideoIndex}
                          onClick={() => handleVideoSelect(index)}
                          index={index}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Related video item component
function RelatedVideoItem({ 
  video, 
  isActive, 
  onClick, 
  index 
}: { 
  video: Video
  isActive: boolean
  onClick: () => void
  index: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full group relative flex gap-3 p-3 rounded-lg transition-all",
        isActive ? "bg-[var(--brand)]/10" : "hover:bg-gray-100"
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0">
        {video.playbackId ? (
          <MuxThumbnail
            playbackId={video.playbackId}
            alt={video.title}
            className="w-full h-full object-cover"
            time={5}
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
        {!isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-white" fill="white" />
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">#{index + 1}</span>
          {video.isCompleted && (
            <span className="text-xs text-green-600">✓</span>
          )}
        </div>
        <h3 className={cn(
          "text-sm font-medium line-clamp-2",
          isActive ? "text-[var(--brand)]" : "text-gray-900"
        )}>
          {video.title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{video.duration}</p>
      </div>
    </button>
  )
}

// Component to render description with clickable links
function VideoDescription({ description }: { description: string }) {
  const linkMap: Record<string, string> = {
    '90 Day Action Plan': 'https://drive.google.com/file/d/1zmqEv8N02NBQIr4W8lAJBvrpeklBjtmv/view?usp=sharing',
    '$100k Month Framework': 'https://docs.google.com/document/d/1Eiemi-dEkiO6cXhAHzNadZUibQt7eNM-2cKI56u-0Hw/edit?tab=t.0#heading=h.wwsy9hhw1i4m',
    'ISA SOP': 'https://drive.google.com/drive/folders/1tLWg0a8260JAYSV9Z4sOjxDoNWwmhGkA',
    'Scripts': 'https://diamondplusportal.com/scripts'
  }

  const lines = description.split('\n')
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Check if line contains a link
        const linkMatch = Object.keys(linkMap).find(key => line.includes(key))
        
        if (linkMatch && line.includes('•')) {
          return (
            <div key={index} className="flex items-start gap-2">
              <span>•</span>
              <a 
                href={linkMap[linkMatch]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--brand)] hover:underline"
              >
                {linkMatch}
              </a>
            </div>
          )
        }
        
        return line.trim() ? <p key={index}>{line}</p> : null
      })}
    </div>
  )
}