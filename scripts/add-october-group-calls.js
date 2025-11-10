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
    title: "The Trifecta Listing Method",
    description: null, // Can be updated later if needed
    mux_asset_id: "AN4QHujKJz4ss6pgpfem8rn01pRE1OpmU7pgKsj2PIcI",
    mux_playback_id: "Lbht6b00rKgJyb01hqEnZM1K02cZRKeqe0102tDMAbkP8rZM",
    duration: timeToSeconds("1:35:39"), // 5739 seconds
    call_date: new Date('2025-10-13'),
  },
  {
    title: "How To Pay Zero Taxes With Charles Moore 10/6/25",
    description: null, // Can be updated later if needed
    mux_asset_id: "GcJ0001TuscU44QyZu5gj1GlKOKezcsogaGgsGtnK4c4w",
    mux_playback_id: "biegpmcwuwAnaJs302FG1Tz2IpiilsDJXL9tlM01aTfLI",
    duration: timeToSeconds("2:10:53"), // 7853 seconds
    call_date: new Date('2025-10-06'),
  },
  {
    title: "Special Q&A",
    description: null, // Can be updated later if needed
    mux_asset_id: "z9oKLcRT8my5A8SmXTB77OGeHDA1Bbdwu1YlCK3mj00I",
    mux_playback_id: "Z1aSpAAeMUipuZANcl2b2k5olNGWYSTmtCJ6bzKHq1o",
    duration: timeToSeconds("1:11:07"), // 4267 seconds
    call_date: new Date('2025-10-02'),
  }
]

async function main() {
  console.log('🎬 Adding October 2025 Group Call Videos to Database\n')
  
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



