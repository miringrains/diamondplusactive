#!/usr/bin/env node

/**
 * SAFE MIGRATION: Add columns to profiles table via SQL
 * Uses Supabase client to execute SQL directly
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase...')
console.log('   URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('\n🔄 Running migration...\n')

  // Execute the SQL
  const sql = `
    -- Add phone column
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
    
    -- Add location column
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
    
    -- Add bio column
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
    
    -- Add index
    CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
  `

  try {
    // Try using the REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    console.log('✅ Migration executed via API')
  } catch (error) {
    console.log('⚠️  Cannot execute via API, using SQL Editor method...\n')
  }

  // Verify by trying to query the columns
  console.log('4️⃣  Verifying columns exist...')
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, location, bio')
    .limit(1)

  if (error) {
    console.error('\n❌ Columns not yet added:', error.message)
    console.log('\n📋 PLEASE RUN THIS SQL IN SUPABASE DASHBOARD:')
    console.log('─'.repeat(60))
    console.log(sql.trim())
    console.log('─'.repeat(60))
    console.log('\n📍 Steps:')
    console.log('   1. Go to: https://supabase.com/dashboard')
    console.log('   2. Select your project')
    console.log('   3. Click "SQL Editor" in left sidebar')
    console.log('   4. Click "New Query"')
    console.log('   5. Paste the SQL above')
    console.log('   6. Click "Run"')
    console.log('   7. Run this script again to verify')
    process.exit(1)
  } else {
    console.log('   ✅ All columns exist!')
    console.log('\n📊 Sample profile:', JSON.stringify(data[0], null, 2))
    console.log('\n✨ Migration complete! You can now save phone, location, and bio.')
  }
}

runMigration()

