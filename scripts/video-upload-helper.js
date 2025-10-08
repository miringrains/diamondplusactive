#!/usr/bin/env node
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import Mux from '@mux/mux-node'
import inquirer from 'inquirer'

const prisma = new PrismaClient()
const mux = new Mux()

async function main() {
  console.log('🎬 Diamond Plus Video Upload Helper\n')

  // Select section
  const { section } = await inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Which section are you adding videos to?',
      choices: [
        { name: 'Group Calls', value: 'group_calls' },
        { name: 'Workshops', value: 'workshops' },
        { name: 'Modules', value: 'modules' },
        { name: 'Other (custom table)', value: 'custom' }
      ]
    }
  ])

  let tableName = section
  if (section === 'custom') {
    const { customTable } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customTable',
        message: 'Enter the database table name:',
      }
    ])
    tableName = customTable
  }

  // Get video details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Video title:',
      validate: input => input.length > 0
    },
    {
      type: 'input',
      name: 'description',
      message: 'Video description (optional):',
    },
    {
      type: 'input',
      name: 'playbackId',
      message: 'Mux Playback ID:',
      validate: input => input.length > 0
    },
    {
      type: 'input',
      name: 'assetId',
      message: 'Mux Asset ID:',
      validate: input => input.length > 0
    },
    {
      type: 'confirm',
      name: 'published',
      message: 'Publish immediately?',
      default: true
    }
  ])

  // Try to get duration from Mux
  let duration = null
  try {
    const asset = await mux.video.assets.retrieve(answers.assetId)
    duration = Math.round(asset.duration || 0)
    console.log(`✅ Found video duration: ${formatDuration(duration)}`)
  } catch (error) {
    console.log('⚠️  Could not fetch duration from Mux')
    const { manualDuration } = await inquirer.prompt([
      {
        type: 'input',
        name: 'manualDuration',
        message: 'Enter duration in seconds:',
        default: '0'
      }
    ])
    duration = parseInt(manualDuration)
  }

  // Prepare data
  const videoData = {
    title: answers.title,
    description: answers.description || null,
    mux_playback_id: answers.playbackId,
    mux_asset_id: answers.assetId,
    thumbnail_url: `https://image.mux.com/${answers.playbackId}/thumbnail.png`,
    duration: duration,
    published: answers.published,
  }

  // Add date fields based on table
  if (tableName === 'group_calls') {
    const { callDate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'callDate',
        message: 'Call date (YYYY-MM-DD):',
        default: new Date().toISOString().split('T')[0]
      }
    ])
    videoData.call_date = new Date(callDate)
  }

  // Save to database
  try {
    const result = await prisma[tableName].create({ data: videoData })
    console.log('\n✅ Video added successfully!')
    console.log(`   ID: ${result.id}`)
    console.log(`   Title: ${result.title}`)
    console.log(`   Duration: ${formatDuration(duration)}`)
    console.log(`   Status: ${result.published ? 'Published' : 'Draft'}`)
  } catch (error) {
    console.error('\n❌ Error adding video:', error.message)
  }
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.round(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

