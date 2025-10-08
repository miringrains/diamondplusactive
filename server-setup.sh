#!/bin/bash

# Diamond District Server Setup Script
# Server: 165.227.78.164
# This script sets up the production environment

echo "🚀 Diamond District Server Setup"
echo "Server: 165.227.78.164"
echo "================================"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /var/www/diamond-district/videos
mkdir -p /root/project/diamond-district

# Navigate to project directory
cd /root/project/diamond-district

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local template..."
    cat > .env.local << 'EOF'
# Production Environment Variables

# Database - Update with actual PostgreSQL credentials
DATABASE_URL="postgresql://diamonduser:your-password@165.227.78.164:5432/diamond_district"

# NextAuth - Generate a secure secret with: openssl rand -base64 32
NEXTAUTH_URL="http://165.227.78.164:3000"
NEXTAUTH_SECRET="CHANGE-THIS-TO-A-SECURE-SECRET"

# GoHighLevel Private Integration API (DO NOT CHANGE)
GHL_PRIVATE_KEY="pit-5324dab3-2e4b-44e7-8159-68ec6512a8a1"
GHL_LOCATION_ID="uDZc67RtofRX4alCLGaz"

# Email - Update with your SMTP credentials
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Diamond District <noreply@diamonddistrict.com>"

# Storage
VIDEO_STORAGE_PATH="/var/www/diamond-district/videos"
NEXT_PUBLIC_APP_URL="http://165.227.78.164:3000"

# Node Environment
NODE_ENV="production"
EOF
    echo "✅ .env.local template created"
    echo "⚠️  IMPORTANT: Edit .env.local and update:"
    echo "   - DATABASE_URL with actual PostgreSQL credentials"
    echo "   - NEXTAUTH_SECRET with a secure secret"
    echo "   - SMTP credentials if using email"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate deploy

# Build the application
echo "🏗️  Building application..."
npm run build

# Setup PM2
echo "🔄 Setting up PM2..."
pm2 stop diamond-district 2>/dev/null || true
pm2 delete diamond-district 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo "✅ Server setup complete!"
echo ""
echo "📋 Verify the following:"
echo "1. PostgreSQL is running on port 5432"
echo "2. Database 'diamond_district' exists"
echo "3. .env.local has been properly configured"
echo "4. Port 3000 is open in firewall"
echo ""
echo "🌐 Application URL: http://165.227.78.164:3000"
echo ""
echo "🔍 Check logs with: pm2 logs diamond-district"
echo "📊 Monitor with: pm2 monit"