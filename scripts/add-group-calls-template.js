#!/usr/bin/env node

/**
 * TEMPLATE FOR ADDING GROUP CALLS
 * 
 * Instructions:
 * 1. Copy this file and rename it (e.g., add-november-group-calls.js)
 * 2. Fill in the video details in the groupCalls array
 * 3. Run: node scripts/your-new-filename.js
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Convert time string to seconds
function timeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number)
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return 0
}

// ====================================
// ADD YOUR VIDEOS HERE
// ====================================
const groupCalls = [
  {
    title: "VIDEO TITLE HERE",
    description: null, // Optional - add description or leave as null
    mux_asset_id: "ASSET_ID_HERE",
    mux_playback_id: "PLAYBACK_ID_HERE",
    duration: timeToSeconds("H:MM:SS"), // e.g., "1:35:39"
    call_date: new Date('YYYY-MM-DD'), // e.g., '2025-11-01'
  },
  // Add more videos by copying the object above
  // {
  //   title: "Another Video Title",
  //   description: null,
  //   mux_asset_id: "ANOTHER_ASSET_ID",
  //   mux_playback_id: "ANOTHER_PLAYBACK_ID",
  //   duration: timeToSeconds("2:10:53"),
  //   call_date: new Date('2025-11-08'),
  // },
]

// ====================================
// DO NOT MODIFY BELOW THIS LINE
// ====================================
async function main() {
  console.log('🎬 Adding Group Call Videos to Database\n')
  
  for (const call of groupCalls) {
    try {
      // Generate thumbnail URL
      const thumbnail_url = `https://image.mux.com/${call.mux_playback_id}/thumbnail.png?width=1920&height=1080&fit_mode=smartcrop&time=5`
      
      // Check if already exists
      const existing = await prisma.group_calls.findFirst({
        where: { mux_playback_id: call.mux_playback_id }
      })
      
      if (existing) {
        console.log(`⚠️  Video already exists: ${call.title}`)
        console.log(`   ID: ${existing.id}\n`)
        continue
      }
      
      // Create new record
      const created = await prisma.group_calls.create({
        data: {
          ...call,
          thumbnail_url,
          published: true,
          video_url: `https://stream.mux.com/${call.mux_playback_id}.m3u8`, // HLS URL
        }
      })
      
      console.log(`✅ Added: ${call.title}`)
      console.log(`   ID: ${created.id}`)
      console.log(`   Playback ID: ${call.mux_playback_id}`)
      console.log(`   Call Date: ${call.call_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`)
      console.log(`   Duration: ${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`)
      console.log(`   Thumbnail: ${thumbnail_url}\n`)
      
    } catch (error) {
      console.error(`❌ Error adding ${call.title}:`, error.message)
    }
  }
  
  // Show all group calls in chronological order
  console.log('\n📋 All Group Calls in Database (Most Recent First):')
  const allCalls = await prisma.group_calls.findMany({
    orderBy: { call_date: 'desc' }
  })
  
  allCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.title}`)
    console.log(`   Date: ${call.call_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`)
    console.log(`   Duration: ${call.duration ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}`)
    console.log(`   Status: ${call.published ? '✅ Published' : '❌ Unpublished'}`)
    console.log(`   Playback ID: ${call.mux_playback_id}`)
    console.log('')
  })
  
  console.log('✨ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



