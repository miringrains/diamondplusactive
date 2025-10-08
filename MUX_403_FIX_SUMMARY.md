# Mux 403 Forbidden Fix - Summary

## Root Cause of 403 Error

The 403 forbidden error was caused by incorrect JWT token generation for Mux signed playback:

1. **JWT Header Issue**: The `kid` (key ID) was incorrectly placed in the JWT payload instead of the header where Mux expects it
2. **Audience Value**: Used `'video'` instead of the correct value `'v'` that Mux requires

## Code Changes Made

### 1. Fixed JWT Token Generation (`/src/lib/mux.ts`)

```javascript
// BEFORE - Incorrect
const payload = {
  sub: playbackId,
  aud: options.type || "video",  // Wrong: should be 'v'
  exp: options.expiration || now + ttl,
  kid: signingKeyId  // Wrong: should be in header, not payload
}

const token = sign(payload, signingKey, { 
  algorithm: "RS256",
  noTimestamp: true
})

// AFTER - Correct
const audience = options.type === "video" ? "v" : options.type || "v"

const payload = {
  sub: playbackId,
  aud: audience,  // Correct: 'v' for video
  exp: options.expiration || now + ttl
  // Removed kid from payload
}

const token = sign(payload, signingKey, { 
  algorithm: "RS256",
  noTimestamp: true,
  keyid: signingKeyId  // Correct: kid in JWT header
})
```

## Environment Variables Required

```bash
# In your .env file:
MUX_TOKEN_ID=<your-mux-token-id>
MUX_TOKEN_SECRET=<your-mux-token-secret>
MUX_SIGNING_KEY_BASE64=<base64-encoded-private-key>
MUX_SIGNING_KEY_ID=<key-id-from-mux-dashboard>  # ⚠️ CRITICAL: Must match Mux dashboard exactly!
MUX_SIGNED_TTL_SECONDS=3600  # Optional, defaults to 1 hour
```

## Resume Functionality - Already Working ✅

The resume functionality is fully implemented:

1. **Server Progress Tracking**:
   - Progress saved to database via `/api/progress/sub-lessons/[subLessonId]`
   - Stores `positionSeconds` for each user/lesson combination

2. **Client Implementation**:
   - `SubLessonViewWrapper` fetches saved position on mount
   - `MuxPlayerEnhanced` receives `startTimeSec` prop and passes it as `startTime` to MuxPlayer
   - Progress saved every 2 seconds (debounced) and on pause/unmount
   - Uses both localStorage and server storage for reliability

3. **Auto-completion**:
   - Videos marked complete when user watches ≥90% of duration

## Next Steps

1. **Set Environment Variables**:
   - Get the signing key ID from Mux Dashboard → Settings → Signing Keys
   - Ensure `MUX_SIGNING_KEY_ID` matches exactly what's shown in Mux

2. **Verify Token Generation**:
   - Check server logs for: `[Mux] Created playback token for: { ... aud: "v", kid: "<your-key-id>" ... }`
   - Token should have `kid` in header and `aud: "v"` in payload

3. **Test Playback**:
   - Videos with `muxPolicy: "signed"` should now play without 403 errors
   - Resume should work automatically from last watched position

## No Other Code Changes Needed

All other components are correctly implemented:
- ✅ Token fetching in `SubLessonViewWrapper`
- ✅ Token passing to MuxPlayer as `tokens={{ playback: token }}`
- ✅ Token refresh logic before expiry
- ✅ Progress tracking and resume functionality
- ✅ Error handling and retry mechanisms
