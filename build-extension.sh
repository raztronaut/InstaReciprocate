#!/bin/bash

# Create extension directory
mkdir -p dist-extension/icons

# Build the script
npm run build:inject

# Copy files to extension directory
cp manifest.json dist-extension/
cp background.js dist-extension/

# Note: You'll need to add icon files to the icons directory
echo "Extension files prepared in dist-extension/"
echo "Please add icon files to dist-extension/icons/ directory" 