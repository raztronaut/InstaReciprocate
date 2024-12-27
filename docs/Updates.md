# Updates

## 2024-03-XX - Unfollow Functionality Implementation

### Added
- `UnfollowService`: Rate-limited unfollow API (4s base delay, 5-min pause/5 unfollows)
- `useUnfollow`: Hook for managing unfollow state and batch operations
- `UnfollowButton`: UI component with progress tracking
- Selection system in UserCard component
- Batch selection controls in main UI

### Modified
- `useStore`: Added selection and unfollow state management
- `UserCard`: Added selection checkbox
- `page.tsx`: Added unfollow UI and batch controls

### Dependencies
- Added `sonner` for toast notifications 

## 2024-03-19
- Renamed app from "Instagram Analytics" to "InstaReciprocate"
  - Updated manifest.json
  - Updated package.json
  - Updated storage keys
  - Updated DOM element IDs
  - Updated build configuration files
  - Updated script references 

## [2024-03-27]
- Created feature branch `feature/improve-search-functionality` to enhance search capabilities within the extension 