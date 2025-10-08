#!/bin/bash

# Diamond District Admin Setup Script
# This script sets up the database and creates the initial admin account

echo "🚀 Diamond District Admin Setup"
echo "================================"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the diamond-district directory!"
    exit 1
fi

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your configuration first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Creating database migration..."
npx prisma migrate dev --name add_user_fields

echo "🌱 Running seed script to create admin..."
npx prisma db seed

echo "✅ Setup complete!"
echo ""
echo "📋 Admin account has been created with credentials from .env.local:"
echo "   - Email: Check ADMIN_EMAIL in .env.local"
echo "   - Password: Check ADMIN_PASSWORD in .env.local"
echo ""
echo "⚠️  IMPORTANT: Change the admin password after first login!"
echo ""
echo "🚀 You can now start the application with: npm run dev"