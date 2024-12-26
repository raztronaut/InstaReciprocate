// Storage keys
export const WHITELISTED_USERS_KEY = 'instagram-analytics-whitelisted-users';
export const LAST_ANALYSIS_KEY = 'instagram-analytics-last-analysis';
export const FOLLOWING_KEY = 'instagram-analytics-following';
export const FOLLOWERS_KEY = 'instagram-analytics-followers';

export const loadWhitelistedUsers = (): Set<string> => {
  try {
    const stored = localStorage.getItem(WHITELISTED_USERS_KEY);
    if (!stored) return new Set<string>();
    return new Set(JSON.parse(stored));
  } catch (error) {
    console.error('Error loading whitelisted users:', error);
    return new Set<string>();
  }
};

export const saveWhitelistedUsers = (users: Set<string>): void => {
  try {
    localStorage.setItem(WHITELISTED_USERS_KEY, JSON.stringify(Array.from(users)));
    // Dispatch a custom event to notify other parts of the app
    window.dispatchEvent(new CustomEvent('whitelistUpdated', {
      detail: { users: Array.from(users) }
    }));
  } catch (error) {
    console.error('Error saving whitelisted users:', error);
  }
};

export const loadLastAnalysis = (): Date | null => {
  try {
    const stored = localStorage.getItem(LAST_ANALYSIS_KEY);
    if (!stored) return null;
    return new Date(JSON.parse(stored));
  } catch (error) {
    console.error('Error loading last analysis:', error);
    return null;
  }
};

export const saveLastAnalysis = (date: Date): void => {
  try {
    localStorage.setItem(LAST_ANALYSIS_KEY, JSON.stringify(date.toISOString()));
  } catch (error) {
    console.error('Error saving last analysis:', error);
  }
}; 