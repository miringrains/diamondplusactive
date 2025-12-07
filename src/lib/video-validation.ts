/**
 * Shared validation filters for video queries
 * Ensures only ready, published videos with valid playback IDs are served
 */

/**
 * Standard filter for ready videos
 * Use this in all video queries to ensure videos are ready for playback
 */
export const readyVideoFilter = {
  mux_playback_id: {
    not: null,
  },
  published: true,
} as const

/**
 * Filter for group calls - includes date sorting requirement
 */
export const readyGroupCallsFilter = {
  ...readyVideoFilter,
} as const

/**
 * Filter for script videos - includes order requirement
 */
export const readyScriptVideosFilter = {
  ...readyVideoFilter,
} as const

/**
 * Filter for challenge videos - requires challenge_id parameter
 */
export function getReadyChallengeVideosFilter(challengeId: string) {
  return {
    ...readyVideoFilter,
    challenge_id: challengeId,
  }
}

/**
 * Validate that a video object has the minimum required fields for playback
 */
export function isVideoReady(video: {
  mux_playback_id: string | null
  published?: boolean
}): boolean {
  return (
    video.mux_playback_id !== null &&
    video.mux_playback_id !== '' &&
    (video.published === undefined || video.published === true)
  )
}







