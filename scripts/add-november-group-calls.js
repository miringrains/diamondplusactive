#!/usr/bin/env node

/**
 * Add November 2025 Group Calls and Remove Descriptions
 * 
 * Videos added:
 * - October Business Audit and Q&A With Ricky (Nov 3, 2025) - newest
 * - Marketing Masterclass With Tyler From REDX (Oct 20, 2025)
 * 
 * Descriptions removed from:
 * - Hiring Others To Make Calls For You (Sep 15, 2025)
 * - Buying Your Time Back By Eliminating What You Don't Love (Sep 9, 2025)
 * - Simplify Your Business Through Impossible Goals (Sep 1, 2025)
 * 
 * Run: node scripts/add-november-group-calls.js
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
const newGroupCalls = [
  {
    title: "October Business Audit and Q&A With Ricky",
    description: null,
    mux_asset_id: "xYm502tmh00kx021pHcj6Vvozg2G3Xu8xG5Nw1ZsiRLt2Q",
    mux_playback_id: "tt00t6OJ4h29ksNB543PgiSKmryIiufj5ebk00lu1rIfc",
    duration: timeToSeconds("2:22:19"), // 2 hours, 22 minutes, 19 seconds = 8539 seconds
    call_date: new Date('2025-11-03'), // November 3, 2025 - newest
  },
  {
    title: "Marketing Masterclass With Tyler From REDX",
    description: null,
    mux_asset_id: "9sDqKQEapKKmOc58L9MjBSRCBgvEFJdcRyxKGBkGsSs",
    mux_playback_id: "AZ42iK3xgWweOI00BvYM1BJi0000J2zJCh00YHDqe8pYCu4",
    duration: timeToSeconds("1:28:56"), // 1 hour, 28 minutes, 56 seconds = 5336 seconds
    call_date: new Date('2025-10-20'), // October 20, 2025
  },
]

// ====================================
// VIDEOS TO REMOVE DESCRIPTIONS FROM
// ====================================
const videosToUpdate = [
  "Hiring Others To Make Calls For You",
  "Buying Your Time Back By Eliminating What You Don't Love",
  "Simplify Your Business Through Impossible Goals",
]

// ====================================
// SCRIPT EXECUTION
// ====================================
async function main() {
  console.log('🎬 Adding November 2025 Group Call Videos and Removing Descriptions\n')
  
  // Step 1: Add new videos
  console.log('📹 Adding new videos...\n')
  for (const call of newGroupCalls) {
    try {
      // Generate thumbnail URL
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
  
  // Step 2: Remove descriptions from specified videos
  console.log('\n🗑️  Removing descriptions from specified videos...\n')
  for (const title of videosToUpdate) {
    try {
      const updated = await prisma.group_calls.updateMany({
        where: { title: title },
        data: { description: null }
      })
      
      if (updated.count > 0) {
        console.log(`✅ Removed description from: ${title}`)
        console.log(`   Updated ${updated.count} record(s)\n`)
      } else {
        console.log(`⚠️  Video not found: ${title}\n`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${title}:`, error.message)
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
      description: true,
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
    console.log(`   Description: ${call.description ? '❌ Has description' : '✅ No description'}`)
    console.log(`   Playback ID: ${call.mux_playback_id || 'N/A'}`)
    console.log('')
  })
  
  console.log(`✨ Done! Total videos: ${allCalls.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


