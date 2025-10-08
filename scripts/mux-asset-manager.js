#!/usr/bin/env node

import 'dotenv/config'
import Mux from '@mux/mux-node'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})

async function listMuxAssets(filter = {}) {
  try {
    console.log('\n📋 Fetching Mux assets...\n')
    
    const assets = await mux.video.assets.list({
      limit: 100,
      ...filter
    })
    
    console.log(`Found ${assets.length} assets:\n`)
    
    assets.forEach((asset, index) => {
      const playbackId = asset.playback_ids?.[0]?.id
      const policy = asset.playback_ids?.[0]?.policy || 'unknown'
      const passthrough = asset.passthrough ? JSON.parse(asset.passthrough) : {}
      
      console.log(`${index + 1}. ${asset.id}`)
      console.log(`   Name: ${asset.name || 'Untitled'}`)
      console.log(`   Status: ${asset.status}`)
      console.log(`   Playback: ${playbackId} (${policy})`)
      console.log(`   Type: ${passthrough.type || 'N/A'}`)
      console.log(`   Created: ${new Date(asset.created_at * 1000).toLocaleString()}`)
      console.log(`   Duration: ${asset.duration ? `${Math.round(asset.duration)}s` : 'N/A'}`)
      console.log('')
    })
    
    return assets
  } catch (error) {
    console.error('Error listing assets:', error)
  }
}

async function updateAssetPolicy(assetId, makePrivate = true) {
  try {
    console.log(`\n🔄 Updating asset ${assetId} to ${makePrivate ? 'private' : 'public'}...`)
    
    // First get the asset
    const asset = await mux.video.assets.retrieve(assetId)
    const playbackId = asset.playback_ids?.[0]?.id
    
    if (!playbackId) {
      throw new Error('No playback ID found for asset')
    }
    
    // Delete existing playback ID
    await mux.video.assets.deletePlaybackId(assetId, playbackId)
    
    // Create new playback ID with desired policy
    const newPlayback = await mux.video.assets.createPlaybackId(assetId, {
      policy: makePrivate ? 'signed' : 'public'
    })
    
    console.log(`✅ Updated to ${makePrivate ? 'private' : 'public'} playback`)
    console.log(`   New playback ID: ${newPlayback.id}`)
    
    return newPlayback
  } catch (error) {
    console.error('Error updating asset:', error)
  }
}

async function syncDatabaseWithMux() {
  console.log('\n🔄 Syncing database with Mux assets...\n')
  
  // Check group calls
  const groupCalls = await prisma.group_calls.findMany({
    where: { mux_asset_id: { not: null } }
  })
  
  for (const call of groupCalls) {
    try {
      const asset = await mux.video.assets.retrieve(call.mux_asset_id)
      const playbackId = asset.playback_ids?.[0]?.id
      
      if (playbackId !== call.mux_playback_id) {
        console.log(`Updating group call ${call.id}: ${call.mux_playback_id} → ${playbackId}`)
        await prisma.group_calls.update({
          where: { id: call.id },
          data: { mux_playback_id: playbackId }
        })
      }
    } catch (error) {
      console.error(`Failed to sync group call ${call.id}:`, error.message)
    }
  }
  
  console.log('\n✅ Sync complete!')
}

async function findOrphanedAssets() {
  console.log('\n🔍 Finding orphaned Mux assets...\n')
  
  const assets = await mux.video.assets.list({ limit: 100 })
  const orphaned = []
  
  for (const asset of assets) {
    const passthrough = asset.passthrough ? JSON.parse(asset.passthrough) : {}
    
    if (passthrough.portal !== 'diamond_plus') continue
    
    let found = false
    
    // Check all tables
    if (passthrough.type === 'group_call') {
      found = await prisma.group_calls.findFirst({
        where: { mux_asset_id: asset.id }
      })
    } else if (passthrough.type === 'podcast') {
      found = await prisma.podcasts.findFirst({
        where: { mux_asset_id: asset.id }
      })
    }
    // Add other types as needed
    
    if (!found) {
      orphaned.push(asset)
      console.log(`Orphaned: ${asset.id} - ${asset.name || 'Untitled'}`)
    }
  }
  
  console.log(`\nFound ${orphaned.length} orphaned assets`)
  return orphaned
}

// CLI
async function main() {
  const command = process.argv[2]
  
  const commands = {
    list: 'List all Mux assets',
    'list-private': 'List private (signed) assets',
    'list-public': 'List public assets',
    'make-private': 'Convert asset to private (requires asset ID)',
    'make-public': 'Convert asset to public (requires asset ID)',
    sync: 'Sync database with Mux',
    orphaned: 'Find orphaned assets'
  }
  
  if (!command || !commands[command]) {
    console.log(`
Mux Asset Manager

Usage: node mux-asset-manager.js <command> [options]

Commands:
${Object.entries(commands).map(([cmd, desc]) => `  ${cmd.padEnd(15)} ${desc}`).join('\n')}

Examples:
  node mux-asset-manager.js list
  node mux-asset-manager.js make-private <asset-id>
`)
    process.exit(1)
  }
  
  try {
    switch (command) {
      case 'list':
        await listMuxAssets()
        break
      case 'list-private':
        await listMuxAssets({ playback_policy: 'signed' })
        break
      case 'list-public':
        await listMuxAssets({ playback_policy: 'public' })
        break
      case 'make-private':
        await updateAssetPolicy(process.argv[3], true)
        break
      case 'make-public':
        await updateAssetPolicy(process.argv[3], false)
        break
      case 'sync':
        await syncDatabaseWithMux()
        break
      case 'orphaned':
        await findOrphanedAssets()
        break
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
