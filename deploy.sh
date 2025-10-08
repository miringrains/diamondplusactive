#!/bin/bash

# Diamond District Deployment Script
# Server: 165.227.78.164
# Path: /root/project/diamond-district

echo "🚀 Starting Diamond District deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the diamond-district directory!"
    exit 1
fi

# Load environment variables
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with the following variables:"
    echo "- DATABASE_URL"
    echo "- NEXTAUTH_URL"
    echo "- NEXTAUTH_SECRET"
    echo "- GHL_PRIVATE_KEY"
    echo "- GHL_LOCATION_ID"
    exit 1
fi

# Check for required environment variables
source .env.local
if [ -z "$GHL_PRIVATE_KEY" ] || [ -z "$GHL_LOCATION_ID" ]; then
    echo "❌ Error: Missing required GoHighLevel environment variables!"
    echo "Make sure GHL_PRIVATE_KEY and GHL_LOCATION_ID are set in .env.local"
    exit 1
fi

echo "✅ Environment variables loaded"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️  Building application..."
npm run build

# Start/restart with PM2
echo "🔄 Starting application with PM2..."
pm2 stop diamond-district 2>/dev/null || true
pm2 start npm --name "diamond-district" -- start
pm2 save

echo "✅ Deployment complete!"
echo "🌐 Application running at: http://165.227.78.164:3000"
echo ""
echo "📝 Post-deployment checklist:"
echo "- [ ] Verify GoHighLevel integration is working"
echo "- [ ] Test user registration flow"
echo "- [ ] Check that contacts are being created in location: uDZc67RtofRX4alCLGaz"
echo "- [ ] Verify 'free course' tag is being applied"