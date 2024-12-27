#!/bin/bash

# Exit on any error
set -e

# Configuration
DIST_DIR="dist-extension"
SRC_DIR="src"
VERSION=$(node -p "require('./package.json').version")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function for logging
log() {
    echo -e "${GREEN}[BUILD]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required tools are installed
command -v node >/dev/null 2>&1 || error "Node.js is required but not installed"
command -v npm >/dev/null 2>&1 || error "npm is required but not installed"

# Clean and create dist directory
log "Cleaning previous build..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR" || error "Failed to create dist directory"

# Build the project
log "Building project..."
if ! npm run build; then
    error "Build failed"
fi

# Copy static assets
log "Copying static assets..."
cp "$SRC_DIR/manifest.json" "$DIST_DIR/" || error "Failed to copy manifest.json"
cp -r "$SRC_DIR/assets" "$DIST_DIR/" || error "Failed to copy assets"

# Verify build
if [ ! -f "$DIST_DIR/content.js" ]; then
    error "Build verification failed: content.js not found"
fi

if [ ! -f "$DIST_DIR/background.js" ]; then
    error "Build verification failed: background.js not found"
fi

# Create build info
echo "{
  \"version\": \"$VERSION\",
  \"buildTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
}" > "$DIST_DIR/build-info.json"

# Calculate build size
BUILD_SIZE=$(du -sh "$DIST_DIR" | cut -f1)

# Success message
log "✨ Extension v$VERSION built successfully!"
log "📁 Build location: $DIST_DIR"
log "📦 Build size: $BUILD_SIZE"
log "🎯 Next steps:"
echo "   1. Load unpacked extension in Chrome"
echo "   2. Navigate to chrome://extensions"
echo "   3. Enable developer mode"
echo "   4. Click 'Load unpacked' and select the $DIST_DIR directory" 