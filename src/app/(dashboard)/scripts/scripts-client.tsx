'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollText, Play, Download, ExternalLink, Phone, Home, ChevronRight } from 'lucide-react'
import { PageHeader, PageHeaderPresets } from '@/components/layout'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MuxThumbnail } from '@/components/mux-thumbnail'

interface Video {
  id: string
  title: string
  duration: string
  muxPlaybackId?: string | null
  vimeoId?: string | null
  thumbnailUrl?: string | null
}

interface ScriptsClientProps {
  liveProspectingVideos: Video[]
}

export default function ScriptsClient({ liveProspectingVideos }: ScriptsClientProps) {
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
                <span className="text-[#111828] font-medium">Scripts & Live Prospecting</span>
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Scripts & Live Prospecting
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Proven scripts and live prospecting strategies
            </p>
          </motion.div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

        {/* Live Prospecting Videos Grid */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold text-[var(--ink)] mb-6">
            Watch Live Prospecting Calls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveProspectingVideos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/scripts/${video.id}`}
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
                        {video.duration}
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[var(--ink-inverse)] line-clamp-2 min-h-[3.5rem]">
                      {video.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Scripts Download Section */}
        <section className="mb-12">
          <Card className="card max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[var(--brand)]">
                  <ScrollText className="h-6 w-6 text-[var(--ink-inverse)]" />
                </div>
                <CardTitle className="text-xl text-[var(--ink-inverse)]">
                  Download Proven Scripts
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-[var(--ink-inverse)]/80">
                Get access to battle-tested scripts that have helped agents set more appointments 
                and close more deals. These scripts cover every scenario you'll encounter.
              </p>
              <Button className="btn-primary w-full py-6 text-lg" asChild>
                <a 
                  href="https://storage.googleapis.com/msgsndr/uDZc67RtofRX4alCLGaz/media/68c9a44ca3764f59ab01bc43.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Scripts PDF
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* RedX Training Section */}
        <section>
          <Card className="card max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[var(--brand)]">
                  <Phone className="h-6 w-6 text-[var(--ink-inverse)]" />
                </div>
                <CardTitle className="text-xl text-[var(--ink-inverse)]">
                  RedX Training & Resources
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-[var(--eerie-black)] relative overflow-hidden rounded-lg">
                <iframe
                  src="https://player.vimeo.com/video/1105191811"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-[var(--ink-inverse)]">
                  RedX Training Video
                </h3>
                <p className="text-[var(--ink-inverse)]/80 max-w-2xl mx-auto">
                  Learn how to maximize your prospecting with RedX. This comprehensive training 
                  covers everything you need to know to get started and succeed.
                </p>
                <Button className="btn-secondary" variant="outline" size="lg" asChild>
                  <a href="https://redx.com/ricky" target="_blank" rel="noopener noreferrer">
                    Get RedX Discount
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
