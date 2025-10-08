const { PrismaClient } = require('@prisma/client');
const Mux = require('@mux/mux-node');

const prisma = new PrismaClient();
const mux = new Mux({
  tokenId: '5fb83a99-444e-4b3c-b213-af708301c600',
  tokenSecret: 'A2E//7qW4Sf5dkhTFuJ57f7yUdoGBtqp+7HOgMzVUNaHwQbt06foRDBM9ygYBdCwlj3QjDPbLMJ',
});

async function checkMuxAssets() {
  // Get the 3 most recent assets
  const { data: assets } = await mux.video.assets.list({
    limit: 5,
  });
  
  console.log('Recent Mux Assets:');
  console.log('==================\n');
  
  for (const asset of assets) {
    const created = new Date(asset.created_at * 1000);
    const age = Math.floor((Date.now() - created) / 1000 / 60);
    
    console.log(`Asset ID: ${asset.id}`);
    console.log(`Status: ${asset.status}`);
    console.log(`Created: ${age} minutes ago`);
    
    if (asset.playback_ids?.[0]) {
      console.log(`Playback ID: ${asset.playback_ids[0].id}`);
    }
    
    if (asset.duration) {
      const mins = Math.floor(asset.duration / 60);
      const secs = Math.floor(asset.duration % 60);
      console.log(`Duration: ${mins}:${secs.toString().padStart(2, '0')}`);
    }
    
    console.log('---\n');
  }
}

async function checkDatabase() {
  const groupCalls = await prisma.group_calls.findMany({
    orderBy: {
      created_at: 'desc'
    }
  });
  
  console.log('\nDatabase Entries:');
  console.log('=================\n');
  
  if (groupCalls.length === 0) {
    console.log('No group calls in database yet.\n');
  } else {
    groupCalls.forEach(call => {
      console.log(`Title: ${call.title}`);
      console.log(`Playback ID: ${call.mux_playback_id || 'Not set'}`);
      console.log('---\n');
    });
  }
}

async function main() {
  try {
    await checkMuxAssets();
    await checkDatabase();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

