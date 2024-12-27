#!/bin/bash

set -e  # Exit on error

# Change to root directory
cd "$(dirname "$0")/.."

# Clean dist directory
rm -rf dist-extension
mkdir -p dist-extension

# Build the extension
npx webpack --config ./config/webpack.config.js

# Create assets directory
mkdir -p dist-extension/assets/icons

# Copy static assets
cp src/assets/icons/icon16.png dist-extension/assets/icons/
cp src/assets/icons/icon48.png dist-extension/assets/icons/
cp src/assets/icons/icon128.png dist-extension/assets/icons/
cp src/assets/icons/HeartHandsEmoji.png dist-extension/assets/icons/
cp src/assets/icons/logo.jpg dist-extension/assets/icons/
cp src/assets/icons/logo.png dist-extension/assets/icons/
cp src/assets/icons/sparkles.png dist-extension/assets/icons/
cp src/manifest.json dist-extension/

echo "Build complete! Extension files are in dist-extension/" 