#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixEmail() {
  const userId = 'b52b3c63-1591-493c-b6f6-bfe5a9acc709'
  const oldEmail = 'mercyrubinrealtor@hmail.com'
  const newEmail = 'mercyrubinrealtor@gmail.com'
  
  console.log('📧 Fixing Mercy\'s email...')
  console.log('   Old:', oldEmail)
  console.log('   New:', newEmail)
  
  try {
    // Update email in auth
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email: newEmail
    })
    
    if (error) throw error
    
    console.log('✅ Email updated in auth.users')
    
    // Update email in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', userId)
    
    if (profileError) throw profileError
    
    console.log('✅ Email updated in profiles table')
    console.log('\n✨ Success! Mercy can now login with:')
    console.log('   Email:', newEmail)
    console.log('   (Use existing password or magic link)')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fixEmail()



