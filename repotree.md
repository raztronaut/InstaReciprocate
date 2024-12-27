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
private onboardingState: {
  currentStep: number
  totalSteps: number
  hasCompleted: boolean
} = {
  currentStep: 1,
  totalSteps: 3,
  hasCompleted: false
}
private onboardingContainer: HTMLDivElement | null = null
```

#### Constants
```typescript
const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'insta-reciprocate-onboarding-completed',
  WHITELISTED_USERS: 'instagram-analytics-whitelisted-users'
}
```

#### Constructor
```typescript
constructor()
- Initializes whitelistedUsers as empty Set
- Checks if onboarding is completed from localStorage
- Sets up CustomEvent listener for whitelist updates
- Sets up window unload event listener for cleanup
- Initializes whitelisted users asynchronously
```

#### Private Methods

##### UI Related
```typescript
private createUI(): void
- Creates modal container with blur backdrop
- Initializes UI components based on onboarding state
- Sets up animations and styles
- Handles keyboard shortcuts
- Manages backdrop and container lifecycle

private createOnboarding(): HTMLDivElement
- Creates multi-step onboarding interface
- Implements step navigation
- Handles animations and transitions
- Manages onboarding content and icons
- Returns onboarding container element

private updateOnboarding(): void
- Updates onboarding UI when step changes
- Handles smooth transitions between steps
- Manages onboarding container replacement

private completeOnboarding(): void
- Marks onboarding as completed in localStorage
- Updates onboarding state
- Transitions to main UI

private initializeMainUI(): void
- Creates main application interface
- Sets up header, buttons, and containers
- Initializes analysis functionality
- Called after onboarding completion

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

private updateCheckboxState(checkbox: HTMLDivElement, username: string): void
- Updates visual state of a single checkbox
- Handles checkbox border and background color
- Updates checkbox content (checkmark SVG)
- Optimizes performance by avoiding full UI rebuild

private updateActionButtonsState(): void
- Updates state of action buttons container
- Handles Select All/Deselect All button text and styling
- Updates disabled state of action buttons
- Optimizes performance by targeting only necessary elements

private createUserItem(username: string): HTMLDivElement
- Creates user list item with:
  - Profile picture with fallback
  - Username with link
  - Full name if available
  - Action buttons based on tab
  - Whitelist toggle when applicable
  - Selection checkbox with optimized state updates
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
private async fetchUserData(username: string): Promise<UserData | null>
- Fetches user profile data from Instagram API
- Returns user ID, username, full name, and profile picture URL
- Handles API errors and rate limiting
- Returns null if fetch fails

private async initializeWhitelistedUsers(): Promise<void>
- Loads whitelisted users from storage
- Updates whitelistedUsers Set
- Updates UI with loaded data
- Handles initialization errors

private async updateUserData(username: string): Promise<void>
- Updates user data in userMap if missing or incomplete
- Fetches fresh data from Instagram API
- Updates UI when new data is available
- Handles API errors gracefully

private loadWhitelistedUsers(): Set<string>
- Loads whitelisted usernames from localStorage
- Validates stored data format
- Creates placeholder data for each user
- Triggers async user data fetch
- Returns Set of whitelisted usernames
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