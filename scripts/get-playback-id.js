#!/usr/bin/env node

const Mux = require('@mux/mux-node')
require('dotenv').config({ path: '/root/diamond-plus/core/.env' })

const { video: muxVideo } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})

async function getPlaybackId() {
  try {
    const assetId = 'zVmjJGA8X7Fz6aU9I8o5tvRLlP68X00sanJ6C6FmMJ38'
    console.log('📡 Fetching asset:', assetId)
    
    const asset = await muxVideo.assets.retrieve(assetId)
    
    console.log('\n✅ Asset Status:', asset.status)
    console.log('Duration:', Math.floor(asset.duration / 60) + ':' + String(Math.floor(asset.duration % 60)).padStart(2, '0'))
    
    if (asset.playback_ids && asset.playback_ids.length > 0) {
      console.log('\n🎬 Playback IDs:')
      asset.playback_ids.forEach(pb => {
        console.log(`  - ID: ${pb.id}`)
        console.log(`    Policy: ${pb.policy}`)
      })
      
      const publicPlayback = asset.playback_ids.find(pb => pb.policy === 'public')
      if (publicPlayback) {
        console.log('\n✅ Use this playback ID:', publicPlayback.id)
        console.log('Test URL:', `https://stream.mux.com/${publicPlayback.id}.m3u8`)
      }
    } else {
      console.log('\n⚠️  No playback IDs found - asset may not be ready')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

getPlaybackId()

