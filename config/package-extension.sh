#!/bin/bash

# Exit on any error
set -e

# Configuration
DIST_DIR="dist-extension"
VERSION=$(node -p "require('./package.json').version")
ZIP_NAME="insta-reciprocate-v${VERSION}.zip"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Helper function for logging
log() {
    echo -e "${GREEN}[PACKAGE]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Verify dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    error "Distribution directory not found. Run build:prod first."
fi

# Create zip file for Chrome Web Store
log "Creating ZIP file for Chrome Web Store submission..."
cd "$DIST_DIR" || error "Could not change to dist directory"

# Remove any existing zip file
rm -f "../$ZIP_NAME"

# Create zip file excluding unnecessary files
zip -r "../$ZIP_NAME" . -x "*.map" "build-info.json" "*.DS_Store" || error "Failed to create ZIP file"

cd ..

# Verify zip file was created
if [ -f "$ZIP_NAME" ]; then
    ZIP_SIZE=$(du -h "$ZIP_NAME" | cut -f1)
    log "✨ Successfully created $ZIP_NAME (Size: $ZIP_SIZE)"
    log "🎯 Ready for Chrome Web Store submission!"
    log "📝 Next steps:"
    echo "   1. Go to Chrome Web Store Developer Dashboard"
    echo "   2. Upload $ZIP_NAME"
    echo "   3. Fill in store listing details"
    echo "   4. Submit for review"
else
    error "Failed to create ZIP file"
fi 