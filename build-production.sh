#!/bin/bash

echo "=== Production Build Script ==="
echo "Checking system resources..."

# Show current memory usage
free -h

# Check if any builds are already running
if pgrep -f "npm run build" > /dev/null; then
    echo "ERROR: Another build is already running!"
    exit 1
fi

# Kill TypeScript servers to free memory
echo "Freeing up memory by stopping TypeScript servers..."
pkill -f tsserver || true
sleep 2

# Build with very conservative memory settings
echo "Starting build with memory constraints..."
export NODE_OPTIONS="--max-old-space-size=768"

# Use nice to lower priority
nice -n 10 npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    
    # Restart PM2 app
    echo "Restarting application..."
    pm2 restart diamond-district
    
    echo "Deployment complete!"
else
    echo "Build failed! Check the errors above."
    exit 1
fi

