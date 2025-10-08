import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/supabase/auth-server"
import { createPlaybackToken, isSignedPlaybackEnabled } from "@/lib/mux"
import { z } from "zod"
import { prisma } from "@/lib/db"

const requestSchema = z.object({
  playbackId: z.string().min(1),
  videoId: z.string().min(1),
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

    // Verify the video exists and has the correct playback ID
    const video = await prisma.group_calls.findUnique({
      where: { id: params.videoId },
      select: { 
        mux_playback_id: true,
        published: true
      }
    })

    if (!video || video.mux_playback_id !== params.playbackId) {
      return NextResponse.json({ 
        error: "Invalid playback ID for this video" 
      }, { status: 400 })
    }

    if (!video.published) {
      return NextResponse.json({ 
        error: "This video is not published" 
      }, { status: 403 })
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
      viewerId: session.user.id
    })

    const ttl = parseInt(process.env.MUX_SIGNED_TTL_SECONDS || "3600", 10)

    return NextResponse.json({
      tokens: {
        playback: videoToken,
        storyboard: storyboardToken,
        thumbnail: thumbnailToken
      },
      expiresIn: ttl
    })
  } catch (error: any) {
    console.error("[Group Call Token] Error:", error)
    
    if (error?.name === "ZodError") {
      return NextResponse.json({ 
        error: "Invalid request", 
        details: error.issues 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Failed to create token" 
    }, { status: 500 })
  }
}
