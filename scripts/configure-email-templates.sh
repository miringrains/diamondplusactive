#!/bin/bash

# Get access token from https://supabase.com/dashboard/account/tokens
# You'll need to set these environment variables
# export SUPABASE_ACCESS_TOKEN="your-access-token"
# export PROJECT_REF="birthcsvtmayyxrzzyhh"

curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_confirmation": "Welcome to Diamond Plus - Confirm Your Email",
    "mailer_templates_confirmation_content": "<h2>Welcome to Diamond Plus!</h2><p>Thank you for signing up. Please confirm your email address by clicking the link below:</p><p><a href=\"{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email\" style=\"background-color: #176FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">Confirm Email</a></p><p>If you didn'\''t create an account, you can safely ignore this email.</p>",
    "mailer_subjects_recovery": "Reset Your Diamond Plus Password",
    "mailer_templates_recovery_content": "<h2>Reset Your Password</h2><p>We received a request to reset your password. Click the link below to create a new password:</p><p><a href=\"{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password\" style=\"background-color: #176FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">Reset Password</a></p><p>This link will expire in 1 hour. If you didn'\''t request a password reset, you can safely ignore this email.</p>",
    "mailer_subjects_magic_link": "Your Diamond Plus Login Link",
    "mailer_templates_magic_link_content": "<h2>Login to Diamond Plus</h2><p>Click the link below to log in to your account:</p><p><a href=\"{{ .ConfirmationURL }}\" style=\"background-color: #176FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">Log In</a></p><p>This link will expire in 1 hour.</p>",
    "mailer_subjects_invite": "You'\''ve been invited to Diamond Plus",
    "mailer_templates_invite_content": "<h2>Welcome to Diamond Plus!</h2><p>You'\''ve been invited to join Diamond Plus. Click the link below to accept the invitation and create your account:</p><p><a href=\"{{ .ConfirmationURL }}\" style=\"background-color: #176FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">Accept Invitation</a></p>",
    "mailer_subjects_email_change": "Confirm Your Email Change",
    "mailer_templates_email_change_content": "<h2>Confirm Email Change</h2><p>You requested to change your email address. Please confirm this change by clicking the link below:</p><p><a href=\"{{ .ConfirmationURL }}\" style=\"background-color: #176FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">Confirm Email Change</a></p>"
  }'
