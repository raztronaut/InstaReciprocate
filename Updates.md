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