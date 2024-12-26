# InstaReciprocate

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

- All data is processed locally in your browser
- No data is transmitted to external servers
- Your Instagram credentials are never stored
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

## License

MIT License - see [LICENSE](LICENSE) file for details 