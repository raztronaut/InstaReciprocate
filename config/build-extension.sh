#!/bin/bash

# Clean dist directory
rm -rf dist-extension
mkdir -p dist-extension

# Run webpack build
npm run build

# Copy manifest
cp src/manifest.json dist-extension/

# Copy assets
cp -r src/assets dist-extension/

# Print success message
echo "✨ Extension built successfully!"
echo "📁 Check the dist-extension directory for the complete build" 