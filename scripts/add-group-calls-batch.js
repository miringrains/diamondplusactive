#!/usr/bin/env node

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

const groupCalls = [
  {
    title: "Buying Your Time Back By Eliminating What You Don't Love",
    description: "Learn how to reclaim your time by eliminating tasks and activities that don't serve your business growth or personal fulfillment.",
    mux_asset_id: "ZOJ2qmr9s9J8hWxGvEdRXR7YBRcDL2HlTvWZs3DMIdc",
    mux_playback_id: "LAqKP00m02x9U4gZYp4954yMFT9dWt01GrmUSZTK9bTXW4",
    duration: timeToSeconds("59:45"), // 3585 seconds
    call_date: new Date('2024-01-22'), // Adjust date as needed
  },
  {
    title: "Hiring Others To Make Calls For You",
    description: "Master the art of delegation by learning how to hire and train others to handle your calls, freeing you to focus on high-value activities.",
    mux_asset_id: "Skdra8aWyykv6NtBOASmZSW2T23uzL3zJmXo01Bg9SVQ",
    mux_playback_id: "6R02XSpwzSeLY7gaG01VIyKcjG6cOQ9I8woFYn42zkQlw",
    duration: timeToSeconds("2:07:34"), // 7654 seconds
    call_date: new Date('2024-01-15'), // Adjust date as needed
  },
  {
    title: "Simplify Your Business Through Impossible Goals",
    description: "Discover how setting seemingly impossible goals can actually simplify your business by forcing focus and eliminating non-essential activities.",
    mux_asset_id: "c96YNoQznu00lIzwxqB2fG2nVELq7Rawh100Lj00Izgo68",
    mux_playback_id: "cDVEHtzv1XRf4s9Ls1NMlKe8wT01OaMRwMEWJVELiyNc",
    duration: timeToSeconds("1:51:59"), // 6719 seconds
    call_date: new Date('2024-01-08'), // Adjust date as needed
  }
]

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
      console.log(`   Duration: ${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`)
      console.log(`   Thumbnail: ${thumbnail_url}\n`)
      
    } catch (error) {
      console.error(`❌ Error adding ${call.title}:`, error.message)
    }
  }
  
  // Show all group calls
  console.log('\n📋 All Group Calls in Database:')
  const allCalls = await prisma.group_calls.findMany({
    orderBy: { call_date: 'desc' }
  })
  
  allCalls.forEach((call, index) => {
    console.log(`${index + 1}. ${call.title}`)
    console.log(`   Date: ${call.call_date.toLocaleDateString()}`)
    console.log(`   Status: ${call.published ? '✅ Published' : '❌ Unpublished'}`)
  })
  
  console.log('\n✨ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
