const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixThumbnails() {
  try {
    // Get all group calls
    const groupCalls = await prisma.group_calls.findMany();
    
    console.log(`Found ${groupCalls.length} group calls to update thumbnails...\n`);
    
    for (const call of groupCalls) {
      if (call.mux_playback_id) {
        // Generate proper Mux thumbnail URL
        const thumbnailUrl = `https://image.mux.com/${call.mux_playback_id}/thumbnail.png?width=640&height=360&time=10`;
        
        await prisma.group_calls.update({
          where: { id: call.id },
          data: { thumbnail_url: thumbnailUrl }
        });
        
        console.log(`✓ Updated thumbnail for: ${call.title}`);
        console.log(`  New URL: ${thumbnailUrl}`);
      }
    }
    
    console.log('\n✅ All thumbnails updated!');
    
  } catch (error) {
    console.error('Error updating thumbnails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixThumbnails();
