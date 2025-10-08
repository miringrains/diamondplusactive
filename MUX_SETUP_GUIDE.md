# Mux Video Streaming Setup Guide

This guide will help you set up Mux video streaming for Diamond District.

## Prerequisites

1. A Mux account (sign up at https://mux.com)
2. AWS S3 configured (for existing video storage)

## Step 1: Get Your Mux Credentials

### 1.1 Access Tokens (Required)
1. Go to https://dashboard.mux.com/settings/access-tokens
2. Click "Generate new token"
3. Give it a name like "Diamond District Production"
4. Copy the **Token ID** and **Token Secret**
5. Add to your `.env` file:
```
MUX_TOKEN_ID="your-token-id"
MUX_TOKEN_SECRET="your-token-secret"
```

### 1.2 Environment Key (Required for Analytics)
1. Go to https://dashboard.mux.com/settings/environments
2. Find your environment (usually "Production")
3. Copy the **Environment Key**
4. Add to your `.env` file:
```
NEXT_PUBLIC_MUX_ENV_KEY="your-env-key"
```

### 1.3 Signing Keys (Optional - for advanced security)
1. Go to https://dashboard.mux.com/settings/signing-keys
2. Click "Generate new signing key"
3. Copy the **Signing Key ID** and **Signing Key Secret**
4. Add to your `.env` file:
```
MUX_SIGNING_KEY_ID="your-signing-key-id"
MUX_SIGNING_KEY_SECRET="your-signing-key-secret"
```

## Step 2: Update Environment Variables

Add these to your `.env` file:

```bash
# Mux Configuration
MUX_TOKEN_ID="your-token-id-here"
MUX_TOKEN_SECRET="your-token-secret-here"
NEXT_PUBLIC_MUX_ENV_KEY="your-env-key-here"

# Optional: Custom beacon domain (usually leave empty)
NEXT_PUBLIC_MUX_BEACON_DOMAIN=""

# Optional: For signed URLs (enhanced security)
MUX_SIGNING_KEY_ID=""
MUX_SIGNING_KEY_SECRET=""
```

## Step 3: Apply Database Migration

The Mux fields have already been added to the schema. Make sure your database is up to date:

```bash
npm run db:push
```

## Step 4: Migrate Existing Videos to Mux

If you have existing videos in S3 that you want to migrate to Mux:

```bash
npm run migrate:mux
```

This will:
- Find all lessons without a Mux playback ID
- Create signed URLs for your S3 videos
- Upload them to Mux
- Update the database with Mux asset and playback IDs

## Step 5: Test the Implementation

1. **Upload a new video**: Go to the admin panel and upload a new lesson. It should automatically use Mux.

2. **Check existing videos**: Videos should play using the Mux player with these features:
   - Automatic quality switching
   - Resume playback from where you left off
   - Analytics tracking
   - Better performance

## Step 6: Deploy Changes

```bash
npm run build
pm2 restart diamond-district
```

## Features Enabled by Mux

1. **Adaptive Bitrate Streaming**: Videos automatically adjust quality based on viewer's connection
2. **Global CDN**: Fast video delivery worldwide
3. **Resume Playback**: Viewers can pick up where they left off
4. **Analytics**: Track engagement, view time, and more
5. **Thumbnails**: Automatic thumbnail generation
6. **Multiple Resolutions**: From 480p to 4K

## Troubleshooting

### Videos not playing?
1. Check browser console for errors
2. Verify Mux credentials in `.env`
3. Check PM2 logs: `pm2 logs diamond-district`

### Migration failing?
1. Ensure AWS credentials are correct
2. Check S3 bucket permissions
3. Verify Mux API limits haven't been exceeded

### Player not loading?
1. Check NEXT_PUBLIC_MUX_ENV_KEY is set
2. Ensure you're using the correct environment (development/production)

## Cost Considerations

Mux charges for:
- **Encoding**: One-time cost when video is uploaded
- **Storage**: Monthly cost for storing videos
- **Streaming**: Cost per minute viewed
- **Delivery**: Bandwidth costs

Check current pricing at https://mux.com/pricing

## Next Steps

1. Monitor usage in Mux dashboard
2. Set up webhooks for processing status
3. Configure custom domains if needed
4. Set up usage alerts to manage costs

