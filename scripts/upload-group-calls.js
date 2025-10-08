const Mux = require('@mux/mux-node');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Initialize clients
const mux = new Mux({
  tokenId: '5fb83a99-444e-4b3c-b213-af708301c600',
  tokenSecret: 'A2E//7qW4Sf5dkhTFuJ57f7yUdoGBtqp+7HOgMzVUNaHwQbt06foRDBM9ygYBdCwlj3QjDPbLMJ',
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // Let AWS SDK use default credential chain (IAM role, ~/.aws/credentials, etc.)
});

const prisma = new PrismaClient();

const videos = [
  {
    filename: 'Buying Your Time Back By Eliminating What Your Don\'t Love.mp4',
    title: 'Buying Your Time Back By Eliminating What You Don\'t Love',
    description: 'Learn how to reclaim your time by eliminating tasks and activities that don\'t align with your goals and values.',
    call_date: new Date('2025-01-15')
  },
  {
    filename: 'Hiring Others To Make Calls For You (1).mp4',
    title: 'Hiring Others To Make Calls For You',
    description: 'Discover strategies for building a team to handle your prospecting calls and scale your business effectively.',
    call_date: new Date('2025-01-10')
  },
  {
    filename: 'Simplify Your Business Through Impossible Goals.mp4',
    title: 'Simplify Your Business Through Impossible Goals',
    description: 'Transform your business by setting and achieving impossible goals that force simplification and focus.',
    call_date: new Date('2025-01-05')
  }
];

async function uploadVideoToS3(filePath, fileName) {
  try {
    const fileContent = await fs.readFile(filePath);
    const key = `group-calls/${Date.now()}-${fileName}`;
    
    const uploadParams = {
      Bucket: 'diamondplus2',
      Key: key,
      Body: fileContent,
      ContentType: 'video/mp4',
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`Uploaded ${fileName} to S3 at ${key}`);
    
    // Generate pre-signed URL for Mux
    const getObjectParams = {
      Bucket: 'diamondplus2',
      Key: key,
    };
    
    const presignedUrl = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), {
      expiresIn: 3600, // 1 hour
    });
    
    return { key, presignedUrl };
  } catch (error) {
    console.error(`Error uploading ${fileName} to S3:`, error);
    throw error;
  }
}

async function createMuxAsset(presignedUrl, title) {
  try {
    const asset = await mux.video.assets.create({
      input: [{
        url: presignedUrl,
      }],
      playback_policy: ['public'],
      encoding_tier: 'baseline',
      test: false,
    });
    
    console.log(`Created Mux asset for ${title}: ${asset.id}`);
    return asset;
  } catch (error) {
    console.error(`Error creating Mux asset for ${title}:`, error);
    throw error;
  }
}

async function waitForMuxAsset(assetId, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const asset = await mux.video.assets.retrieve(assetId);
    
    if (asset.status === 'ready') {
      return asset;
    } else if (asset.status === 'errored') {
      throw new Error(`Mux asset ${assetId} failed to process`);
    }
    
    console.log(`Waiting for asset ${assetId} (attempt ${i + 1}/${maxAttempts})...`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  }
  
  throw new Error(`Mux asset ${assetId} timed out`);
}

async function main() {
  try {
    console.log('Starting group calls video upload process...\n');
    
    for (const video of videos) {
      console.log(`\nProcessing: ${video.title}`);
      console.log('----------------------------------------');
      
      const filePath = path.join('/root/diamond-plus/admin', video.filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        console.error(`File not found: ${filePath}`);
        continue;
      }
      
      // Upload to S3
      console.log('Uploading to S3...');
      const { key, presignedUrl } = await uploadVideoToS3(filePath, video.filename);
      
      // Create Mux asset
      console.log('Creating Mux asset...');
      const asset = await createMuxAsset(presignedUrl, video.title);
      
      // Wait for Mux to process
      console.log('Waiting for Mux processing...');
      const readyAsset = await waitForMuxAsset(asset.id);
      
      // Get playback ID and thumbnail
      const playbackId = readyAsset.playback_ids?.[0]?.id;
      const duration = readyAsset.duration;
      const thumbnailUrl = playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png?width=640&height=360&time=10` : null;
      
      console.log(`Mux processing complete!`);
      console.log(`Playback ID: ${playbackId}`);
      console.log(`Duration: ${duration} seconds`);
      
      // Save to database
      console.log('Saving to database...');
      const groupCall = await prisma.group_calls.create({
        data: {
          title: video.title,
          description: video.description,
          call_date: video.call_date,
          mux_playback_id: playbackId,
          mux_asset_id: asset.id,
          video_url: `s3://diamondplus2/${key}`,
          thumbnail_url: thumbnailUrl,
          duration: Math.round(duration || 0),
          published: true,
        },
      });
      
      console.log(`Created database entry: ${groupCall.id}`);
      console.log(`✅ Successfully processed: ${video.title}\n`);
    }
    
    console.log('\nAll videos processed successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Also check AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('AWS credentials not found in environment, using default profile...');
}

main();
