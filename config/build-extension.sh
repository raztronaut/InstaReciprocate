#!/bin/bash

# Clean dist directory
rm -rf dist-extension
mkdir -p dist-extension/assets

# Build the extension
npx webpack --config config/webpack.config.js

# Copy static assets
cp -r src/assets/icons dist-extension/assets/
cp src/manifest.json dist-extension/

echo "Build complete! Extension files are in dist-extension/" 