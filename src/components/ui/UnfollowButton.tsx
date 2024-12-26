import { useUnfollow } from '@/hooks/useUnfollow';

export const UnfollowButton = () => {
  const { isUnfollowing, progress, unfollowSelected, cancelUnfollow } = useUnfollow();

  return (
    <div className="flex items-center gap-4">
      {isUnfollowing ? (
        <>
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <span className="text-sm text-gray-600">
              Unfollowing {progress.completed}/{progress.total}
            </span>
          </div>
          <button
            onClick={cancelUnfollow}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={unfollowSelected}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Unfollow Selected
        </button>
      )}
    </div>
  );
}; 