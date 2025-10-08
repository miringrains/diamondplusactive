#!/usr/bin/env node

import 'dotenv/config'
import Mux from '@mux/mux-node'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

// Initialize Mux
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})

// Initialize S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Video types configuration
const VIDEO_TYPES = {
  GROUP_CALL: {
    table: 'group_calls',
    prefix: '[GC]',
    passthrough: { type: 'group_call', portal: 'diamond_plus' }
  },
  PODCAST: {
    table: 'podcasts',
    prefix: '[POD]',
    passthrough: { type: 'podcast', portal: 'diamond_plus' }
  },
  WELCOME_COURSE: {
    table: 'welcome_course_videos',
    prefix: '[WC]',
    passthrough: { type: 'welcome_course', portal: 'diamond_plus' }
  },
  SCRIPT: {
    table: 'script_videos',
    prefix: '[SCRIPT]',
    passthrough: { type: 'script', portal: 'diamond_plus' }
  }
}

async function uploadToS3(filePath, key) {
  const fileContent = await fs.readFile(filePath)
  const fileStats = await fs.stat(filePath)
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: 'video/mp4',
  })
  
  await s3Client.send(command)
  console.log(`✓ Uploaded to S3: ${key} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)`)
  
  // Generate presigned URL for Mux
  const getCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  })
  
  const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 })
  return presignedUrl
}

async function createMuxAsset(presignedUrl, title, videoType, isPrivate = true) {
  const config = VIDEO_TYPES[videoType]
  
  try {
    const asset = await mux.video.assets.create({
      input: [{
        url: presignedUrl,
      }],
      playback_policy: isPrivate ? ['signed'] : ['public'],
      encoding_tier: 'baseline',
      passthrough: JSON.stringify(config.passthrough),
      name: `${config.prefix} ${title}`,
      test: false,
    })
    
    console.log(`✓ Created Mux asset: ${asset.id}`)
    return asset
  } catch (error) {
    console.error('✗ Error creating Mux asset:', error)
    throw error
  }
}

async function waitForMuxAsset(assetId, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const asset = await mux.video.assets.retrieve(assetId)
    
    if (asset.status === 'ready') {
      return asset
    } else if (asset.status === 'errored') {
      throw new Error(`Mux asset ${assetId} failed to process`)
    }
    
    process.stdout.write(`\r⏳ Processing... (${i + 1}/${maxAttempts})`)
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  throw new Error(`Mux asset ${assetId} timed out`)
}

async function uploadVideo({
  filePath,
  title,
  description,
  videoType = 'GROUP_CALL',
  isPrivate = true,
  additionalData = {}
}) {
  console.log(`\n📹 Processing: ${title}`)
  console.log('━'.repeat(50))
  
  const config = VIDEO_TYPES[videoType]
  if (!config) {
    throw new Error(`Invalid video type: ${videoType}`)
  }
  
  // Upload to S3
  const fileName = path.basename(filePath)
  const s3Key = `diamond-plus/${videoType.toLowerCase()}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`
  const presignedUrl = await uploadToS3(filePath, s3Key)
  
  // Create Mux asset
  const asset = await createMuxAsset(presignedUrl, title, videoType, isPrivate)
  
  // Wait for processing
  console.log('\n⏳ Waiting for Mux processing...')
  const readyAsset = await waitForMuxAsset(asset.id)
  
  // Get playback ID and thumbnail
  const playbackId = readyAsset.playback_ids?.[0]?.id
  const thumbnailUrl = playbackId 
    ? `https://image.mux.com/${playbackId}/thumbnail.png?width=1920&height=1080&fit_mode=smartcrop&time=5`
    : null
  
  console.log('\n✓ Mux processing complete!')
  console.log(`  Playback ID: ${playbackId}`)
  console.log(`  Thumbnail: ${thumbnailUrl}`)
  
  // Save to database
  const videoUrl = `https://assets.diamondplusportal.com/videos/${s3Key}`
  const dbData = {
    title,
    description,
    mux_playback_id: playbackId,
    mux_asset_id: asset.id,
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl,
    duration: readyAsset.duration ? Math.round(readyAsset.duration) : null,
    published: true,
    ...additionalData
  }
  
  let savedRecord
  switch (videoType) {
    case 'GROUP_CALL':
      savedRecord = await prisma.group_calls.create({
        data: {
          ...dbData,
          call_date: additionalData.call_date || new Date()
        }
      })
      break
    case 'PODCAST':
      savedRecord = await prisma.podcasts.create({
        data: {
          ...dbData,
          episodeNumber: additionalData.episodeNumber || 1,
          muxPlaybackId: playbackId,
          s3ObjectKey: s3Key
        }
      })
      break
    case 'WELCOME_COURSE':
      savedRecord = await prisma.welcome_course_videos.create({
        data: {
          ...dbData,
          order: additionalData.order || 0
        }
      })
      break
    case 'SCRIPT':
      savedRecord = await prisma.script_videos.create({
        data: {
          ...dbData,
          order: additionalData.order || 0
        }
      })
      break
  }
  
  console.log(`\n✅ Successfully saved to database!`)
  console.log(`  Table: ${config.table}`)
  console.log(`  ID: ${savedRecord.id}`)
  
  return savedRecord
}

// CLI Usage
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.log(`
Usage: node mux-upload-helper.js <file_path> <title> <video_type> [options]

Video Types:
  - GROUP_CALL
  - PODCAST  
  - WELCOME_COURSE
  - SCRIPT

Options:
  --description "Video description"
  --private (default) / --public
  --call-date "2024-01-15" (for group calls)
  --episode-number 5 (for podcasts)
  --order 1 (for courses/scripts)

Example:
  node mux-upload-helper.js video.mp4 "Weekly Q&A Session" GROUP_CALL --description "January Q&A" --call-date "2024-01-15"
`)
    process.exit(1)
  }
  
  const [filePath, title, videoType] = args
  const options = {
    filePath,
    title,
    videoType: videoType.toUpperCase(),
    isPrivate: !args.includes('--public'),
    additionalData: {}
  }
  
  // Parse additional options
  for (let i = 3; i < args.length; i++) {
    switch (args[i]) {
      case '--description':
        options.description = args[++i]
        break
      case '--call-date':
        options.additionalData.call_date = new Date(args[++i])
        break
      case '--episode-number':
        options.additionalData.episodeNumber = parseInt(args[++i])
        break
      case '--order':
        options.additionalData.order = parseInt(args[++i])
        break
    }
  }
  
  try {
    await uploadVideo(options)
    console.log('\n🎉 Upload complete!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Upload failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().finally(() => prisma.$disconnect())
}

// Export for programmatic use
export { uploadVideo, VIDEO_TYPES }
