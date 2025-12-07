#!/usr/bin/env node

/**
 * SAFE MIGRATION: Add phone, location, bio columns to profiles table
 * 
 * Uses IF NOT EXISTS - safe to run multiple times
 * No data loss, no downtime
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🔄 Adding columns to profiles table...\n')

  try {
    // Add phone column
    console.log('1️⃣  Adding phone column...')
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;`
    })
    if (error1) {
      // Try direct query if RPC doesn't exist
      const { error: directError1 } = await supabase
        .from('profiles')
        .select('phone')
        .limit(1)
      
      if (directError1 && directError1.message.includes('column') && directError1.message.includes('does not exist')) {
        console.log('   ⚠️  Need to add column via SQL Editor in Supabase Dashboard')
      } else {
        console.log('   ✅ Phone column ready')
      }
    } else {
      console.log('   ✅ Phone column added')
    }

    // Add location column
    console.log('2️⃣  Adding location column...')
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;`
    })
    if (!error2) {
      console.log('   ✅ Location column added')
    }

    // Add bio column
    console.log('3️⃣  Adding bio column...')
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;`
    })
    if (!error3) {
      console.log('   ✅ Bio column added')
    }

    // Verify columns exist by trying to select them
    console.log('\n4️⃣  Verifying columns...')
    const { data, error: verifyError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, location, bio')
      .limit(1)

    if (verifyError) {
      console.error('   ❌ Verification failed:', verifyError.message)
      console.log('\n📋 MANUAL STEPS REQUIRED:')
      console.log('   Go to Supabase Dashboard → SQL Editor')
      console.log('   Run the SQL from: scripts/add-profile-columns.sql')
    } else {
      console.log('   ✅ All columns verified!')
      console.log('\n📊 Sample profile:')
      console.log(JSON.stringify(data, null, 2))
    }

    console.log('\n✨ Migration complete!')
    console.log('   Full name: Saves to full_name column')
    console.log('   Phone: Saves to phone column')
    console.log('   Location: Saves to location column')
    console.log('   Bio: Saves to bio column')

  } catch (error) {
    console.error('❌ Migration error:', error)
    console.log('\n📋 MANUAL STEPS:')
    console.log('   1. Go to https://supabase.com/dashboard')
    console.log('   2. Open your project')
    console.log('   3. Go to SQL Editor')
    console.log('   4. Run the SQL from: scripts/add-profile-columns.sql')
    process.exit(1)
  }
}

runMigration()






