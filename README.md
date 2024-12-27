# <img src="icons/logo.png" alt="InstaReciprocate Logo" width="32" height="32" style="vertical-align: middle"> InstaReciprocate

A powerful tool to analyze your Instagram following/followers relationships with advanced insights and safety features.

## Chrome Web Store Installation

1. Visit the [InstaReciprocate Chrome Web Store page](https://chrome.google.com/webstore/detail/instareciprocate)
2. Click the "Add to Chrome" button
3. Click "Add extension" in the confirmation popup
4. The extension icon will appear in your Chrome toolbar

## Features

- Safe and rate-limited Instagram data fetching
- Analysis of non-mutual follows
- Whitelist system to protect important follows
- Real-time progress tracking
- Search and filtering capabilities
- Responsive and modern UI

## Privacy & Security

We take a radical approach to privacy:
- Zero external storage: We don't store anything on servers
- Local whitelist: Your whitelisted users are saved in your browser's localStorage only
- No tracking: We don't monitor or analyze your usage
- Fresh sessions: All analysis data is cleared when you close the extension
- For complete details, see our [Privacy Policy](PRIVACY.md)

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
- Whitelist system for protecting important follows

### Rate Limits
To ensure safe and responsible usage of Instagram's API:
- Random delays between requests (1-3 seconds)
- Maximum 200 requests per hour
- Automatic 1-hour cooldown if rate limit is reached
- Smart retry mechanism with exponential backoff
- Visual indicators for rate limit status
- Automatic session pause when approaching limits

## For Developers

### Prerequisites

- Node.js 18+ installed
- Instagram account cookies (ds_user_id and csrftoken)

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd instagram-analytics
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

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

## Permissions
InstaReciprocate requires the following permissions:

| Permission | Purpose |
|------------|---------|
| `activeTab` | Required for analyzing the current Instagram tab |
| `scripting` | Needed for injecting analysis script |
| `storage` | Required for storing whitelist and preferences | 

## License

MIT License - see [LICENSE](LICENSE) file for details 

