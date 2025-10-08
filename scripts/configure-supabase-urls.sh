#!/bin/bash

# Configure Site URL and Redirect URLs
# export SUPABASE_ACCESS_TOKEN="your-access-token"
# export PROJECT_REF="birthcsvtmayyxrzzyhh"

curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://diamondplusportal.com",
    "redirect_urls": [
      "https://diamondplusportal.com/**",
      "https://diamondplusportal.com/dashboard",
      "https://diamondplusportal.com/auth/confirm",
      "https://diamondplusportal.com/reset-password"
    ],
    "security_captcha_enabled": false,
    "external_email_enabled": true,
    "mailer_autoconfirm": false,
    "sms_autoconfirm": false
  }'
