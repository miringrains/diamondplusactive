const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Challenge 9 Videos - Set More Listing Appointments
const challenge9Videos = [
  {
    challenge_id: 'challenge-9',
    title: 'Day 1',
    description: 'Challenge 9 - Day 1',
    mux_playback_id: 'aHb7ru9zy4EeuvYCkfDi6pta2hLQkoWObkDh800R7my8',
    mux_asset_id: 'n3rcZ028ApV6l01PTW7WUuLBJQBAlK5NxsPBEaCqllc6k',
    thumbnail_url: null, // Mux handles thumbnails automatically
    duration: 7315, // 2:01:55
    order_index: 1,
    mux_policy: 'signed', // Private videos
    published: true
  },
  {
    challenge_id: 'challenge-9',
    title: 'Day 2',
    description: 'Challenge 9 - Day 2',
    mux_playback_id: 'mERaeP0100PcqoDYSB3tmnV02qIH2DPByZ4YECgcbQtLrk',
    mux_asset_id: 'MaFKZXhUu7RiNxHP00Wnqzz1tm01jWk3M00EdT9gumD3QU',
    thumbnail_url: null,
    duration: 7565, // 2:06:05
    order_index: 2,
    mux_policy: 'signed',
    published: true
  },
  {
    challenge_id: 'challenge-9',
    title: 'Day 3',
    description: 'Challenge 9 - Day 3',
    mux_playback_id: 'ETpuEDdXJ8vnaK021QrfldBOxPhbmY3SS0201gYkk9G9dE',
    mux_asset_id: '9kXvQOUD18fYcD3x9h00igQUE2yBNOaufwjLcXoL5WzY',
    thumbnail_url: null,
    duration: 8055, // 2:14:15
    order_index: 3,
    mux_policy: 'signed',
    published: true
  },
  {
    challenge_id: 'challenge-9',
    title: 'Day 4',
    description: 'Challenge 9 - Day 4',
    mux_playback_id: 'wtu402sv90217IkkmsDLaz01B2CdZXAoy4IMDNZ9a022Gy00',
    mux_asset_id: 'tv2KVD1m00UdizUT8pSnYV701qabqic5g202c01KCp02wBCQ',
    thumbnail_url: null,
    duration: 7595, // 2:06:35
    order_index: 4,
    mux_policy: 'signed',
    published: true
  },
  {
    challenge_id: 'challenge-9',
    title: 'Bonus Day',
    description: 'Challenge 9 - Bonus Day',
    mux_playback_id: '4opbRBCQR4sujF00cTAU93BQjlWcR02Zr5HofleI3hcmQ',
    mux_asset_id: 'owasTi8acwmc7SOXibMa9nMZjjsboAFW5MHsNiSVIHw',
    thumbnail_url: null,
    duration: 4685, // 1:18:05
    order_index: 5,
    mux_policy: 'signed',
    published: true
  }
]

async function addChallengeVideos() {
  console.log('🎬 Adding challenge videos to database...')
  
  try {
    // Filter out videos without playback IDs
    const videosToAdd = challenge9Videos.filter(v => v.mux_playback_id)
    
    if (videosToAdd.length === 0) {
      console.log('⚠️  No videos with playback IDs to add. Update the script with actual video details.')
      return
    }
    
    for (const video of videosToAdd) {
      const result = await prisma.challenge_videos.create({
        data: video
      })
      console.log(`✅ Added: ${video.title} (${result.id})`)
    }
    
    console.log(`\n✨ Successfully added ${videosToAdd.length} challenge videos!`)
  } catch (error) {
    console.error('❌ Error adding challenge videos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addChallengeVideos()

/* 
Usage:
1. Update the challenge9Videos array with actual video details
2. Run: node scripts/add-challenge-videos.js
*/
