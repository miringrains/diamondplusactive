# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@165.227.78.164:5432/diamond-district"

# NextAuth
NEXTAUTH_URL="http://165.227.78.164:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Admin Account (created via seed script)
ADMIN_EMAIL="admin@diamonddistrict.com"
ADMIN_PASSWORD="ChangeThisSecurePassword123!"
ADMIN_FIRST_NAME="System"
ADMIN_LAST_NAME="Administrator"
ADMIN_PHONE="+1234567890"

# GoHighLevel Private Integration API
GHL_PRIVATE_KEY="pit-5324dab3-2e4b-44e7-8159-68ec6512a8a1"
GHL_LOCATION_ID="uDZc67RtofRX4alCLGaz"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Diamond District <noreply@diamonddistrict.com>"

# Storage
VIDEO_STORAGE_PATH="/public/videos"
NEXT_PUBLIC_APP_URL="http://165.227.78.164:3000"
```

## GoHighLevel Integration Notes

- **GHL_PRIVATE_KEY**: This is your private integration API key (format: `pit-xxxx-xxxx...`)
- **GHL_LOCATION_ID**: The specific subaccount/location ID where contacts should be created
- The integration will automatically:
  - Check if a contact exists in the specified location
  - Create the contact if it doesn't exist
  - Apply the "free course" tag (auto-created if needed)
  - Store the GHL contact ID in the local database

## Security

- Never commit `.env.local` to version control
- The private integration key is scoped only to your subaccount
- All GHL API calls are made server-side only