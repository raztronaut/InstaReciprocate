# Instagram Analytics Tool

A powerful tool to analyze your Instagram following/followers relationships with advanced insights and safety features.

## Features

- Safe and rate-limited Instagram data fetching
- Analysis of non-mutual follows
- Whitelist system to protect important follows
- Real-time progress tracking
- Search and filtering capabilities
- Responsive and modern UI

## Prerequisites

- Node.js 18+ installed
- Instagram account cookies (ds_user_id and csrftoken)

## Installation

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

## Usage

1. Log in to Instagram in your browser
2. Navigate to the tool's URL (default: http://localhost:3000)
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

## Development

- Built with Next.js 14
- TypeScript for type safety
- TailwindCSS for styling
- Zustand for state management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details 