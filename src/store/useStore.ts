import { create } from 'zustand';
import { UserNode } from '@/types/auth';
import { loadWhitelistedUsers, saveWhitelistedUsers } from '@/lib/utils/storage';

interface AnalyticsState {
  following: UserNode[];
  followers: UserNode[];
  whitelistedUsers: Set<string>;
  selectedUsers: Set<string>;
  scanProgress: number;
  isPaused: boolean;
  isScanning: boolean;
  error: string | null;
  activeTab: 'non-followers' | 'whitelist';
  
  // Actions
  setFollowing: (users: UserNode[]) => void;
  setFollowers: (users: UserNode[]) => void;
  addToWhitelist: (userId: string) => void;
  removeFromWhitelist: (userId: string) => void;
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: (userIds: string[]) => void;
  clearSelection: () => void;
  removeFromFollowing: (userId: string) => void;
  setScanProgress: (progress: number) => void;
  setPaused: (paused: boolean) => void;
  setScanning: (scanning: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: 'non-followers' | 'whitelist') => void;
  syncWhitelist: (users: Set<string>) => void;
  reset: () => void;
}

const initialState = {
  following: [],
  followers: [],
  whitelistedUsers: loadWhitelistedUsers(),
  selectedUsers: new Set<string>(),
  scanProgress: 0,
  isPaused: false,
  isScanning: false,
  error: null,
  activeTab: 'non-followers' as const,
};

export const useStore = create<AnalyticsState>((set) => ({
  ...initialState,

  setFollowing: (users) => set({ following: users }),
  
  setFollowers: (users) => set({ followers: users }),
  
  addToWhitelist: (userId) => 
    set((state) => {
      const newWhitelist = new Set([...state.whitelistedUsers, userId]);
      saveWhitelistedUsers(newWhitelist);
      return { whitelistedUsers: newWhitelist };
    }),
  
  removeFromWhitelist: (userId) =>
    set((state) => {
      const newWhitelist = new Set(state.whitelistedUsers);
      newWhitelist.delete(userId);
      saveWhitelistedUsers(newWhitelist);
      return { whitelistedUsers: newWhitelist };
    }),

  toggleUserSelection: (userId) =>
    set((state) => {
      const newSelection = new Set(state.selectedUsers);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return { selectedUsers: newSelection };
    }),

  selectAllUsers: (userIds) =>
    set((state) => ({
      selectedUsers: new Set(userIds),
    })),

  clearSelection: () =>
    set({ selectedUsers: new Set() }),

  removeFromFollowing: (userId) =>
    set((state) => ({
      following: state.following.filter(user => user.id !== userId),
      selectedUsers: new Set(
        Array.from(state.selectedUsers).filter(id => id !== userId)
      ),
    })),
  
  setScanProgress: (progress) => set({ scanProgress: progress }),
  
  setPaused: (paused) => set({ isPaused: paused }),
  
  setScanning: (scanning) => set({ isScanning: scanning }),
  
  setError: (error) => set({ error }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  syncWhitelist: (users) => set({ whitelistedUsers: users }),
  
  reset: () => set(initialState),
})); 