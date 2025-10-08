#!/bin/bash

# Script to build Next.js app with optimized memory settings

echo "🔨 Starting optimized production build..."

# Clean previous builds
echo "🧹 Cleaning previous build artifacts..."
rm -rf .next

# Set Node.js memory options
export NODE_OPTIONS="--max-old-space-size=2048"

# Build with error handling
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed. Trying with more aggressive memory settings..."
    
    # Even more conservative settings
    export NODE_OPTIONS="--max-old-space-size=1536"
    
    # Try building again
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build completed with fallback settings!"
    else
        echo "❌ Build failed even with fallback settings"
        exit 1
    fi
fi

echo "🎉 Build process complete!"
