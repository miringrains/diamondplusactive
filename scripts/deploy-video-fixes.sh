#!/bin/bash

# Deploy Video Player Fixes for Diamond District
# This script deploys the enhanced video player components

echo "🎬 Deploying Video Player Fixes for Diamond District"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Not in the Diamond District project root${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📋 Pre-deployment Checklist:${NC}"
echo "1. Enhanced Video Player Component: src/components/video-player-enhanced.tsx"
echo "2. Enhanced Lesson View: src/app/(dashboard)/lessons/[id]/LessonViewEnhanced.tsx"
echo "3. Updated Page Component: src/app/(dashboard)/lessons/[id]/page.tsx"
echo "4. Documentation: docs/video-player-fixes.md"

echo -e "\n${YELLOW}🔧 Building the application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Please fix errors before deploying.${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Build successful!${NC}"

echo -e "\n${YELLOW}📦 Deployment Steps:${NC}"
echo "1. The enhanced components are backward compatible"
echo "2. Original components remain unchanged for easy rollback"
echo "3. LocalStorage is used for instant resume functionality"
echo "4. Database sync continues in the background"

echo -e "\n${YELLOW}🧪 Testing Checklist:${NC}"
echo "[ ] Video player doesn't reinitialize when playing"
echo "[ ] Resume works immediately after page refresh"
echo "[ ] Notes sidebar toggles smoothly with 70/30 split"
echo "[ ] Progress saves on tab close/navigation"
echo "[ ] Mobile responsive layout works correctly"

echo -e "\n${GREEN}🚀 Ready for deployment!${NC}"
echo -e "Run ${YELLOW}pm2 restart diamond-district${NC} on the production server"

# Optional: Add automatic deployment if SSH is configured
# echo -e "\n${YELLOW}Deploy to production? (y/n)${NC}"
# read -r response
# if [[ "$response" == "y" ]]; then
#     ssh root@165.227.78.164 "cd /root/project/diamond-district && git pull && npm install && npm run build && pm2 restart diamond-district"
# fi
