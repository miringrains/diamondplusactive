const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groupCalls = await prisma.group_calls.findMany({
    orderBy: {
      created_at: 'desc'
    },
    take: 10
  });
  
  console.log(`Found ${groupCalls.length} group calls:\n`);
  
  groupCalls.forEach(call => {
    console.log(`Title: ${call.title}`);
    console.log(`Playback ID: ${call.mux_playback_id || 'Not ready'}`);
    console.log(`Created: ${call.created_at}`);
    console.log(`Duration: ${call.duration ? `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, '0')}` : 'Unknown'}`);
    console.log('---');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

