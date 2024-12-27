<p align="center"><img width="128" alt="InstaReciprocate Logo" src="src/assets/icons/icon128.png"></p>

<h2 align="center">InstaReciprocate</h2>
<br/>
<p align="center">InstaReciprocate is a <strong>powerful</strong> MIT-licensed <strong>browser extension</strong> designed to analyze Instagram relationships. It provides <strong>advanced insights</strong> into your following/followers with built-in <strong>safety features</strong> and a privacy-first approach.</p>
<br/>
<p align="center"><a rel="noreferrer noopener" href="https://chrome.google.com/webstore/detail/instareciprocate"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a></p>
<br/>

## Chrome Web Store Installation

1. Visit the [InstaReciprocate Chrome Web Store page](https://chrome.google.com/webstore/detail/instareciprocate)
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

We take a radical approach to privacy:
- Zero external storage: We don't store anything on servers
- Local whitelist: Your whitelisted users are saved in your browser's localStorage only
- No tracking: We don't monitor or analyze your usage
- Fresh sessions: All data is cleared when you close the extension
- For complete details, see our [Privacy Policy](PRIVACY.md)

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

- Node.js 18+ installed

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

3. Build the extension:
```bash
npm run build:inject
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist-extension` folder

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Documentation

- [Privacy Policy](PRIVACY.md)
- [Terms of Service](TERMS.md)
- [Changelog](CHANGELOG.md)

## License

MIT License - see [LICENSE](LICENSE) file for details 

