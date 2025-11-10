'use client'

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Play, ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { MuxThumbnail } from "@/components/mux-thumbnail"

interface GroupCall {
  id: string
  title: string
  description?: string | null
  date: string
  muxPlaybackId?: string | null
  thumbnailUrl?: string | null
  duration?: number | null
}

interface GroupCallsClientProps {
  recentCalls: GroupCall[]
}

const VideoCard: React.FC<{ video: GroupCall; index: number }> = ({ video, index }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Format duration from seconds to HH:MM:SS format
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "00:00:00"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.round(seconds % 60)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Link href={`/watch/group-calls/${video.id}`}>
      <Card 
        className="card cursor-pointer overflow-hidden pt-0 pb-6 hover:shadow-lg transition-shadow"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-video bg-[var(--eerie-black)] relative overflow-hidden">
          {video.muxPlaybackId ? (
            <div className="absolute inset-0">
              <MuxThumbnail
                playbackId={video.muxPlaybackId}
                alt={video.title}
                width={640}
                height={360}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[var(--eerie-black)] flex items-center justify-center">
              <div className="text-white/20">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" opacity="0.3"/>
                  <path d="M10 8v8l6-4z"/>
                </svg>
              </div>
            </div>
          )}
          {/* Hover play button overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="rounded-full bg-white/10 p-5">
              <Play className="h-10 w-10 text-[var(--ink-inverse)] fill-none" />
            </div>
          </motion.div>
          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[var(--ink-inverse)] line-clamp-2 min-h-[3.5rem]">{video.title}</CardTitle>
          {video.description && (
            <CardDescription className="text-sm text-[var(--ink-inverse)]/80 line-clamp-2">
              {video.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-[var(--ink-inverse)]/70">
            {video.date}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function GroupCallsClient({ recentCalls }: GroupCallsClientProps) {

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/dashboard" 
                  className="flex items-center text-[#111828] hover:opacity-80 transition-opacity"
                >
                  <Home className="w-4 h-4 mr-1.5" />
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-2 text-[#111828]" />
                <span className="text-[#111828] font-medium">Group Calls</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Group Calls and Replays
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Access our complete library of group coaching sessions. Learn from expert-led discussions, 
              Q&A sessions, and strategic workshops designed to accelerate your growth.
            </p>
            
            {/* Weekly Call Info */}
            <div className="bg-[#176FFF] text-white p-6 rounded-lg max-w-2xl mx-auto mb-8">
              <p className="text-lg font-semibold mb-3">
                The calls are every Monday, 1:00 to 3:00 Eastern.
              </p>
              <a 
                href="https://us02web.zoom.us/j/86016843275?pwd=JYZHQSMTSj2FysBwGOu9ftjuaagNpB.1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#176FFF] px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Click here to join every week
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Replays Section */}
        <section>
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Replays</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {recentCalls.length} videos available
              </p>
            </div>

            {recentCalls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {recentCalls.map((video, index) => (
                  <VideoCard key={video.id} video={video} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground">No replays available yet. Check back after our next session!</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Load More */}
        {recentCalls.length >= 10 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-[#176FFF] text-[#176FFF] hover:bg-[#176FFF]/10">
              Load More Videos
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}