const { PrismaClient } = require('@prisma/client');
const Mux = require('@mux/mux-node');

const prisma = new PrismaClient();
const mux = new Mux({
  tokenId: '5fb83a99-444e-4b3c-b213-af708301c600',
  tokenSecret: 'A2E//7qW4Sf5dkhTFuJ57f7yUdoGBtqp+7HOgMzVUNaHwQbt06foRDBM9ygYBdCwlj3QjDPbLMJ',
});

const videoInfo = {
  'JSoU8us2Cad01vVKUCN4tYXPMM024bT8d28trqeDi495w': {
    title: 'Buying Your Time Back By Eliminating What You Don\'t Love',
    description: 'Learn how to reclaim your time by eliminating tasks and activities that don\'t align with your goals and values.',
    call_date: new Date('2025-01-15')
  },
  '00tHqGJAkQP8G02O63fxOHHOfsHSh8457LvcZRQzNtqxA': {
    title: 'Hiring Others To Make Calls For You',
    description: 'Discover strategies for building a team to handle your prospecting calls and scale your business effectively.',
    call_date: new Date('2025-01-10')
  },
  'nYjFc1XXzRqHxk5h7f4RFwxldVU27ENTOSWDhsXKlXw': {
    title: 'Simplify Your Business Through Impossible Goals',
    description: 'Transform your business by setting and achieving impossible goals that force simplification and focus.',
    call_date: new Date('2025-01-05')
  }
};

async function main() {
  try {
    // Get recent assets
    const { data: assets } = await mux.video.assets.list({
      limit: 10,
    });
    
    console.log('Processing Mux assets...\n');
    
    for (const asset of assets) {
      const info = videoInfo[asset.id];
      if (!info) continue;
      
      // Check if already in database
      const existing = await prisma.group_calls.findFirst({
        where: {
          mux_asset_id: asset.id
        }
      });
      
      if (existing) {
        console.log(`✓ ${info.title} - already in database`);
        continue;
      }
      
      if (asset.status === 'ready' && asset.playback_ids?.[0]) {
        const playbackId = asset.playback_ids[0].id;
        const duration = Math.round(asset.duration || 0);
        const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.png?width=640&height=360&time=10`;
        
        console.log(`Adding: ${info.title}`);
        console.log(`  Playback ID: ${playbackId}`);
        console.log(`  Duration: ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`);
        
        const groupCall = await prisma.group_calls.create({
          data: {
            title: info.title,
            description: info.description,
            call_date: info.call_date,
            mux_playback_id: playbackId,
            mux_asset_id: asset.id,
            thumbnail_url: thumbnailUrl,
            duration: duration,
            published: true,
          },
        });
        
        console.log(`✅ Added to database: ${groupCall.id}\n`);
      } else {
        console.log(`⏳ ${info.title} - status: ${asset.status}`);
      }
    }
    
    console.log('\nDone! Checking database...');
    
    const allCalls = await prisma.group_calls.findMany({
      orderBy: {
        call_date: 'desc'
      }
    });
    
    console.log(`\nTotal group calls in database: ${allCalls.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

