import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixInviteUser(email: string) {
  console.log(`\n🔧 Fixing invite user: ${email}\n`)
  
  try {
    // Get user from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (authError || !authUser?.user) {
      console.error('❌ User not found:', authError)
      return
    }
    
    const user = authUser.user
    console.log('✅ User found:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No')
    console.log('  - Providers:', user.app_metadata.providers)
    
    // Check if email provider is missing
    const hasEmailProvider = user.app_metadata.providers?.includes('email')
    
    if (!hasEmailProvider) {
      console.log('\n⚠️  Email provider missing! This is the issue.')
      console.log('   User cannot login with password because email provider is not set.')
      
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      
      console.log('\n🔄 Fixing user...')
      
      // Update user with temporary password to add email provider
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          temp_password_set: true,
          fixed_at: new Date().toISOString()
        }
      })
      
      if (updateError) {
        console.error('❌ Failed to update user:', updateError)
        return
      }
      
      console.log('✅ User updated with temporary password')
      
      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'}/reset-password`
      })
      
      if (resetError) {
        console.error('❌ Failed to send password reset email:', resetError)
      } else {
        console.log('✅ Password reset email sent')
        console.log('   User should check their email and reset their password')
      }
      
    } else {
      console.log('\n✅ Email provider is already set')
      console.log('   User should be able to login with email/password')
      
      // Check if they need a password reset
      if (!user.user_metadata?.password_set) {
        console.log('\n⚠️  User has not set a password yet')
        console.log('   Sending password reset email...')
        
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://diamondplusportal.com'}/reset-password`
        })
        
        if (resetError) {
          console.error('❌ Failed to send password reset email:', resetError)
        } else {
          console.log('✅ Password reset email sent')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: npm run fix:invite-user <email>')
  console.log('Example: npm run fix:invite-user user@example.com')
  process.exit(1)
}

fixInviteUser(email)

