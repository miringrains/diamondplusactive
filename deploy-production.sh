#!/bin/bash

# Stop any existing PM2 process
pm2 delete dp-core 2>/dev/null || true

# Kill any hanging processes
pkill -f "prisma studio" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Change to the correct directory
cd /root/diamond-plus/core

# Build the application
echo "Building application for production..."
npm run build

# Start PM2 in production mode with ecosystem config
echo "Starting PM2 in production mode..."
pm2 start ecosystem.config.js

echo "Deployment complete!"
pm2 status

