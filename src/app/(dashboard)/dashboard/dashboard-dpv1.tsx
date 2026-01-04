// Dashboard v1 - Updated for Vercel deployment Dec 2025
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, FileText, HelpCircle, Mic, Play, Video, Bot, Users, ScrollText, Award, BookOpen, FileSearch, Target } from "lucide-react"
import { getRecentPodcasts, getWelcomeVideos } from "@/lib/loaders/dashboard"
import { PodcastPlayer } from "@/components/podcast-player"
import { MuxThumbnail } from "@/components/mux-thumbnail"
import { PasswordSetupNotice } from "@/components/password-setup-notice"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const podcasts = await getRecentPodcasts()
  const welcomeVideos = await getWelcomeVideos()
  
  // Get current user for password setup notice
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="">
      {/* Hero Section - Full bleed */}
      <div className="relative h-[600px] lg:h-[700px] overflow-hidden">
        {/* Desktop banner */}
        <Image
          src="/diamonddistheroupscale-standard-v2-2x.webp"
          alt="Diamond Plus"
          fill
          className="object-cover object-center hidden md:block"
          priority
          sizes="100vw"
        />
        {/* Mobile banner */}
        <Image
          src="/welcomediamondplusmob.webp"
          alt="Diamond Plus"
          fill
          className="object-cover object-center block md:hidden"
          priority
          sizes="100vw"
        />
      </div>

      <div className="px-6 lg:px-12 py-12 lg:py-16">
        {/* Password Setup Notice */}
        {user && <PasswordSetupNotice user={user} />}
        
        {/* Module Rail */}
        <section className="relative">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--ink)] mb-2">
              Welcome Course Videos
            </h2>
            <p className="text-[var(--ink)] text-base opacity-70">Start your journey with our comprehensive modules</p>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 lg:-mx-12 lg:px-12">
            {welcomeVideos.map((video, i) => (
              <Link 
                href={video.muxPlaybackId ? `/watch/welcome/${video.id}` : '#'} 
                key={video.id}
                className={!video.muxPlaybackId ? 'cursor-not-allowed' : ''}
              >
                <Card className="card min-w-[380px] cursor-pointer overflow-hidden pt-0 pb-6">
                  <div className="aspect-video bg-[var(--eerie-black)] relative overflow-hidden">
                    {video.muxPlaybackId ? (
                      <MuxThumbnail
                        playbackId={video.muxPlaybackId}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        time={5}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Coming Soon</p>
                        </div>
                      </div>
                    )}
                    {video.muxPlaybackId && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-white/10 p-5">
                          <Play className="h-10 w-10 text-[var(--ink-inverse)] fill-none" />
                        </div>
                      </div>
                    )}
                    {i === 0 && (
                      <div className="absolute top-4 right-4 badge">
                        Start Here
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-[var(--ink-inverse)]">{video.title}</CardTitle>
                    {video.description && (
                      <CardDescription className="text-sm text-[var(--ink-inverse)]/80">{video.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--ink-inverse)]/70">Progress</span>
                        <span className="font-medium text-[var(--ink-inverse)]">0%</span>
                      </div>
                      <Progress value={0} className="progress-track h-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* Podcasts Section with Alice Blue Background */}
      <div className="bg-[var(--podcasts-bg)] py-12 lg:py-16">
        <div className="px-6 lg:px-12">
          {/* Podcasts Section */}
          <section className="relative">
            {podcasts.length > 0 ? (
              <PodcastPlayer
                episodeNumber={podcasts[0].episodeNumber}
                title={podcasts[0].title}
                description={podcasts[0].description}
                muxPlaybackId={podcasts[0].muxPlaybackId}
                duration={podcasts[0].duration}
              />
            ) : (
              <PodcastPlayer
                episodeNumber={1}
                title="Episode 01: The Diamond Plus Journey Begins"
                description="In this very first episode of the Diamond Plus Podcast, we set the stage for what this exclusive series is all about—real agents, real breakthroughs, and real stories from inside the Diamond Plus coaching program. Hear how agents are scaling to six-figure months using proven frameworks like the ABS formula and the Million Dollar Formula, regardless of their business model or lead generation strategy."
                muxPlaybackId="placeholder-podcast-id"
                duration={1019} // 16:59 in seconds
              />
            )}
          </section>
        </div>
      </div>

      {/* Resources Section */}
      <div className="px-6 lg:px-12 py-12 lg:py-16">
        {/* Resources Grid */}
        <section className="relative pb-12">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--ink)] mb-2">
              Resources
            </h2>
            <p className="text-[var(--ink)] text-base opacity-70">Everything you need to succeed in your journey</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Ask Ricky AI Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <Bot className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Ask Ricky AI</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Get instant answers</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">AI-powered coaching assistant available 24/7</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/ask-ai">Ask Now</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Calendar Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <CalendarDays className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Calendar</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Upcoming events</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">View all scheduled calls and training sessions</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/calendar">View Calendar</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Group Calls Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <Users className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Group Calls</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Join live sessions</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Weekly coaching calls with the community</p>
                <div className="space-y-3">
                  <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                    <a href="https://us02web.zoom.us/j/89108447247?pwd=138BZOPiDDbaeYRyRKr2FQtzccLvtu.1" target="_blank" rel="noopener noreferrer">
                      Join Live Session
                    </a>
                  </Button>
                  <Button className="w-full bg-white hover:bg-gray-50 text-[#176FFF] border border-[#176FFF]" asChild>
                    <Link href="/group-calls">View Replays</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scripts & Live Prospecting Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <ScrollText className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Scripts & Live Prospecting</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Sales resources</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Proven scripts and live prospecting strategies</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/scripts">Access Scripts</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Challenges Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <Award className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Challenges</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Growth challenges</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Join monthly challenges to accelerate growth</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/challenges">View Challenges</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Workshops Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <BookOpen className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Workshops</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Deep dive training</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Intensive workshops on specific topics</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/workshops">Browse Workshops</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Business Audit Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <FileSearch className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Monthly Business Audit</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Performance review</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Track and analyze your business metrics</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/business-audit">Start Audit</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Action Plan Card */}
            <Card className="bg-background border border-border h-full">
              <CardHeader className="pb-4">
                <div className="p-3 rounded-lg bg-[#E8F0FF] w-fit mb-4">
                  <Target className="h-6 w-6 text-[#176FFF]" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Action Plan</CardTitle>
                <p className="text-sm font-medium text-[#176FFF] mt-1">Your roadmap</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-6">Create and track your personalized action plan</p>
                <Button className="w-full bg-[#176FFF] hover:bg-[#1460E5] text-white" asChild>
                  <Link href="/action-plan">View Plan</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Support Section */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-[#1F1F23] to-[#2A2A30] border-none">
            <CardContent className="p-8 text-center">
              <HelpCircle className="h-10 w-10 text-[#176FFF] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Email any questions, concerns, feedback here
              </h3>
              <p className="text-white/70 mb-6">
                Our support team is here to help you succeed
              </p>
              <Button 
                className="bg-[#176FFF] hover:bg-[#1460E5] text-white" 
                size="lg"
                asChild
              >
                <Link href="/help">Get Support</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
