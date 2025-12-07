#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function deepCompare() {
  console.log('🔬 DEEP COMPARISON OF ACCOUNTS\n')
  
  try {
    // Get full user data
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) throw error
    
    const anna = users.find(u => u.email === 'anna@breakthruweb.com')
    const bill = users.find(u => u.email === 'bill@billmaher.re')
    
    console.log('='.repeat(60))
    console.log('ANNA (WORKS) - Full Auth User Object:')
    console.log('='.repeat(60))
    console.log(JSON.stringify(anna, null, 2))
    
    console.log('\n' + '='.repeat(60))
    console.log('BILL (FAILS) - Full Auth User Object:')
    console.log('='.repeat(60))
    console.log(JSON.stringify(bill, null, 2))
    
    // Check profiles
    console.log('\n' + '='.repeat(60))
    console.log('PROFILES TABLE:')
    console.log('='.repeat(60))
    
    const { data: annaProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', anna.id)
      .single()
    
    const { data: billProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', bill.id)
      .single()
    
    console.log('\nAnna profile:', JSON.stringify(annaProfile, null, 2))
    console.log('\nBill profile:', JSON.stringify(billProfile, null, 2))
    
    // Key differences
    console.log('\n' + '='.repeat(60))
    console.log('KEY DIFFERENCES:')
    console.log('='.repeat(60))
    
    const keys = new Set([...Object.keys(anna || {}), ...Object.keys(bill || {})])
    keys.forEach(key => {
      if (JSON.stringify(anna?.[key]) !== JSON.stringify(bill?.[key])) {
        console.log(`\n${key}:`)
        console.log('  Anna:', JSON.stringify(anna?.[key]))
        console.log('  Bill:', JSON.stringify(bill?.[key]))
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  }
}

deepCompare()

