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

async function debugUser(email: string) {
  console.log(`\n🔍 Debugging user: ${email}\n`)
  
  try {
    // Get user from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (authError) {
      console.error('❌ Error fetching auth user:', authError)
      return
    }
    
    if (!authUser || !authUser.user) {
      console.log('❌ User not found in auth.users')
      return
    }
    
    console.log('✅ Auth User Found:')
    console.log('  - ID:', authUser.user.id)
    console.log('  - Email:', authUser.user.email)
    console.log('  - Email Confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No')
    console.log('  - Created:', authUser.user.created_at)
    console.log('  - Last Sign In:', authUser.user.last_sign_in_at)
    console.log('  - Providers:', authUser.user.app_metadata.providers)
    console.log('  - User Metadata:', JSON.stringify(authUser.user.user_metadata, null, 2))
    console.log('  - App Metadata:', JSON.stringify(authUser.user.app_metadata, null, 2))
    
    // Check if user can sign in with password
    console.log('\n🔐 Testing Password Authentication:')
    const testPassword = 'TestPassword123!' // You'll need to know the actual password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: testPassword
    })
    
    if (signInError) {
      console.log('❌ Password sign-in failed:', signInError.message)
      console.log('   This might be why the user can\'t log in after setting password')
    } else {
      console.log('✅ Password sign-in successful!')
    }
    
    // Get profile data
    console.log('\n👤 Profile Data:')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ No profile found:', profileError.message)
    } else {
      console.log('✅ Profile found:')
      console.log('  - Full Name:', profile.full_name)
      console.log('  - Role:', profile.role)
      console.log('  - Metadata:', JSON.stringify(profile.metadata, null, 2))
    }
    
    // Check for any recent auth logs
    console.log('\n📝 Recent Auth Activity:')
    const { data: logs } = await supabase
      .from('auth.audit_log_entries')
      .select('*')
      .eq('payload->user_id', authUser.user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (logs && logs.length > 0) {
      logs.forEach((log: any) => {
        console.log(`  - ${log.created_at}: ${log.payload.event_message || log.payload.type}`)
      })
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:')
    if (!authUser.user.email_confirmed_at) {
      console.log('  ⚠️  User email is not confirmed. This might prevent password login.')
      console.log('     Fix: Update user with email_confirmed_at timestamp')
    }
    if (!authUser.user.app_metadata.providers?.includes('email')) {
      console.log('  ⚠️  Email provider not in user providers list.')
      console.log('     Fix: Ensure email provider is added when user sets password')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: npm run debug:user <email>')
  console.log('Example: npm run debug:user user@example.com')
  process.exit(1)
}

debugUser(email)

