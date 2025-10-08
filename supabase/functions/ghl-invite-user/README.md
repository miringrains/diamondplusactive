# GHL Invite User Edge Function

This Supabase Edge Function handles webhook requests from GoHighLevel to create user accounts in Diamond Plus.

## Features

- Validates webhook secret for security
- Creates new users with auto-confirmed emails
- Generates recovery links for password setup
- Updates existing users' metadata if they already exist
- Sends welcome emails with password setup links
- Creates user profiles in the database

## Deployment

1. Deploy to Supabase:
```bash
supabase functions deploy ghl-invite-user
```

2. Set the webhook secret (optional, currently hardcoded):
```bash
supabase secrets set WEBHOOK_SECRET=birthcsvtmayyxrzzyhh
```

## GHL Webhook Configuration

Configure your GHL webhook with these settings:

- **Method**: POST
- **URL**: `https://birthcsvtmayyxrzzyhh.supabase.co/functions/v1/ghl-invite-user`
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-Webhook-Secret`: `birthcsvtmayyxrzzyhh`
- **Custom Data**:
  - `contactId`: `{{contact.id}}`
  - `email`: `{{contact.email}}`
  - `first_name`: `{{contact.first_name}}`
  - `last_name`: `{{contact.last_name}}`
  - `phone`: `{{contact.phone}}`
  - `tag`: `{{trigger.event_tag_name}}`
  - `source`: `ghl`

## Response

Success response:
```json
{
  "success": true,
  "message": "User created and recovery email sent",
  "userId": "uuid",
  "email": "user@example.com",
  "recoveryLink": "https://..."
}
```

## Flow

1. GHL sends webhook when tag is applied
2. Edge function creates user with confirmed email
3. Generates recovery link (not invite link)
4. Sends welcome email with password setup link
5. User clicks link → goes to `/auth/confirm`
6. Auth confirm detects new user → redirects to `/set-password`
7. User sets password → redirects to `/login`

