const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'https://briviiwqqrqtcuccsaik.supabase.co/functions/v1/ghl-invite-user';
const WEBHOOK_SECRET = 'v1,whsec_your_secret_here'; // Replace with actual secret

// Test data - UPDATE THE EMAIL HERE
const testPayload = {
  type: "ContactTagCreate",
  locationId: "uDZc67RtofRX4alCLGaz",
  id: "test-tag-" + Date.now(),
  contactId: "test-contact-" + Date.now(),
  tagIds: ["diamond-portal-member"],
  email: "anna@breakthruweb.com", // CHANGE THIS TO YOUR TEST EMAIL
  firstName: "Test",
  lastName: "User",
  source: "test"
};

// Generate signature
const timestamp = Date.now();
const message = `${timestamp}.${JSON.stringify(testPayload)}`;
const secret = WEBHOOK_SECRET.replace('v1,whsec_', '');
const signature = crypto.createHmac('sha256', secret).update(message).digest('hex');

// Make the request
console.log('Triggering fresh invite for:', testPayload.email);
console.log('Webhook URL:', WEBHOOK_URL);

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-GHL-Signature': `v1,${timestamp},${signature}`
  },
  body: JSON.stringify(testPayload)
})
.then(res => res.text())
.then(text => {
  console.log('\nResponse:', text);
  console.log('\n✅ If successful, check your email for a new invite link!');
  console.log('⏱️  Click the link IMMEDIATELY - it will expire in 24 hours (or less)');
})
.catch(err => {
  console.error('Error:', err);
});
