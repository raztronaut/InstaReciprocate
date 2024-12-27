# InstaReciprocate Source Directory Structure

## 📁 Source Files

### 📁 src/inject/script.ts
Main application file. For detailed documentation of the InstaReciprocate class and its functionality, see [repotree.md](repotree.md).

### 📁 src/background/background.js
Chrome extension background script.

```javascript
// Core functionality:
- Extension icon click detection
- Instagram page detection
- Content script injection
- Page redirection if needed
```

### 📁 src/assets/
Extension assets (icons, images)

### 📁 src/manifest.json
Chrome extension manifest file

## 🔗 Dependencies
- Chrome Extension API
- Instagram GraphQL API
  - Following: query_hash=3dec7e2c57367ef3da3d987d89f9dbc8
  - Followers: query_hash=5aefa9893005572d237da5068082d8d5

## 🏗 Build Configuration
```javascript
// webpack.config.js
module.exports = {
  entry: {
    content: './src/inject/script.ts',
    background: './src/background/background.js'
  },
  output: {
    path: '../dist-extension'
  }
}
```

## 📦 Output Structure
dist-extension/
├── content.js      # Compiled script.ts
├── background.js   # Extension background script
└── manifest.json   # Extension manifest 