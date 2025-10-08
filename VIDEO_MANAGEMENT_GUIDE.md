# Diamond Plus Video Management Guide

## Overview

The Diamond Plus portal uses Mux for video hosting with Supabase authentication. This guide covers best practices for uploading and organizing videos.

## Video Privacy Recommendation

**We recommend uploading all videos as PRIVATE (signed playback)** because:
- ✅ Protects premium content from unauthorized access
- ✅ Prevents direct link sharing
- ✅ Authentication infrastructure is already in place
- ✅ MuxPlayerEnhanced component handles token refresh automatically

## Video Organization

Videos are organized into separate database tables by type:

| Type | Database Table | Use Case |
|------|---------------|----------|
| Group Calls | `group_calls` | Weekly coaching sessions, Q&A calls |
| Podcasts | `podcasts` | Diamond Standard Podcast episodes |
| Welcome Course | `welcome_course_videos` | Onboarding/welcome course content |
| Scripts | `script_videos` | Script training videos |

## Upload Tools

### 1. Quick Upload Wizard
Interactive upload tool with prompts:
```bash
cd /root/diamond-plus/core
node scripts/quick-mux-upload.js
```

### 2. Command Line Upload
For automated/scripted uploads:
```bash
node scripts/mux-upload-helper.js <file> <title> <type> [options]

# Examples:
node scripts/mux-upload-helper.js video.mp4 "January Q&A" GROUP_CALL --description "Monthly Q&A session" --call-date "2024-01-15"
node scripts/mux-upload-helper.js episode5.mp4 "Episode 5: Scaling Your Business" PODCAST --episode-number 5
```

### 3. Asset Management
Manage existing Mux assets:
```bash
# List all assets
node scripts/mux-asset-manager.js list

# List only private assets
node scripts/mux-asset-manager.js list-private

# Convert asset to private
node scripts/mux-asset-manager.js make-private <asset-id>

# Sync database with Mux
node scripts/mux-asset-manager.js sync

# Find orphaned assets
node scripts/mux-asset-manager.js orphaned
```

## Mux Organization Strategy

Each video uploaded includes metadata for organization:

```javascript
{
  type: 'group_call',        // Video category
  portal: 'diamond_plus',    // Source portal
  uploaded_by: 'manual'      // Upload method
}
```

This metadata helps:
- Filter assets in Mux dashboard
- Identify Diamond Plus content
- Track upload sources
- Manage assets programmatically

## Manual Upload Process

If uploading directly through Mux dashboard:

1. **Upload Settings:**
   - Playback Policy: `Signed` (for private)
   - Encoding Tier: `Baseline`
   - MP4 Support: `Standard`

2. **Naming Convention:**
   - `[GC] Title - Date` for Group Calls
   - `[POD] Episode X: Title` for Podcasts
   - `[WC] Module X: Title` for Welcome Course
   - `[SCRIPT] Title` for Script Videos

3. **After Upload:**
   - Get the Playback ID from Mux
   - Add to database using appropriate script
   - Thumbnail will auto-generate at: `https://image.mux.com/{playback-id}/thumbnail.png`

## Video Player Integration

The portal automatically handles:
- **Public videos**: Direct playback without authentication
- **Private videos**: Token generation for authenticated users
- **Token refresh**: Automatic refresh before expiration
- **Error handling**: Fallback for failed token generation

## Best Practices

1. **Always use private/signed playback** for premium content
2. **Include descriptive titles** with prefixes for easy identification
3. **Set appropriate metadata** for organization
4. **Verify uploads** with the asset manager tool
5. **Monitor processing** - videos typically process in 5-15 minutes
6. **Test playback** on the portal after upload

## Troubleshooting

### Video not playing
1. Check if Mux asset is "ready" status
2. Verify playback ID in database matches Mux
3. For private videos, check authentication
4. Check browser console for token errors

### Slow processing
- Large files (>1GB) may take longer
- Check Mux dashboard for processing status
- Use `monitor-upload.js` script to track progress

### Authentication errors
- Ensure user is logged in via Supabase
- Check if video is marked as private but missing signed policy
- Verify MUX_SIGNING_KEY environment variables

## Environment Variables Required

```env
# Mux
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret
MUX_SIGNING_KEY_ID=your_signing_key_id
MUX_SIGNING_KEY=your_private_key_content

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket

# Database
DATABASE_URL=your_postgres_url
```
