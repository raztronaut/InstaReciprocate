import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import UnfollowService from '@/services/UnfollowService';
import { useStore } from '@/store/useStore';

export const useUnfollow = () => {
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const { selectedUsers, removeFromFollowing } = useStore();

  const handleUnfollowProgress = useCallback((completed: number, total: number) => {
    setProgress({ completed, total });
    if (completed === total) {
      toast.success(`Successfully unfollowed ${completed} users`);
      setIsUnfollowing(false);
    }
  }, []);

  const unfollowSelected = useCallback(async () => {
    if (selectedUsers.size === 0) {
      toast.error('No users selected');
      return;
    }

    const userIds = Array.from(selectedUsers);
    setIsUnfollowing(true);
    setProgress({ completed: 0, total: userIds.length });

    try {
      const service = UnfollowService.getInstance();
      await service.unfollowBatch(userIds, handleUnfollowProgress);
      
      // Update store after successful unfollows
      userIds.forEach(userId => removeFromFollowing(userId));
    } catch (error) {
      console.error('Unfollow error:', error);
      toast.error('Failed to unfollow some users');
    } finally {
      setIsUnfollowing(false);
    }
  }, [selectedUsers, removeFromFollowing, handleUnfollowProgress]);

  const cancelUnfollow = useCallback(() => {
    const service = UnfollowService.getInstance();
    service.stopProcessing();
    setIsUnfollowing(false);
    toast.info('Unfollow process cancelled');
  }, []);

  return {
    isUnfollowing,
    progress,
    unfollowSelected,
    cancelUnfollow,
  };
}; 