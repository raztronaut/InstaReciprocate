<p align="center"><img width="128" alt="InstaReciprocate Logo" src="src/assets/icons/icon128.png"></p>

<h2 align="center">InstaReciprocate</h2>
<br/>
<p align="center">InstaReciprocate is a <strong>powerful</strong> MIT-licensed <strong>browser extension</strong> designed to analyze Instagram relationships. It provides <strong>advanced insights</strong> into your following/followers with built-in <strong>safety features</strong> and a privacy-first approach.</p>
<br/>
<p align="center"><a rel="noreferrer noopener" href="https://chrome.google.com/webstore/detail/instareciprocate"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a></p>
<br/>

## Chrome Web Store Installation

1. Visit the [InstaReciprocate Chrome Web Store page](https://chromewebstore.google.com/detail/InstaReciprocate/mnboeolamdcoiblgmlihanjklobhdbdf?hl=en&authuser=0)
2. Click the "Add to Chrome" button
3. Click "Add extension" in the confirmation popup
4. The extension icon will appear in your Chrome toolbar

## Features

- Safe and rate-limited Instagram data fetching
- Analysis of non-mutual follows
- Whitelist system to protect important follows
- Search and filtering capabilities
- Responsive and modern UI

## Privacy & Security
- Zero external storage: All data stays in your browser
- Local whitelist: Saved only in your browser's localStorage
- No tracking: Zero usage monitoring
- Fresh sessions: Data cleared on extension close
- Rate limiting: Safe API usage with automatic pausing

## Project Structure
```
src/
├── assets/         # Extension assets
├── background/     # Extension initialization
├── inject/         # Core functionality
│   └── script.ts   # Main application logic
└── manifest.json   # Extension manifest
```

## Required Permissions

InstaReciprocate needs the following permissions to function:

| Permission | Purpose |
|------------|---------|
| `activeTab` | Required for Instagram interaction |
| `scripting` | Needed for automation script |
| `storage` | Required for storing whitelist and settings | 

## Usage

1. Log in to Instagram in your browser
2. Click the extension icon in your Chrome toolbar
3. Click "Start Analysis" to begin scanning
4. Use the tabs to view different relationship categories:
   - Non-Followers: Users you follow who don't follow you back
   - Mutual: Users who follow each other
   - All Following: Complete list of users you follow
5. Use the search bar to filter users by username or full name
6. Add important accounts to your whitelist to protect them

## Safety Features

- Intelligent rate limiting with random delays
- Automatic pause on rate limit detection
- Progress tracking and resumable operations
- Whitelist system for protecting important accounts

### Rate Limits
To ensure safe usage of Instagram's API:
- Random delays between actions (1-3 seconds)
- Maximum 200 actions per hour
- Automatic cooldown if rate limit is reached
- Smart retry mechanism
- Visual progress indicators
- Automatic pause when approaching limits

## For Developers

### Prerequisites
- Node.js 18+
- npm 8+

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/raztronaut/instareciprocate.git
cd instareciprocate
```

2. Install dependencies:
```bash
npm install
```

3. Available build commands:
```bash
# Development build with watch mode (for active development)
npm run dev

# Production build for local testing
npm run build:prod

# Additional commands
npm run build:analyze  # Analyze bundle size
npm run validate      # Run type checking and linting
npm run format        # Format code with Prettier
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist-extension` folder

### Build Output
The build process creates a `dist-extension` folder with:
- `manifest.json`: Extension configuration
- `background.js`: Service worker script
- `content.js`: Main content script
- `assets/`: Icons and other resources

### Code Quality Tools
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Webpack for bundling and optimization

### Build Modes
1. **Development (`npm run dev`)**:
   - Watch mode for automatic rebuilds
   - Source maps for debugging
   - Faster builds with development optimizations

2. **Production (`npm run build:prod`)**:
   - Optimized and minified code
   - No source maps
   - Full type checking and validation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Documentation

- [Privacy Policy](docs/PRIVACY.md)
- [Terms of Service](docs/TERMS.md)
- [Changelog](docs/CHANGELOG.md)

## License

MIT License - see [LICENSE](LICENSE) file for details 

