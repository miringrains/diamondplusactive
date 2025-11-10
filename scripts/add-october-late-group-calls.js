#!/usr/bin/env node

/**
 * Add October 2025 Group Calls (Late October - Oct 25 and Oct 27)
 * 
 * Videos added:
 * - Dominate Social Media With Scott Calry (Oct 27, 2025)
 * - Special Q&A (Oct 25, 2025)
 * 
 * Run: node scripts/add-october-late-group-calls.js
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Convert time string to seconds
function timeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number)
  if (parts.length === 3) {
    // Format: H:MM:SS or HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // Format: MM:SS
    return parts[0] * 60 + parts[1]
  }
  return 0
}

// ====================================
// NEW VIDEOS TO ADD
// ====================================
const groupCalls = [
  {
    title: "Dominate Social Media With Scott Calry",
    description: null,
    mux_asset_id: "BabtEdfa01jE1wbiXz3ooxcQ00N6RjCw2Rsffb8NBKoL4",
    mux_playback_id: "bC9dqzWe02Vqs7Imo4SKQoIv6QjJtQjdY7kHj9zbHmmc",
    duration: timeToSeconds("2:00:35"), // 2 hours, 0 minutes, 35 seconds = 7235 seconds
    call_date: new Date('2025-10-27'), // October 27, 2025 - newest first
  },
  {
    title: "Special Q&A",
    description: null,
    mux_asset_id: "J8weA01b3J02CXGXltPBuZVPSuuVg01RhREo4J01xdHJpIs",
    mux_playback_id: "WbujhwR6cb1TmNP2VnM7EoQc3hYSsqglxvTD58fp4jE",
    duration: timeToSeconds("1:45:43"), // 1 hour, 45 minutes, 43 seconds = 6343 seconds
    call_date: new Date('2025-10-25'), // October 25, 2025 - second newest
  },
]

// ====================================
// SCRIPT EXECUTION
// ====================================
async function main() {
  console.log('🎬 Adding October 2025 Group Call Videos to Database\n')
  
  for (const call of groupCalls) {
    try {
      // Generate thumbnail URL (using signed token endpoint - MuxThumbnail component will handle token)
      // For now, we'll use the basic URL structure - the MuxThumbnail component will add tokens if needed
      const thumbnail_url = `https://image.mux.com/${call.mux_playback_id}/thumbnail.png?width=1920&height=1080&fit_mode=smartcrop&time=5`
      
      // Check if already exists by playback ID
      const existing = await prisma.group_calls.findFirst({
        where: { mux_playback_id: call.mux_playback_id }
      })
      
      if (existing) {
        console.log(`⚠️  Video already exists: ${call.title}`)
        console.log(`   ID: ${existing.id}`)
        console.log(`   Call Date: ${existing.call_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`)
        console.log(`   Status: ${existing.published ? '✅ Published' : '❌ Unpublished'}\n`)
        continue
      }
      
      // Create new record
      const created = await prisma.group_calls.create({
        data: {
          title: call.title,
          description: call.description,
          mux_asset_id: call.mux_asset_id,
          mux_playback_id: call.mux_playback_id,
          duration: call.duration,
          call_date: call.call_date,
          thumbnail_url,
          published: true,
          video_url: `https://stream.mux.com/${call.mux_playback_id}.m3u8`, // HLS URL
        }
      })
      
      console.log(`✅ Added: ${call.title}`)
      console.log(`   ID: ${created.id}`)
      console.log(`   Playback ID: ${call.mux_playback_id}`)
      console.log(`   Asset ID: ${call.mux_asset_id}`)
      console.log(`   Call Date: ${call.call_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`)
      console.log(`   Duration: ${Math.floor(call.duration / 3600)}:${Math.floor((call.duration % 3600) / 60).toString().padStart(2, '0')}:${(call.duration % 60).toString().padStart(2, '0')}`)
      console.log(`   Published: ✅`)
      console.log(`   Thumbnail: ${thumbnail_url}\n`)
      
    } catch (error) {
      console.error(`❌ Error adding ${call.title}:`, error.message)
      if (error.stack) {
        console.error(error.stack)
      }
    }
  }
  
  // Show all group calls in chronological order (newest first)
  console.log('\n📋 All Group Calls in Database (Most Recent First):')
  const allCalls = await prisma.group_calls.findMany({
    orderBy: { call_date: 'desc' },
    select: {
      id: true,
      title: true,
      call_date: true,
      duration: true,
      published: true,
      mux_playback_id: true,
    }
  })
  
  allCalls.forEach((call, index) => {
    const durationStr = call.duration 
      ? `${Math.floor(call.duration / 3600)}:${Math.floor((call.duration % 3600) / 60).toString().padStart(2, '0')}:${(call.duration % 60).toString().padStart(2, '0')}`
      : 'Unknown'
    
    console.log(`${index + 1}. ${call.title}`)
    console.log(`   Date: ${call.call_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`)
    console.log(`   Duration: ${durationStr}`)
    console.log(`   Status: ${call.published ? '✅ Published' : '❌ Unpublished'}`)
    console.log(`   Playback ID: ${call.mux_playback_id || 'N/A'}`)
    console.log('')
  })
  
  console.log(`✨ Done! Total videos: ${allCalls.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())



