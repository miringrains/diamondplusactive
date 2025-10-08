#!/usr/bin/env node

import 'dotenv/config'
import { uploadVideo, VIDEO_TYPES } from './mux-upload-helper.js'
import readline from 'readline/promises'
import path from 'path'
import fs from 'fs/promises'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function promptForVideoDetails() {
  console.log('\n🎬 Diamond Plus Video Upload Wizard\n')
  
  // Get file path
  const filePath = await rl.question('📁 Video file path: ')
  
  // Verify file exists
  try {
    await fs.access(filePath)
  } catch {
    console.error('❌ File not found:', filePath)
    process.exit(1)
  }
  
  // Get video type
  console.log('\n📂 Video Types:')
  console.log('  1. Group Call')
  console.log('  2. Podcast')
  console.log('  3. Welcome Course')
  console.log('  4. Script Video')
  
  const typeChoice = await rl.question('\nSelect type (1-4): ')
  const videoTypes = ['GROUP_CALL', 'PODCAST', 'WELCOME_COURSE', 'SCRIPT']
  const videoType = videoTypes[parseInt(typeChoice) - 1]
  
  if (!videoType) {
    console.error('❌ Invalid choice')
    process.exit(1)
  }
  
  // Get title
  const title = await rl.question('\n📝 Video title: ')
  
  // Get description
  const description = await rl.question('📄 Description (optional): ')
  
  // Privacy setting
  const privacyChoice = await rl.question('\n🔒 Privacy (1=Private/Signed, 2=Public) [default: 1]: ')
  const isPrivate = privacyChoice !== '2'
  
  // Type-specific data
  const additionalData = {}
  
  if (videoType === 'GROUP_CALL') {
    const callDate = await rl.question('📅 Call date (YYYY-MM-DD) [default: today]: ')
    additionalData.call_date = callDate ? new Date(callDate) : new Date()
  } else if (videoType === 'PODCAST') {
    const episodeNum = await rl.question('🎙️ Episode number: ')
    additionalData.episodeNumber = parseInt(episodeNum) || 1
  } else if (videoType === 'WELCOME_COURSE' || videoType === 'SCRIPT') {
    const order = await rl.question('🔢 Order/Position (default: 0): ')
    additionalData.order = parseInt(order) || 0
  }
  
  rl.close()
  
  return {
    filePath,
    title,
    description,
    videoType,
    isPrivate,
    additionalData
  }
}

async function main() {
  try {
    const videoDetails = await promptForVideoDetails()
    
    console.log('\n📋 Summary:')
    console.log('━'.repeat(50))
    console.log(`File: ${videoDetails.filePath}`)
    console.log(`Type: ${videoDetails.videoType}`)
    console.log(`Title: ${videoDetails.title}`)
    console.log(`Privacy: ${videoDetails.isPrivate ? 'Private (Signed)' : 'Public'}`)
    console.log('━'.repeat(50))
    
    const confirm = await readline.createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('\n✅ Proceed with upload? (y/N): ')
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Upload cancelled')
      process.exit(0)
    }
    
    await uploadVideo(videoDetails)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
