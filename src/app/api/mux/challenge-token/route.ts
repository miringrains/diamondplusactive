import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createPlaybackToken, isSignedPlaybackEnabled } from "@/lib/mux"
import { z } from "zod"
import { prisma } from "@/lib/db"

const requestSchema = z.object({
  playbackId: z.string().min(1),
  challengeVideoId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const params = requestSchema.parse(body)

    // Check if signed playback is enabled
    if (!isSignedPlaybackEnabled()) {
      return NextResponse.json({ 
        error: "Signed playback is not enabled" 
      }, { status: 400 })
    }

    // Verify the challenge video has the correct playback ID and policy
    const challengeVideo = await prisma.challenge_videos.findUnique({
      where: { id: params.challengeVideoId },
      select: { 
        mux_playback_id: true, 
        mux_policy: true,
        challenge_id: true
      }
    })

    if (!challengeVideo || challengeVideo.mux_playback_id !== params.playbackId) {
      return NextResponse.json({ 
        error: "Invalid playback ID for this challenge video" 
      }, { status: 400 })
    }

    if (challengeVideo.mux_policy !== "signed") {
      return NextResponse.json({ 
        error: "This video does not require signed playback" 
      }, { status: 400 })
    }

    // Create signed tokens for all resource types
    const videoToken = createPlaybackToken(params.playbackId, {
      type: "video",
      viewerId: session.user.id
    })

    const storyboardToken = createPlaybackToken(params.playbackId, {
      type: "storyboard",
      viewerId: session.user.id
    })

    const thumbnailToken = createPlaybackToken(params.playbackId, {
      type: "thumbnail",
      viewerId: session.user.id,
      params: {
        time: 5, // Default thumbnail at 5 seconds
        width: 640,
        height: 360
      }
    })

    console.log(`[Challenge Token API] Created tokens for challenge video ${params.challengeVideoId} (${challengeVideo.challenge_id})`)

    return NextResponse.json({
      playback: videoToken,
      storyboard: storyboardToken,
      thumbnail: thumbnailToken
    })
  } catch (error) {
    console.error('[Challenge Token API] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request parameters",
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: "Failed to generate tokens" 
    }, { status: 500 })
  }
}
