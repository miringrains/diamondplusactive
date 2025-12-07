#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setPassword() {
  const email = 'bill@billmaher.re'
  const userId = 'cac07fc7-22b2-477b-b767-55dc5c8e13c1'
  const newPassword = 'Diamond2025!'
  
  console.log('🔐 Setting password for:', email)
  console.log('   User ID:', userId)
  
  try {
    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })
    
    if (error) throw error
    
    console.log('✅ Password updated')
    
    // Update metadata to indicate has password
    const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { has_password: true }
    })
    
    if (metaError) {
      console.warn('⚠️  Metadata update failed:', metaError.message)
    } else {
      console.log('✅ User metadata updated (has_password: true)')
    }
    
    // Update profile if exists
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
    
    if (profileError) {
      console.log('ℹ️  No profile to update')
    }
    
    console.log('\n✨ Success! User can now login with:')
    console.log('   Email:', email)
    console.log('   Password:', newPassword)
    console.log('\n⚠️  IMPORTANT: Ask Bill to change password after first login')
    console.log('   Go to: https://diamondplusportal.com/me/profile')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

setPassword()

