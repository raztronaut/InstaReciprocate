# Map of InstaReciprocate script.ts.

## 📁 src/inject/script.ts

### 🔷 Class: InstaReciprocate
Main class that handles the Instagram unfollower analysis functionality.

#### Properties
```typescript
private container: HTMLDivElement | null = null
private startButton: HTMLButtonElement | null = null
private progress: HTMLDivElement | null = null
private results: HTMLDivElement | null = null
private searchInput: HTMLInputElement | null = null
private searchQuery: string = ''
private searchDebounceTimeout: number | null = null
private isAnalyzing: boolean = false
private isUnfollowing: boolean = false
private unfollowCount: number = 0
private lastUnfollowTime: number = 0
private lastAnalyzed: Date | null = null
private service: any = null
private whitelistedUsers: Set<string>
private selectedUsers: Set<string> = new Set()
private activeTab: 'non-followers' | 'whitelist' | 'unfollowed' = 'non-followers'
private userMap: Map<string, {
  id: string
  username: string
  fullName: string
  profilePicUrl: string
}> = new Map()
private allUsers: string[] = []
private unfollowedUsers: Set<string> = new Set()
```

#### Constructor
```typescript
constructor()
- Initializes whitelistedUsers from localStorage
- Sets up CustomEvent listener for whitelist updates
- Sets up window unload event listener for cleanup
- Binds cleanup method to unload event
```

#### Private Methods

##### UI Related
```typescript
private createUI(): void
- Creates modal container with blur backdrop
- Initializes UI components:
  - Header with logo and close button
  - Start analysis button with gradient
  - Progress indicator
  - Results container
- Sets up event handlers:
  - ESC key for modal closing
  - Button hover effects
  - Close button functionality
  - Error handling for images
  - Backdrop click handling

private createLoadingSpinner(): string
- Returns HTML string for loading spinner animation
- Includes CSS animation for rotation
- Used during analysis and loading states

private createSearchInput(): string
- Creates search input field with styling
- Includes search icon SVG
- Adds placeholder and focus styles
- Returns complete search component HTML

private initializeSearchInput(): void
- Finds search input in DOM
- Sets up input event listeners
- Implements focus/blur styling
- Initializes search state

private createTabs(): HTMLDivElement
- Creates tab navigation system
- Implements tab switching logic
- Handles active tab styling
- Shows count badges for each tab
- Returns complete tab container

private createUserItem(username: string): HTMLDivElement
- Creates user list item with:
  - Profile picture with fallback
  - Username with link
  - Full name if available
  - Action buttons based on tab
  - Whitelist toggle when applicable
  - Selection checkbox when needed
- Handles all user interactions

private createActionButtons(): HTMLDivElement
- Creates batch operation buttons:
  - Select/Deselect All
  - Whitelist Selected (in non-followers tab)
  - Unfollow Selected (in non-followers tab)
  - Remove from Whitelist (in whitelist tab)
- Handles button states and interactions
```

##### State Management
```typescript
private cleanup(): void
- Cleans up event listeners
- Clears debounce timeouts
- Removes DOM elements
- Called on window unload and before new analysis

private updateResults(): void
- Updates UI based on current state
- Manages tab navigation
- Updates search functionality
- Refreshes user list
- Updates action buttons
- Implements custom scrollbar

private switchTab(tab: 'non-followers' | 'whitelist' | 'unfollowed'): void
- Switches active tab
- Clears selected users
- Updates UI components
- Implements smooth scroll to top
- Updates filtered results

private handleSearchInput(event: Event): void
- Handles search input changes
- Implements 300ms debounce
- Updates search query
- Triggers results update
```

##### Data Management
```typescript
private loadWhitelistedUsers(): Set<string>
- Loads whitelist from localStorage
- Handles JSON parsing
- Implements error handling
- Returns whitelist Set

private saveWhitelistedUsers(): void
- Saves whitelist to localStorage
- Dispatches whitelistUpdated event
- Handles storage errors

private toggleWhitelist(username: string): void
- Toggles user whitelist status
- Updates UI elements
- Saves changes to storage
- Updates button states

private getFilteredUsers(): string[]
- Filters users based on search query
- Handles case-insensitive search
- Searches username and full name
- Returns filtered array

private getActiveTabUsers(): string[]
- Returns users based on active tab
- Filters for whitelist status
- Handles unfollowed users
- Returns appropriate user list
```

##### Analysis & Operations
```typescript
private async initService(): Promise<void>
- Checks for existing service
- Extracts authentication from cookies:
  - User ID
  - CSRF token
- Configures Instagram GraphQL endpoints:
  - Following: query_hash=3dec7e2c57367ef3da3d987d89f9dbc8
  - Followers: query_hash=5aefa9893005572d237da5068082d8d5
- Sets up request headers:
  - content-type: application/json
  - x-csrftoken
  - x-ig-app-id: 936619743392459

private async analyze(): Promise<void>
- Validates analysis state
- Updates UI for analysis start
- Fetches following/followers with pagination
- Implements rate limiting (2s between requests)
- Updates progress UI in real-time
- Calculates statistics
- Creates results UI with stats cards
- Handles error states
- Sets up re-analyze functionality

private async unfollowUser(userId: string): Promise<boolean>
- Implements rate limiting:
  - Base delay: 4000ms
  - Random delay: 100-120% of base delay
  - 5-minute pause after every 5 unfollows
- Validates CSRF token
- Makes POST request to Instagram API
- Updates unfollowCount and lastUnfollowTime
- Returns success/failure status

private async unfollowSelected(): Promise<void>
- Shows progress indicator
- Implements batch unfollow
- Handles cancellation
- Updates UI after operations
- Manages selected users state
```

##### Helper Methods
```typescript
private formatNumber(num: number): string
- Formats numbers with locale-specific formatting
- Used for UI number display

private calculatePercentage(part: number, total: number): number
- Calculates percentage for statistics
- Used in results display
```

#### Public Methods
```typescript
public init(): void
- Entry point for application
- Creates initial UI
- Sets up error handling
```

### 🔷 Service Interface
```typescript
interface InstagramService {
  getFollowing(userId: string, after?: string): Promise<{
    users: Array<{
      id: string
      username: string
      full_name: string
      profile_pic_url: string
    }>
    pageInfo: {
      has_next_page: boolean
      end_cursor: string
    }
  }>

  getFollowers(userId: string, after?: string): Promise<{
    users: Array<{
      id: string
      username: string
      full_name: string
      profile_pic_url: string
    }>
    pageInfo: {
      has_next_page: boolean
      end_cursor: string
    }
  }>
}
``` 