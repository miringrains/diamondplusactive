import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/supabase/auth-server"
import { createPlaybackToken, isSignedPlaybackEnabled } from "@/lib/mux"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if signed playback is enabled
    if (!isSignedPlaybackEnabled()) {
      return NextResponse.json({ 
        error: "Signed playback is not configured" 
      }, { status: 400 })
    }

    // Get playback ID and optional params from request
    const { playbackId, thumbnailParams } = await req.json()
    if (!playbackId) {
      return NextResponse.json({ 
        error: "Playback ID is required" 
      }, { status: 400 })
    }

    // Generate tokens for video, thumbnail, and storyboard
    const tokens = {
      playback: createPlaybackToken(playbackId, { 
        type: "video", 
        viewerId: session.user.id 
      }),
      thumbnail: createPlaybackToken(playbackId, { 
        type: "thumbnail", 
        viewerId: session.user.id,
        params: thumbnailParams || { width: 640, height: 360, time: 5 }
      }),
      storyboard: createPlaybackToken(playbackId, { 
        type: "storyboard", 
        viewerId: session.user.id 
      })
    }

    // Return tokens
    return NextResponse.json({ 
      tokens,
      expiresIn: parseInt(process.env.MUX_SIGNED_TTL_SECONDS || "3600", 10)
    })

  } catch (error: any) {
    console.error("[Mux Playback Token] Error:", error)
    return NextResponse.json({ 
      error: "Failed to create playback token" 
    }, { status: 500 })
  }
}
