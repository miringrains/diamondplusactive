#!/usr/bin/env node

const fetch = require('node-fetch')

// Test the password reset flow on production
async function testRecoveryFlow() {
  const baseUrl = 'https://diamondplusportal.com'
  
  console.log('🧪 Testing Password Reset Flow\n')
  
  // Step 1: Check current session status
  console.log('1️⃣ Checking current session status...')
  try {
    const statusRes = await fetch(`${baseUrl}/api/auth/test-reset?action=status`)
    const status = await statusRes.json()
    console.log('Current session:', status.currentSession || 'No session')
    console.log('Auth cookies:', status.authCookies || [])
    console.log('')
  } catch (e) {
    console.error('Error checking status:', e.message)
  }
  
  // Step 2: Send reset email
  console.log('2️⃣ Sending reset email to test@example.com...')
  try {
    const resetRes = await fetch(`${baseUrl}/api/auth/test-reset?action=send-reset&email=test@example.com`)
    const reset = await resetRes.json()
    console.log('Reset email sent:', reset.resetEmailSent)
    console.log('Reset error:', reset.resetError || 'None')
    console.log('')
  } catch (e) {
    console.error('Error sending reset:', e.message)
  }
  
  // Step 3: Simulate clicking the reset link
  console.log('3️⃣ Simulating reset link click...')
  console.log('A real reset link would look like:')
  console.log(`${baseUrl}/auth/confirm?code=XXXX&type=recovery`)
  console.log('')
  console.log('This would:')
  console.log('- Hit /auth/confirm route')
  console.log('- Detect type=recovery')
  console.log('- Redirect to /reset-password?code=XXXX')
  console.log('- Client exchanges code for recovery session')
  console.log('')
  
  // Step 4: Check recovery session
  console.log('4️⃣ After following reset link, the session should be:')
  console.log('- Limited scope (recovery session)')
  console.log('- AMR should include { method: "recovery" }')
  console.log('- User can only update password, not access other resources')
  console.log('')
  
  console.log('✅ Test flow complete. Check email for actual reset link.')
}

testRecoveryFlow().catch(console.error)

