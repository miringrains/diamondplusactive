#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function diagnose() {
  console.log('🔍 Diagnosing Bill vs Anna accounts...\n')
  
  try {
    // Get both users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) throw error
    
    const anna = users.find(u => u.email === 'anna@breakthruweb.com')
    const bill = users.find(u => u.email === 'bill@billmaher.re')
    
    if (!anna || !bill) {
      console.error('❌ Could not find one or both users')
      return
    }
    
    console.log('👤 ANNA (WORKS):')
    console.log('   Email confirmed:', anna.email_confirmed_at ? '✅ YES' : '❌ NO')
    console.log('   Phone confirmed:', anna.phone_confirmed_at ? '✅ YES' : '❌ NO')
    console.log('   Banned:', anna.banned_until ? '❌ BANNED' : '✅ Active')
    console.log('   Last sign in:', anna.last_sign_in_at || 'Never')
    console.log('   Metadata has_password:', anna.user_metadata?.has_password)
    console.log('   Created via:', anna.app_metadata?.provider || 'N/A')
    
    console.log('\n👤 BILL (FAILS):')
    console.log('   Email confirmed:', bill.email_confirmed_at ? '✅ YES' : '❌ NO')
    console.log('   Phone confirmed:', bill.phone_confirmed_at ? '✅ YES' : '❌ NO')
    console.log('   Banned:', bill.banned_until ? '❌ BANNED' : '✅ Active')
    console.log('   Last sign in:', bill.last_sign_in_at || 'Never')
    console.log('   Metadata has_password:', bill.user_metadata?.has_password)
    console.log('   Created via:', bill.app_metadata?.provider || 'N/A')
    
    // Test password login for Bill
    console.log('\n🔐 Testing Bill\'s password login...')
    const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
      email: 'bill@billmaher.re',
      password: 'Diamond2025!'
    })
    
    if (testError) {
      console.error('❌ Login failed:', testError.message)
      console.error('   Error code:', testError.status)
      console.error('   Details:', testError)
    } else {
      console.log('✅ Login successful!')
      console.log('   User ID:', testData.user?.id)
      console.log('   Session valid:', testData.session ? 'YES' : 'NO')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

diagnose()

