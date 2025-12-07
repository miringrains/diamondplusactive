#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setPassword() {
  const email = 'rick@midcityhub.com'
  const userId = 'eb462b8f-2a2b-46d4-a4f4-5e6d0969690f'
  const newPassword = 'Rick@2025@'
  
  console.log('🔐 Setting password for:', email)
  console.log('   User ID:', userId)
  
  try {
    // Update password
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    })
    
    if (error) throw error
    
    console.log('✅ Password set successfully')
    
    // Update metadata to indicate has password
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { 
        has_password: true 
      }
    })
    
    console.log('✅ User metadata updated')
    
    console.log('\n✨ Rick can now login with:')
    console.log('   Email:', email)
    console.log('   Password:', newPassword)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

setPassword()

