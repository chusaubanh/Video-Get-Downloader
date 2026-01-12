#!/bin/bash
# Build script for Video-Get-Downloader
# This script builds the Electron app for all platforms

set -e

echo "🚀 Video-Get-Downloader Build Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Generate icons if not exists
if [ ! -f "build/icon.ico" ]; then
    echo -e "${YELLOW}🎨 Generating icons...${NC}"
    npm install sharp png-to-ico --save-dev 2>/dev/null || true
    node scripts/generate-icons.js
fi

# Build web assets
echo -e "${YELLOW}🔨 Building web assets...${NC}"
npm run build

# Determine build target
BUILD_TARGET=${1:-"all"}

case $BUILD_TARGET in
    "win" | "windows")
        echo -e "${YELLOW}🪟 Building for Windows...${NC}"
        npm run electron:build:win
        ;;
    "mac" | "macos")
        echo -e "${YELLOW}🍎 Building for MacOS...${NC}"
        npm run electron:build:mac
        ;;
    "linux")
        echo -e "${YELLOW}🐧 Building for Linux...${NC}"
        npm run electron:build:linux
        ;;
    "all")
        echo -e "${YELLOW}📦 Building for all platforms...${NC}"
        npm run electron:build:all
        ;;
    *)
        echo -e "${RED}Unknown target: $BUILD_TARGET${NC}"
        echo "Usage: ./scripts/build.sh [win|mac|linux|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "📁 Output files are in the ${YELLOW}release/${NC} directory"
echo ""
ls -la release/ 2>/dev/null || echo "No release directory found"
