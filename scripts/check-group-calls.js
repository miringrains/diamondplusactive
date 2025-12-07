#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking group_calls in database...\n')
  
  const groupCalls = await prisma.group_calls.findMany({
    where: {
      published: true,
      mux_playback_id: {
        not: null
      }
    },
    orderBy: {
      call_date: 'desc'
    },
    take: 10
  })

  console.log(`Found ${groupCalls.length} group calls:\n`)
  
  groupCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.title}`)
    console.log(`   Date: ${call.call_date}`)
    console.log(`   Playback ID: ${call.mux_playback_id?.substring(0, 20)}...`)
    console.log(`   Published: ${call.published}`)
    console.log(`   Duration: ${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
