#!/bin/bash

echo "🧹 Cleaning Diamond District build artifacts..."

# Remove Next.js cache
echo "Removing .next directory..."
rm -rf .next

# Remove node_modules cache
echo "Removing node_modules cache..."
rm -rf node_modules/.cache

# Remove any turbo cache
echo "Removing .turbo directory..."
rm -rf .turbo

# Remove parcel cache if exists
echo "Removing .parcel-cache..."
rm -rf .parcel-cache

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

echo "✅ Clean complete!"
echo ""
echo "Now run:"
echo "  npm run build"
echo "  pm2 restart diamond-district"
