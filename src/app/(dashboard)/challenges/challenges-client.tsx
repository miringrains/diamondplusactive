'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Play, Calendar, ChevronRight, Home } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MuxThumbnail } from '@/components/mux-thumbnail'

interface ChallengeVideo {
  id: string
  title: string
  description?: string | null
  muxPlaybackId?: string | null
  thumbnailUrl?: string | null
  duration?: number | null
  requiresToken: boolean
}

interface ChallengesClientProps {
  challenge9Videos: ChallengeVideo[]
  challenge8Videos: ChallengeVideo[]
  challenge6Videos: ChallengeVideo[]
}

export default function ChallengesClient({ challenge9Videos, challenge8Videos, challenge6Videos }: ChallengesClientProps) {
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>('challenge-9')

  // Format duration from seconds to HH:MM:SS format
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "00:00:00"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.round(seconds % 60)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

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
                <span className="text-[#111828] font-medium">Challenges</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Challenge Replay
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our intensive challenges designed to accelerate your growth
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Challenge Videos Section */}
        <section>
          <div className="space-y-6">
            {/* Challenge 9 Section */}
            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[var(--brand)]">
                      <Award className="h-6 w-6 text-[var(--ink-inverse)]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[var(--ink-inverse)]">
                        Challenge 9: Set More Listing Appointments
                      </CardTitle>
                      <CardDescription className="text-[var(--ink-inverse)]/70 mt-1">
                        Complete challenge replays
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedChallenge(expandedChallenge === 'challenge-9' ? null : 'challenge-9')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {expandedChallenge === 'challenge-9' ? 'Hide' : 'View'} Replays
                  </Button>
                </div>
              </CardHeader>
              
              {expandedChallenge === 'challenge-9' && (
                <CardContent>
                  {challenge9Videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {challenge9Videos.map((video) => (
                        <Link
                          key={video.id}
                          href={`/watch/challenges/${video.id}`}
                          className="block"
                        >
                          <Card className="card cursor-pointer overflow-hidden pt-0 pb-6 hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-[var(--eerie-black)] relative overflow-hidden group">
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
                                <div className="w-full h-full bg-[var(--eerie-black)]" />
                              )}
                              
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="rounded-full bg-white/10 p-5">
                                  <Play className="h-8 w-8 text-[var(--ink-inverse)] fill-none" />
                                </div>
                              </div>
                              
                              {video.duration && (
                                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(video.duration)}
                                </div>
                              )}
                              
                              {video.requiresToken && (
                                <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                  Private
                                </div>
                              )}
                            </div>
                            
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg text-[var(--ink-inverse)] line-clamp-2 min-h-[3.5rem]">
                                {video.title}
                              </CardTitle>
                              {video.description && (
                                <CardDescription className="text-sm text-[var(--ink-inverse)]/80 line-clamp-2">
                                  {video.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-muted-foreground">Challenge 9 videos will be available soon.</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Challenge 8 Section */}
            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[var(--brand)]">
                      <Award className="h-6 w-6 text-[var(--ink-inverse)]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[var(--ink-inverse)]">
                        Challenge 8
                      </CardTitle>
                      <CardDescription className="text-[var(--ink-inverse)]/70 mt-1">
                        Complete challenge replays
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedChallenge(expandedChallenge === 'challenge-8' ? null : 'challenge-8')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {expandedChallenge === 'challenge-8' ? 'Hide' : 'View'} Replays
                  </Button>
                </div>
              </CardHeader>
              
              {expandedChallenge === 'challenge-8' && (
                <CardContent>
                  {challenge8Videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {challenge8Videos.map((video) => (
                        <Link
                          key={video.id}
                          href={`/watch/challenges/${video.id}`}
                          className="block"
                        >
                          <Card className="card cursor-pointer overflow-hidden pt-0 pb-6 hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-[var(--eerie-black)] relative overflow-hidden group">
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
                                <div className="w-full h-full bg-[var(--eerie-black)]" />
                              )}
                              
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="rounded-full bg-white/10 p-5">
                                  <Play className="h-8 w-8 text-[var(--ink-inverse)] fill-none" />
                                </div>
                              </div>
                              
                              {video.duration && (
                                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(video.duration)}
                                </div>
                              )}
                              
                              {video.requiresToken && (
                                <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                  Private
                                </div>
                              )}
                            </div>
                            
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg text-[var(--ink-inverse)] line-clamp-2 min-h-[3.5rem]">
                                {video.title}
                              </CardTitle>
                              {video.description && (
                                <CardDescription className="text-sm text-[var(--ink-inverse)]/80 line-clamp-2">
                                  {video.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-muted-foreground">Challenge 8 videos will be available soon.</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Challenge 6 Section */}
            <Card className="card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[var(--brand)]">
                      <Award className="h-6 w-6 text-[var(--ink-inverse)]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[var(--ink-inverse)]">
                        Challenge 6
                      </CardTitle>
                      <CardDescription className="text-[var(--ink-inverse)]/70 mt-1">
                        Complete challenge replays
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedChallenge(expandedChallenge === 'challenge-6' ? null : 'challenge-6')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {expandedChallenge === 'challenge-6' ? 'Hide' : 'View'} Replays
                  </Button>
                </div>
              </CardHeader>
              
              {expandedChallenge === 'challenge-6' && (
                <CardContent>
                  {challenge6Videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {challenge6Videos.map((video) => (
                        <Link
                          key={video.id}
                          href={`/watch/challenges/${video.id}`}
                          className="block"
                        >
                          <Card className="card cursor-pointer overflow-hidden pt-0 pb-6 hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-[var(--eerie-black)] relative overflow-hidden group">
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
                                <div className="w-full h-full bg-[var(--eerie-black)]" />
                              )}
                              
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="rounded-full bg-white/10 p-5">
                                  <Play className="h-8 w-8 text-[var(--ink-inverse)] fill-none" />
                                </div>
                              </div>
                              
                              {video.duration && (
                                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(video.duration)}
                                </div>
                              )}
                              
                              {video.requiresToken && (
                                <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                                  Private
                                </div>
                              )}
                            </div>
                            
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg text-[var(--ink-inverse)] line-clamp-2 min-h-[3.5rem]">
                                {video.title}
                              </CardTitle>
                              {video.description && (
                                <CardDescription className="text-sm text-[var(--ink-inverse)]/80 line-clamp-2">
                                  {video.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-muted-foreground">Challenge 6 videos will be available soon.</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
