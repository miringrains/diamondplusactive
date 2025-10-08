// Test script for GHL webhook
// Usage: node scripts/test-ghl-webhook.js

const axios = require('axios')

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3021/api/webhooks/ghl'

async function testWebhook() {
  console.log('Testing GHL webhook at:', WEBHOOK_URL)
  
  // Sample webhook payload when tag is added
  const payload = {
    type: 'ContactTagCreate',
    locationId: 'uDZc67RtofRX4alCLGaz',
    contactId: 'test-contact-123',
    id: 'tag-456',
    name: 'diamond-portal-member',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  }
  
  try {
    console.log('Sending webhook payload:', JSON.stringify(payload, null, 2))
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        // In production, GHL will send signature header
        // 'X-GHL-Signature': 'sha256=...'
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response data:', response.data)
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

// Test GET endpoint (for verification)
async function testVerification() {
  try {
    const response = await axios.get(WEBHOOK_URL)
    console.log('GET Response:', response.data)
  } catch (error) {
    console.error('GET Error:', error.message)
  }
}

// Run tests
console.log('=== Testing GHL Webhook ===\n')
testVerification().then(() => {
  console.log('\n=== Testing Webhook POST ===\n')
  return testWebhook()
})
