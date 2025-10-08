# GoHighLevel Webhook Setup for Diamond Plus Portal

This guide explains how to set up the webhook integration between GoHighLevel and Diamond Plus Portal for automatic user creation.

## Overview

When a contact in GoHighLevel receives the `diamond-portal-member` tag, the system will:
1. Receive a webhook notification from GHL
2. Create a new user account in Supabase
3. Send an invitation email to the user
4. Create their profile in the database

## Setup Instructions

### 1. Add Webhook Secret to Environment

Add this to your `.env` file:
```bash
GHL_WEBHOOK_SECRET="your-webhook-secret-here"
```

### 2. Configure Webhook in GoHighLevel

1. Log into your GoHighLevel account
2. Navigate to **Settings > Webhooks**
3. Click **Add Webhook**
4. Configure as follows:

   - **Name**: Diamond Portal Member Signup
   - **URL**: 
     - Production: `https://diamondplusportal.com/api/webhooks/ghl`
     - Development: `https://dev.diamondplusportal.com/api/webhooks/ghl`
   - **Events**: Select `Contact Tag Added`
   - **Filters**: Add filter for tag name = `diamond-portal-member`
   - **Secret**: Generate a secure secret and save it in your `.env`

### 3. Test the Integration

#### Option A: Using the Test Script
```bash
cd /root/diamond-plus/core
node scripts/test-ghl-webhook.js
```

#### Option B: Manual Test in GHL
1. Create a test contact in GHL
2. Add the `diamond-portal-member` tag
3. Check the webhook logs in GHL
4. Check PM2 logs: `pm2 logs dp-core | grep "GHL Webhook"`

### 4. Webhook Payload Format

GHL sends this payload when a tag is added:
```json
{
  "type": "ContactTagCreate",
  "locationId": "uDZc67RtofRX4alCLGaz",
  "contactId": "contact-id-here",
  "id": "tag-id",
  "name": "diamond-portal-member",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### 5. Monitoring

Check webhook activity:
```bash
# View webhook logs
pm2 logs dp-core | grep "GHL Webhook"

# Check for errors
pm2 logs dp-core --err | grep "GHL"
```

### 6. Troubleshooting

**User not created:**
- Check if email exists in webhook payload
- Verify Supabase service role key is set
- Check if user already exists in Supabase

**Webhook not received:**
- Verify webhook URL is correct
- Check GHL webhook logs for delivery status
- Ensure tag name matches exactly: `diamond-portal-member`

**Signature verification fails:**
- Ensure `GHL_WEBHOOK_SECRET` matches the secret in GHL
- Check if GHL is sending the `X-GHL-Signature` header

### 7. Email Template

The invitation email is sent by Supabase using your configured email templates. To customize:
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Edit the "Invite User" template
3. Available variables:
   - `{{ .Email }}` - User's email
   - `{{ .ConfirmationURL }}` - Magic link for account setup
   - `{{ .Data.first_name }}` - User's first name
   - `{{ .Data.last_name }}` - User's last name

### 8. Security Considerations

- **Always verify webhook signatures** in production
- Use HTTPS for webhook endpoints
- Keep webhook secret secure and rotate periodically
- Monitor for unusual activity or repeated failures

## API Endpoint Details

**Endpoint**: `/api/webhooks/ghl`

**Methods**:
- `POST` - Receives webhook from GHL
- `GET` - Webhook verification endpoint

**Headers Required**:
- `Content-Type: application/json`
- `X-GHL-Signature: sha256=<signature>` (sent by GHL)

**Response Codes**:
- `200` - Success
- `400` - Bad request (missing email, etc.)
- `404` - Contact not found
- `500` - Server error

## Testing with cURL

```bash
# Test the webhook endpoint
curl -X POST https://diamondplusportal.com/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ContactTagCreate",
    "name": "diamond-portal-member",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "contactId": "test-123"
  }'
```
