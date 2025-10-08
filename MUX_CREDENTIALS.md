# Mux Credentials & Configuration

## Current Production Credentials

```env
# Mux API (for uploading and managing videos)
MUX_TOKEN_ID="11af1ce0-bfeb-41d7-98c2-5f0465d7545c"
MUX_TOKEN_SECRET="[stored securely in .env]"

# Mux Signing Keys (for private video playback)
MUX_SIGNING_KEY_ID="3FFIw1z7j4G8bbqwAs00HCfGEKHfBhgybnANglVnLwwQ"
MUX_SIGNING_KEY_BASE64="[stored securely in .env]"
MUX_SIGNED_PLAYBACK=true
```

## Important Notes

1. **These are PRODUCTION credentials** - videos uploaded with these will incur costs
2. **Keep signing key secure** - anyone with this key can access your private videos
3. **Always use private videos** for premium content to protect your intellectual property

## Getting New Credentials

If you need to rotate credentials:

1. Log into Mux Dashboard: https://dashboard.mux.com
2. Go to Settings → API Access Tokens (for API credentials)
3. Go to Settings → Signing Keys (for video playback)
4. Update the `.env` file with new values
5. Restart the application: `pm2 restart dp-core --update-env`

## Environments

Make sure you're in the **Production** environment when:
- Uploading videos
- Getting credentials
- Checking video status

The Development environment uses different credentials and videos won't be accessible across environments.

