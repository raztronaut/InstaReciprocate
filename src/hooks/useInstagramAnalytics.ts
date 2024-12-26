import { useCallback, useEffect } from 'react';
import { InstagramService } from '@/services/instagram';
import { useStore } from '@/store/useStore';
import { getInstagramAuth } from '@/lib/utils/auth';
import { UserNode } from '@/types/auth';

export const useInstagramAnalytics = () => {
  const {
    following,
    followers,
    whitelistedUsers,
    scanProgress,
    isPaused,
    isScanning,
    setFollowing,
    setFollowers,
    setScanProgress,
    setPaused,
    setScanning,
    setError,
    addToWhitelist,
    removeFromWhitelist,
  } = useStore();

  const instagramService = new InstagramService();

  const fetchAllUsers = useCallback(async (
    fetchFn: (userId: string, after?: string) => Promise<{ users: UserNode[]; pageInfo: { hasNext: boolean; endCursor: string | null } }>,
    userId: string
  ) => {
    const allUsers: UserNode[] = [];
    let hasNext = true;
    let after: string | undefined;

    while (hasNext && !isPaused) {
      try {
        const response = await fetchFn(userId, after);
        allUsers.push(...response.users);
        hasNext = response.pageInfo.hasNext;
        after = response.pageInfo.endCursor || undefined;
        
        // Update progress based on batch size
        setScanProgress((allUsers.length / (following.length || 1)) * 100);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
          setPaused(true);
          return allUsers;
        }
      }
    }

    return allUsers;
  }, [following.length, isPaused, setError, setPaused, setScanProgress]);

  const startAnalysis = useCallback(async () => {
    const auth = getInstagramAuth();
    if (!auth) {
      setError('Not authenticated');
      return;
    }

    setScanning(true);
    setScanProgress(0);
    setError(null);

    try {
      const followingUsers = await fetchAllUsers(
        instagramService.getFollowing.bind(instagramService),
        auth.ds_user_id
      );
      setFollowing(followingUsers);

      const followerUsers = await fetchAllUsers(
        instagramService.getFollowers.bind(instagramService),
        auth.ds_user_id
      );
      setFollowers(followerUsers);

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setScanning(false);
      setScanProgress(100);
    }
  }, [fetchAllUsers, instagramService, setError, setFollowers, setFollowing, setScanning, setScanProgress]);

  const pauseAnalysis = useCallback(() => {
    setPaused(true);
    instagramService.pause();
  }, [instagramService, setPaused]);

  const resumeAnalysis = useCallback(() => {
    setPaused(false);
    instagramService.resume();
  }, [instagramService, setPaused]);

  const getNonFollowers = useCallback(() => {
    const followingSet = new Set(following.map(user => user.id));
    const followerSet = new Set(followers.map(user => user.id));

    return following.filter(user => 
      !followerSet.has(user.id) && !whitelistedUsers.has(user.id)
    );
  }, [following, followers, whitelistedUsers]);

  const getMutualFollowers = useCallback(() => {
    const followerSet = new Set(followers.map(user => user.id));
    return following.filter(user => followerSet.has(user.id));
  }, [following, followers]);

  return {
    following,
    followers,
    whitelistedUsers,
    scanProgress,
    isPaused,
    isScanning,
    startAnalysis,
    pauseAnalysis,
    resumeAnalysis,
    getNonFollowers,
    getMutualFollowers,
    addToWhitelist,
    removeFromWhitelist,
  };
}; 