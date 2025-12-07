#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixBio() {
  const userId = 'cac07fc7-22b2-477b-b767-55dc5c8e13c1'
  
  // Clean bio without corrupted characters
  const cleanBio = "Bill Maher is a highly skilled real estate professional with nearly 26 years of experience. He is a member of the South Metro Denver Realtor Association and serves the diverse real estate needs of home buyers and sellers throughout the metro Denver area."
  
  console.log('🔧 Fixing Bill\'s bio...')
  
  try {
    // Update user metadata
    const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        bio: cleanBio
      }
    })
    
    if (metaError) throw metaError
    
    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ bio: cleanBio })
      .eq('id', userId)
    
    if (profileError) throw profileError
    
    console.log('✅ Bio fixed - removed corrupted UTF-8 characters')
    console.log('✅ Login should work now!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fixBio()

