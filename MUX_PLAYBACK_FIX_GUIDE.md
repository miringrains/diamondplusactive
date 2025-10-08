# Mux Video Playback Fix Guide

## Summary of Issues Fixed

1. **JWT Token Generation** ✅
   - Fixed `kid` (key ID) placement - now correctly in JWT header instead of payload
   - Fixed audience value - now using `'v'` instead of `'video'` as Mux expects

2. **Token Props** ✅
   - MuxPlayer already correctly uses `tokens={{ playback: token }}` format

## Environment Variables Required

You MUST set these environment variables in your `.env` file:

```bash
# Mux API Credentials
MUX_TOKEN_ID=<your-mux-token-id>
MUX_TOKEN_SECRET=<your-mux-token-secret>

# Mux Signing Key for Signed Playback
MUX_SIGNING_KEY_BASE64=<base64-encoded-private-key>
MUX_SIGNING_KEY_ID=<key-id-from-mux-dashboard>

# Optional: Token TTL (default 3600 seconds = 1 hour)
MUX_SIGNED_TTL_SECONDS=3600
```

### Critical: Getting the Signing Key ID

1. Go to Mux Dashboard → Settings → Signing Keys
2. Find your signing key (or create one if needed)
3. Copy the **Key ID** shown in the dashboard
4. Set it as `MUX_SIGNING_KEY_ID` in your `.env` file

⚠️ **The Key ID must match exactly** - this is what links your JWT to the correct signing key in Mux.

## Resume Functionality

The resume functionality is already implemented:

1. **Server-side progress tracking**:
   - Progress is saved to `/api/progress/sub-lessons/{lessonId}`
   - Position is retrieved on component mount

2. **Client-side**:
   - `MuxPlayerEnhanced` uses `startTime` prop to resume from saved position
   - Progress is saved every 2 seconds (debounced) and on pause/unmount
   - Uses both localStorage and server storage for reliability

## Testing the Fix

1. Ensure all environment variables are set correctly
2. Check server logs for token generation:
   ```
   [Mux] Created playback token for: {
     playbackId: "...",
     kid: "<your-signing-key-id>",
     aud: "v",
     exp: "...",
     tokenLength: ...
   }
   ```

3. If you still get 403 errors:
   - Verify the signing key ID matches exactly in Mux dashboard
   - Check that the private key is correctly base64 encoded
   - Ensure the playback policy is set to "signed" in Mux for the asset

## Code Changes Made

### `/src/lib/mux.ts`
- Fixed JWT header to include `kid` using `keyid` option
- Changed audience from `'video'` to `'v'`
- Removed `kid` from payload (it should only be in header)

No other code changes were needed - the player components and API endpoints were already correctly implemented.
