#!/usr/bin/env node

/**
 * Mux Asset Verification Script
 * 
 * Checks the status of all Mux assets in the database
 * Note: Intermittent PIPELINE_ERROR_DECODE errors are typically browser/network related,
 * not asset corruption. This script helps identify truly broken assets.
 */

require('dotenv').config({ path: '.env' })
const Mux = require('@mux/mux-node')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Initialize Mux client
const { video: muxVideo } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})

async function checkMuxAsset(assetId, title, type) {
  try {
    const asset = await muxVideo.assets.retrieve(assetId)
    
    const status = {
      id: assetId,
      title,
      type,
      status: asset.status,
      ready: asset.status === 'ready',
      duration: asset.duration,
      playbackIds: asset.playback_ids?.length || 0,
      errors: asset.errors?.messages || [],
    }

    if (asset.status === 'errored') {
      console.error(`❌ ERROR: ${type} - ${title}`)
      console.error(`   Asset ID: ${assetId}`)
      console.error(`   Errors: ${JSON.stringify(asset.errors, null, 2)}`)
      return { ...status, hasError: true }
    }

    if (asset.status !== 'ready') {
      console.warn(`⏳ PROCESSING: ${type} - ${title}`)
      console.warn(`   Asset ID: ${assetId}`)
      console.warn(`   Status: ${asset.status}`)
      return { ...status, hasError: false }
    }

    console.log(`✅ READY: ${type} - ${title}`)
    return { ...status, hasError: false }

  } catch (error) {
    console.error(`❌ FAILED TO CHECK: ${type} - ${title}`)
    console.error(`   Asset ID: ${assetId}`)
    console.error(`   Error: ${error.message}`)
    return {
      id: assetId,
      title,
      type,
      status: 'check_failed',
      ready: false,
      hasError: true,
      error: error.message
    }
  }
}

async function main() {
  console.log('🔍 Checking Mux Assets...\n')

  const results = {
    total: 0,
    ready: 0,
    errored: 0,
    processing: 0,
    checkFailed: 0,
  }

  // Check Group Calls
  console.log('\n📞 GROUP CALLS')
  console.log('─'.repeat(50))
  const groupCalls = await prisma.group_calls.findMany({
    where: {
      mux_asset_id: { not: null }
    },
    select: {
      id: true,
      title: true,
      mux_asset_id: true,
    }
  })

  for (const call of groupCalls) {
    results.total++
    const result = await checkMuxAsset(call.mux_asset_id, call.title, 'Group Call')
    if (result.ready) results.ready++
    if (result.hasError) results.errored++
    if (result.status === 'preparing') results.processing++
    if (result.status === 'check_failed') results.checkFailed++
  }

  // Check Script Videos
  console.log('\n📝 SCRIPT VIDEOS')
  console.log('─'.repeat(50))
  const scriptVideos = await prisma.script_videos.findMany({
    where: {
      mux_asset_id: { not: null }
    },
    select: {
      id: true,
      title: true,
      mux_asset_id: true,
    }
  })

  for (const video of scriptVideos) {
    results.total++
    const result = await checkMuxAsset(video.mux_asset_id, video.title, 'Script Video')
    if (result.ready) results.ready++
    if (result.hasError) results.errored++
    if (result.status === 'preparing') results.processing++
    if (result.status === 'check_failed') results.checkFailed++
  }

  // Check Challenge Videos
  console.log('\n🏆 CHALLENGE VIDEOS')
  console.log('─'.repeat(50))
  const challengeVideos = await prisma.challenge_videos.findMany({
    where: {
      mux_asset_id: { not: null }
    },
    select: {
      id: true,
      title: true,
      mux_asset_id: true,
    }
  })

  for (const video of challengeVideos) {
    results.total++
    const result = await checkMuxAsset(video.mux_asset_id, video.title, 'Challenge Video')
    if (result.ready) results.ready++
    if (result.hasError) results.errored++
    if (result.status === 'preparing') results.processing++
    if (result.status === 'check_failed') results.checkFailed++
  }

  // Summary
  console.log('\n📊 SUMMARY')
  console.log('═'.repeat(50))
  console.log(`Total Assets: ${results.total}`)
  console.log(`✅ Ready: ${results.ready}`)
  console.log(`⏳ Processing: ${results.processing}`)
  console.log(`❌ Errored: ${results.errored}`)
  console.log(`⚠️  Check Failed: ${results.checkFailed}`)

  if (results.errored > 0) {
    console.log('\n⚠️  ACTION REQUIRED:')
    console.log('   Some assets have errors. Review the errors above.')
    console.log('   You may need to re-upload or re-encode these videos.')
  }

  if (results.processing > 0) {
    console.log('\n⏳ PROCESSING:')
    console.log('   Some assets are still processing. Check back later.')
  }

  if (results.ready === results.total) {
    console.log('\n✨ All assets are ready!')
  }

  console.log('\n💡 NOTE:')
  console.log('   If you\'re seeing intermittent PIPELINE_ERROR_DECODE errors')
  console.log('   but all assets show as ready, the issue is likely:')
  console.log('   - Browser codec compatibility (Safari vs Chrome)')
  console.log('   - Network segment loading failures')
  console.log('   - User device resource constraints')
  console.log('   The new error handling with retry logic should help!')
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })



