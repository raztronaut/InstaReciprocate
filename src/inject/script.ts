const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'insta-reciprocate-onboarding-completed',
  WHITELISTED_USERS: 'instagram-analytics-whitelisted-users'
};

class InstaReciprocate {
  private container: HTMLDivElement | null = null;
  private startButton: HTMLButtonElement | null = null;
  private progress: HTMLDivElement | null = null;
  private results: HTMLDivElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private searchQuery: string = '';
  private searchDebounceTimeout: number | null = null;
  private isAnalyzing: boolean = false;
  private isUnfollowing: boolean = false;
  private unfollowCount: number = 0;
  private lastUnfollowTime: number = 0;
  private lastAnalyzed: Date | null = null;
  private service: any = null;
  private whitelistedUsers: Set<string>;
  private selectedUsers: Set<string> = new Set();
  private activeTab: 'non-followers' | 'whitelist' | 'unfollowed' = 'non-followers';
  private userMap: Map<string, {
    id: string;
    username: string;
    fullName: string;
    profilePicUrl: string;
  }> = new Map();
  private allUsers: string[] = [];
  private unfollowedUsers: Set<string> = new Set();
  private onboardingState: {
    currentStep: number;
    totalSteps: number;
    hasCompleted: boolean;
  } = {
    currentStep: 1,
    totalSteps: 3,
    hasCompleted: false
  };
  private onboardingContainer: HTMLDivElement | null = null;

  constructor() {
    this.whitelistedUsers = this.loadWhitelistedUsers();
    // Check if onboarding is completed
    this.onboardingState.hasCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
    
    // Listen for whitelist updates from other parts of the app
    window.addEventListener('whitelistUpdated', ((event: CustomEvent) => {
      this.whitelistedUsers = new Set(event.detail.users);
      this.updateResults();
    }) as EventListener);

    // Add cleanup on window unload
    window.addEventListener('unload', this.cleanup.bind(this));
  }

  private cleanup(): void {
    // Clear any existing debounce timeout
    if (this.searchDebounceTimeout !== null) {
      window.clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = null;
    }

    // Remove existing event listeners from search input
    if (this.searchInput && document.contains(this.searchInput)) {
      this.searchInput.removeEventListener('input', this.handleSearchInput.bind(this));
    }
  }

  private loadWhitelistedUsers(): Set<string> {
    try {
      const stored = localStorage.getItem('instagram-analytics-whitelisted-users');
      if (!stored) return new Set<string>();
      return new Set(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading whitelisted users:', error);
      return new Set<string>();
    }
  }

  private saveWhitelistedUsers(): void {
    try {
      localStorage.setItem(
        'instagram-analytics-whitelisted-users',
        JSON.stringify(Array.from(this.whitelistedUsers))
      );
      // Dispatch event to notify other parts of the app
      window.dispatchEvent(new CustomEvent('whitelistUpdated', {
        detail: { users: Array.from(this.whitelistedUsers) }
      }));
    } catch (error) {
      console.error('Error saving whitelisted users:', error);
    }
  }

  private toggleWhitelist(username: string): void {
    if (this.whitelistedUsers.has(username)) {
      this.whitelistedUsers.delete(username);
    } else {
      this.whitelistedUsers.add(username);
    }
    this.saveWhitelistedUsers();
    this.updateResults();
  }

  private createUserItem(username: string): HTMLDivElement {
    const item = document.createElement('div');
    item.className = 'user-item';
    item.dataset.username = username;
    item.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      margin: 4px 0;
      transition: all 0.2s ease;
      background-color: transparent;
      border: 1px solid #e5e7eb;
    `;

    const leftSection = document.createElement('div');
    leftSection.style.cssText = 'display: flex; align-items: center; flex-grow: 1;';

    // Add checkbox for selection (in non-followers and whitelist tabs)
    if (this.activeTab === 'non-followers' || this.activeTab === 'whitelist') {
      const checkbox = document.createElement('div');
      checkbox.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin-right: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border: 1.5px solid ${this.selectedUsers.has(username) ? '#3b82f6' : '#d1d5db'};
        background-color: ${this.selectedUsers.has(username) ? '#3b82f6' : 'transparent'};
      `;
      
      checkbox.onclick = (e) => {
        e.stopPropagation();
        if (this.selectedUsers.has(username)) {
          this.selectedUsers.delete(username);
        } else {
          this.selectedUsers.add(username);
        }
        this.updateResults();
      };

      if (this.selectedUsers.has(username)) {
        checkbox.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="1.5">
            <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      }

      leftSection.appendChild(checkbox);
    }

    // Create profile image container
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
      width: 44px;
      height: 44px;
      border-radius: 50%;
      margin-right: 12px;
      background-color: #f3f4f6;
      overflow: hidden;
      flex-shrink: 0;
    `;

    // Create profile image
    const img = document.createElement('img');
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    img.alt = `@${username}`;
    const userData = this.userMap.get(username);
    img.src = userData?.profilePicUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    img.onerror = () => {
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    };

    imgContainer.appendChild(img);
    leftSection.appendChild(imgContainer);

    // Create username and full name container
    const userInfoContainer = document.createElement('div');
    userInfoContainer.style.cssText = 'flex-grow: 1; min-width: 0;';
    
    const usernameText = document.createElement('a');
    usernameText.href = `https://instagram.com/${username}`;
    usernameText.target = '_blank';
    usernameText.rel = 'noopener noreferrer';
    usernameText.style.cssText = `
      font-weight: 600;
      color: #262626;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
    `;
    usernameText.textContent = username;
    usernameText.onmouseover = () => {
      usernameText.style.textDecoration = 'underline';
    };
    usernameText.onmouseout = () => {
      usernameText.style.textDecoration = 'none';
    };

    const fullNameText = document.createElement('div');
    fullNameText.style.cssText = 'color: #737373; font-size: 14px; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;';
    if (userData?.fullName) {
      fullNameText.textContent = userData.fullName;
      userInfoContainer.appendChild(usernameText);
      userInfoContainer.appendChild(fullNameText);
    } else {
      usernameText.style.marginTop = '4px';
      userInfoContainer.appendChild(usernameText);
    }
    
    leftSection.appendChild(userInfoContainer);

    // Create action button
    const actionButton = document.createElement('button');
    actionButton.style.cssText = `
      background: none;
      border: 1px solid #dbdbdb;
      padding: 7px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    `;

    if (this.activeTab === 'unfollowed') {
      actionButton.textContent = 'Follow';
      actionButton.style.color = 'white';
      actionButton.style.background = '#0095f6';
      actionButton.style.border = 'none';
      
      actionButton.onmouseover = () => {
        actionButton.style.background = '#1aa1f7';
      };
      
      actionButton.onmouseout = () => {
        actionButton.style.background = '#0095f6';
      };
      
      actionButton.onclick = async (e) => {
        e.stopPropagation();
        // TODO: Implement follow functionality
        this.unfollowedUsers.delete(username);
        this.updateResults();
      };
    } else if (this.activeTab === 'whitelist') {
      // Don't create action button for whitelist tab
    } else {
      actionButton.textContent = 'Following';
      actionButton.style.color = '#262626';
      
      actionButton.onmouseover = () => {
        actionButton.textContent = 'Unfollow';
        actionButton.style.borderColor = '#ef4444';
        actionButton.style.color = '#ef4444';
      };
      
      actionButton.onmouseout = () => {
        actionButton.textContent = 'Following';
        actionButton.style.borderColor = '#dbdbdb';
        actionButton.style.color = '#262626';
      };
      
      actionButton.onclick = async (e) => {
        e.stopPropagation();
        const userData = this.userMap.get(username);
        if (userData) {
          actionButton.disabled = true;
          actionButton.style.opacity = '0.5';
          const success = await this.unfollowUser(userData.id);
          if (success) {
            this.unfollowedUsers.add(username);
            this.updateResults();
          }
          actionButton.disabled = false;
          actionButton.style.opacity = '1';
        }
      };
    }

    item.appendChild(leftSection);

    // Create button container for action and whitelist buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
    `;

    // Only add action button if not in whitelist tab
    if (this.activeTab !== 'whitelist') {
      buttonContainer.appendChild(actionButton);
    }

    // Create whitelist button only if not in unfollowed or whitelist tab
    if (this.activeTab !== 'unfollowed' && this.activeTab !== 'whitelist') {
      // Create whitelist button
      const whitelistButton = document.createElement('button');
      whitelistButton.style.cssText = `
        background: none;
        border: 1px solid ${this.whitelistedUsers.has(username) ? '#16a34a' : '#dbdbdb'};
        padding: 7px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const heartHandsIcon = document.createElement('img');
      heartHandsIcon.src = chrome.runtime.getURL('assets/icons/HeartHandsEmoji.png');
      heartHandsIcon.alt = 'Whitelist';
      heartHandsIcon.style.cssText = `
        width: 20px;
        height: 20px;
        object-fit: contain;
      `;

      whitelistButton.appendChild(heartHandsIcon);
      
      whitelistButton.onclick = (e) => {
        e.stopPropagation();
        this.toggleWhitelist(username);
        whitelistButton.style.borderColor = this.whitelistedUsers.has(username) ? '#16a34a' : '#dbdbdb';
      };

      whitelistButton.onmouseover = () => {
        if (!this.whitelistedUsers.has(username)) {
          whitelistButton.style.borderColor = '#16a34a';
          whitelistButton.style.backgroundColor = '#f0fdf4';
        }
      };

      whitelistButton.onmouseout = () => {
        if (!this.whitelistedUsers.has(username)) {
          whitelistButton.style.borderColor = '#dbdbdb';
          whitelistButton.style.backgroundColor = 'transparent';
        }
      };

      buttonContainer.appendChild(whitelistButton);
    }

    item.appendChild(buttonContainer);

    return item;
  }

  private createTabs(): HTMLDivElement {
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      align-items: center;
      border-bottom: 1px solid #dbdbdb;
      margin-bottom: 16px;
      gap: 40px;
      position: relative;
    `;

    const createTab = (text: string, count: number, type: 'non-followers' | 'whitelist' | 'unfollowed') => {
      const tab = document.createElement('button');
      const isActive = this.activeTab === type;
      
      tab.style.cssText = `
        padding: 16px 0;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        background: none;
        color: ${isActive ? '#262626' : '#8e8e8e'};
        position: relative;
        transition: color 0.2s ease;
        letter-spacing: 0.2px;
        text-transform: uppercase;
      `;

      // Create the tab content with count
      const tabContent = document.createElement('div');
      tabContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
      `;
      
      const tabText = document.createElement('span');
      tabText.textContent = text;
      
      const countBadge = document.createElement('span');
      countBadge.textContent = count.toLocaleString();
      countBadge.style.cssText = `
        font-weight: normal;
        color: ${isActive ? '#262626' : '#8e8e8e'};
      `;

      tabContent.appendChild(tabText);
      tabContent.appendChild(countBadge);
      tab.appendChild(tabContent);

      // Create and add the underline indicator for active tab
      if (isActive) {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: #262626;
          transition: all 0.2s ease;
        `;
        tab.appendChild(indicator);
      }

      // Add hover effects
      tab.onmouseover = () => {
        if (!isActive) {
          tab.style.color = '#262626';
          countBadge.style.color = '#262626';
        }
      };

      tab.onmouseout = () => {
        if (!isActive) {
          tab.style.color = '#8e8e8e';
          countBadge.style.color = '#8e8e8e';
        }
      };

      tab.onclick = () => this.switchTab(type);
      return tab;
    };

    const nonFollowersCount = this.allUsers.filter(user => 
      !this.whitelistedUsers.has(user) && !this.unfollowedUsers.has(user)
    ).length;

    tabsContainer.appendChild(createTab('Not Following Back', nonFollowersCount, 'non-followers'));
    tabsContainer.appendChild(createTab('Whitelist', this.whitelistedUsers.size, 'whitelist'));
    tabsContainer.appendChild(createTab('Unfollowed', this.unfollowedUsers.size, 'unfollowed'));

    return tabsContainer;
  }

  private switchTab(tab: 'non-followers' | 'whitelist' | 'unfollowed'): void {
    this.activeTab = tab;
    this.selectedUsers.clear(); // Clear selected users when switching tabs
    this.updateResults();

    // Add smooth scroll to top of results
    const userList = document.getElementById('userList');
    if (userList) {
      userList.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  private getFilteredUsers(): string[] {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.getActiveTabUsers();
    
    return this.getActiveTabUsers().filter(username => {
      const user = this.userMap.get(username);
      return username.toLowerCase().includes(query) ||
             user?.fullName?.toLowerCase().includes(query);
    });
  }

  private getActiveTabUsers(): string[] {
    switch (this.activeTab) {
      case 'whitelist':
        return this.allUsers.filter(user => this.whitelistedUsers.has(user));
      case 'unfollowed':
        return Array.from(this.unfollowedUsers);
      default: // 'non-followers'
        return this.allUsers.filter(user => 
          !this.whitelistedUsers.has(user) && 
          !this.unfollowedUsers.has(user)
        );
    }
  }

  private createSearchInput(): string {
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
      margin: 16px 0;
      position: relative;
      width: 100%;
      display: flex;
    `;

    const searchIcon = document.createElement('div');
    searchIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); z-index: 1;">
        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#8e8e8e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search users...';
    input.value = this.searchQuery;
    input.id = 'insta-reciprocate-search';
    input.style.cssText = `
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
      color: #262626;
    `;

    // Add placeholder color styles
    const style = document.createElement('style');
    style.textContent = `
      #insta-reciprocate-search::placeholder {
        color: #8e8e8e;
        opacity: 1;
      }
      #insta-reciprocate-search:-ms-input-placeholder {
        color: #8e8e8e;
      }
      #insta-reciprocate-search::-ms-input-placeholder {
        color: #8e8e8e;
      }
    `;
    document.head.appendChild(style);

    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(input);

    return searchContainer.outerHTML;
  }

  private initializeSearchInput(): void {
    // Find the search input in the DOM
    const input = document.getElementById('insta-reciprocate-search') as HTMLInputElement;
    if (!input) return;

    // Update the reference and attach event listeners
    this.searchInput = input;
    this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
    
    this.searchInput.onfocus = () => {
      this.searchInput!.style.borderColor = '#0095f6';
    };
    this.searchInput.onblur = () => {
      this.searchInput!.style.borderColor = '#dbdbdb';
    };
  }

  private handleSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;

    // Clear existing timeout
    if (this.searchDebounceTimeout !== null) {
      window.clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = null;
    }

    // Debounce the search update
    this.searchDebounceTimeout = window.setTimeout(() => {
      this.updateResults();
      this.searchDebounceTimeout = null;
    }, 300);
  }

  private updateResults(): void {
    if (!this.results) return;

    const userList = document.getElementById('userList');
    if (!userList) return;

    // Add custom scrollbar styles
    userList.style.cssText = `
      max-height: 400px; 
      overflow-y: auto; 
      background: white; 
      border-radius: 12px; 
      padding: 8px;
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    `;

    // Add webkit scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      #userList::-webkit-scrollbar {
        width: 8px;
      }
      #userList::-webkit-scrollbar-track {
        background: transparent;
      }
      #userList::-webkit-scrollbar-thumb {
        background-color: #d1d5db;
        border-radius: 20px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      #userList::-webkit-scrollbar-thumb:hover {
        background-color: #9ca3af;
      }
    `;
    document.head.appendChild(style);

    // Clear existing items
    userList.innerHTML = '';

    // Get filtered users based on search and active tab
    const filteredUsers = this.getFilteredUsers();

    // Update tabs
    let tabsContainer = document.querySelector('.tabs-container');
    if (!tabsContainer) {
      tabsContainer = document.createElement('div');
      tabsContainer.className = 'tabs-container';
      if (userList.parentElement) {
        userList.parentElement.insertBefore(tabsContainer, userList);
      }
    }
    tabsContainer.innerHTML = '';
    tabsContainer.appendChild(this.createTabs());

    // Update search input
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
      // Only create new search input if it doesn't exist
      if (!document.getElementById('insta-reciprocate-search')) {
        searchContainer.innerHTML = this.createSearchInput();
        this.initializeSearchInput();
      }
    }

    // Handle action buttons for non-followers tab
    if (this.activeTab === 'non-followers' || this.activeTab === 'whitelist') {
      let actionButtonsContainer = document.querySelector('.action-buttons-container');
      if (!actionButtonsContainer) {
        actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'action-buttons-container';
        if (userList.parentElement) {
          userList.parentElement.insertBefore(actionButtonsContainer, userList);
        }
      }
      actionButtonsContainer.innerHTML = '';
      actionButtonsContainer.appendChild(this.createActionButtons());
    } else {
      const actionButtonsContainer = document.querySelector('.action-buttons-container');
      if (actionButtonsContainer?.parentElement) {
        actionButtonsContainer.parentElement.removeChild(actionButtonsContainer);
      }
    }

    // Create and append user items
    filteredUsers.forEach(username => {
      userList.appendChild(this.createUserItem(username));
    });
  }

  private async initService() {
    if (!this.service) {
      const auth = document.cookie.match(/ds_user_id=(\d+)/);
      if (!auth) throw new Error('Not logged in');
      
      const csrftoken = document.cookie.match(/csrftoken=([^;]+)/);
      if (!csrftoken) throw new Error('No CSRF token found');

      this.service = {
        async getFollowing(userId: string, after?: string) {
          const variables = {
            id: userId,
            include_reel: false,
            fetch_mutual: false,
            first: 50,
            after,
          };

          const response = await fetch(
            `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables=${JSON.stringify(variables)}`,
            {
              headers: {
                'content-type': 'application/json',
                'x-csrftoken': csrftoken[1],
                'x-ig-app-id': '936619743392459',
              },
              credentials: 'include',
            }
          );

          if (!response.ok) throw new Error(`API error: ${response.status}`);
          const data = await response.json();
          
          if (!data?.data?.user?.edge_follow?.edges) {
            console.error('Invalid following response:', data);
            throw new Error('Invalid API response structure');
          }

          return {
            users: data.data.user.edge_follow.edges.map((e: any) => e.node),
            pageInfo: data.data.user.edge_follow.page_info,
          };
        },

        async getFollowers(userId: string, after?: string) {
          const variables = {
            id: userId,
            include_reel: false,
            fetch_mutual: false,
            first: 50,
            after,
          };

          const response = await fetch(
            `https://www.instagram.com/graphql/query/?query_hash=5aefa9893005572d237da5068082d8d5&variables=${JSON.stringify(variables)}`,
            {
              headers: {
                'content-type': 'application/json',
                'x-csrftoken': csrftoken[1],
                'x-ig-app-id': '936619743392459',
              },
              credentials: 'include',
            }
          );

          if (!response.ok) throw new Error(`API error: ${response.status}`);
          const data = await response.json();
          
          if (!data?.data?.user?.edge_followed_by?.edges) {
            console.error('Invalid followers response:', data);
            throw new Error('Invalid API response structure');
          }

          return {
            users: data.data.user.edge_followed_by.edges.map((e: any) => e.node),
            pageInfo: data.data.user.edge_followed_by.page_info,
          };
        },
      };
    }
  }

  private createUI() {
    // Create backdrop with blur
    const backdrop = document.createElement('div');
    backdrop.className = 'insta-reciprocate-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9998;
      backdrop-filter: blur(8px);
    `;

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'insta-reciprocate-root';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 560px;
      max-height: 90vh;
      background: white;
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
      z-index: 9999;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow-y: auto;
      border: 1px solid rgba(0, 0, 0, 0.1);
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    `;

    // Add webkit scrollbar styles and animations
    const style = document.createElement('style');
    style.textContent = `
      #insta-reciprocate-root::-webkit-scrollbar {
        width: 8px;
      }
      #insta-reciprocate-root::-webkit-scrollbar-track {
        background: transparent;
      }
      #insta-reciprocate-root::-webkit-scrollbar-thumb {
        background-color: #d1d5db;
        border-radius: 20px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      #insta-reciprocate-root::-webkit-scrollbar-thumb:hover {
        background-color: #9ca3af;
      }
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes dotPulse {
        0% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 0.6; }
      }
      .onboarding-content {
        animation: fadeIn 0.6s ease-out;
      }
      .onboarding-icon {
        animation: scaleIn 0.6s ease-out;
      }
      .get-started-btn {
        animation: pulse 2s infinite;
      }
      .active-dot {
        animation: dotPulse 2s infinite;
      }
    `;
    document.head.appendChild(style);

    // Initialize either onboarding or main UI based on state
    if (!this.onboardingState.hasCompleted) {
      this.onboardingContainer = this.createOnboarding();
      this.container.appendChild(this.onboardingContainer);
    } else {
      this.initializeMainUI();
    }

    // Add backdrop and container to body
    document.body.appendChild(backdrop);
    document.body.appendChild(this.container);

    // Add keyboard shortcut for closing
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.container && document.body.contains(this.container)) {
        this.cleanup();
        const backdrop = document.querySelector('.insta-reciprocate-backdrop');
        if (backdrop) document.body.removeChild(backdrop);
        document.body.removeChild(this.container);
      }
    });
  }

  private createLoadingSpinner() {
    return `
      <div style="
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-top-color: transparent;
        border-radius: 50%;
        display: inline-block;
        animation: spin 1s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
      "></div>
    `;
  }

  private formatNumber(num: number): string {
    return num.toLocaleString();
  }

  private calculatePercentage(part: number, total: number): number {
    return Math.round((part / total) * 100);
  }

  private async analyze() {
    if (this.isAnalyzing || !this.startButton || !this.progress || !this.results) return;

    // Clean up before starting new analysis
    this.cleanup();

    this.isAnalyzing = true;
    this.startButton.disabled = true;
    this.startButton.style.opacity = '0.8';
    this.startButton.style.cursor = 'not-allowed';
    this.startButton.innerHTML = `${this.createLoadingSpinner()}Analyzing...`;
    this.progress.style.display = 'block';
    this.results.innerHTML = '';

    try {
      await this.initService();

      const auth = document.cookie.match(/ds_user_id=(\d+)/);
      if (!auth) throw new Error('Not logged in');
      const userId = auth[1];

      // Get following
      const following = new Set<string>();
      let hasNextFollowing = true;
      let afterFollowing: string | undefined;

      while (hasNextFollowing) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const response = await this.service.getFollowing(userId, afterFollowing);
          response.users.forEach((user: any) => {
            following.add(user.username);
            this.userMap.set(user.username, {
              id: user.id,
              username: user.username,
              fullName: user.full_name || '',
              profilePicUrl: user.profile_pic_url || ''
            });
          });
          hasNextFollowing = response.pageInfo.has_next_page;
          afterFollowing = response.pageInfo.end_cursor;
          
          if (this.progress) {
            this.progress.innerHTML = `
              <div style="margin-bottom: 12px;">
                <div style="font-weight: 600; margin-bottom: 8px;">Analyzing Following</div>
                <div style="font-size: 24px; font-weight: 600; color: #262626;">
                  ${this.formatNumber(following.size)}
                </div>
              </div>
            `;
          }
        } catch (error) {
          console.error('Error fetching following:', error);
          hasNextFollowing = false;
        }
      }

      // Get followers
      const followers = new Set<string>();
      let hasNextFollowers = true;
      let afterFollowers: string | undefined;

      while (hasNextFollowers) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const response = await this.service.getFollowers(userId, afterFollowers);
          response.users.forEach((user: any) => {
            followers.add(user.username);
            // Update user data if we don't have it yet
            if (!this.userMap.has(user.username)) {
              this.userMap.set(user.username, {
                id: user.id,
                username: user.username,
                fullName: user.full_name || '',
                profilePicUrl: user.profile_pic_url || ''
              });
            }
          });
          hasNextFollowers = response.pageInfo.has_next_page;
          afterFollowers = response.pageInfo.end_cursor;
          
          if (this.progress) {
            this.progress.innerHTML = `
              <div style="margin-bottom: 12px;">
                <div style="font-weight: 600; margin-bottom: 8px;">Analyzing Followers</div>
                <div style="font-size: 24px; font-weight: 600; color: #262626;">
                  ${this.formatNumber(followers.size)}
                </div>
              </div>
            `;
          }
        } catch (error) {
          console.error('Error fetching followers:', error);
          hasNextFollowers = false;
        }
      }

      // Find non-followers
      this.allUsers = Array.from(following).filter(user => !followers.has(user));
      const nonFollowersCount = this.allUsers.filter(user => !this.whitelistedUsers.has(user)).length;
      const nonFollowersPercentage = this.calculatePercentage(nonFollowersCount, following.size);
      this.lastAnalyzed = new Date();

      if (this.results) {
        this.results.innerHTML = `
          <div style="background: #f3f4f6; border-radius: 16px; padding: 24px;">
            <div style="font-size: 18px; font-weight: 600; color: #262626; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
              Results
              <img 
                src="${chrome.runtime.getURL('assets/icons/sparkles.png')}" 
                alt="✨" 
                style="width: 20px; height: 20px; object-fit: contain;"
                onerror="this.onerror=null; this.innerHTML='✨'; console.error('Failed to load sparkles icon');"
              >
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px;">
              <div style="background: white; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); border: 1px solid rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; justify-content: center; min-height: 140px;">
                <div style="color: #8e8e8e; font-size: 14px;">Following</div>
                <div style="font-size: 32px; font-weight: 600; color: #262626; margin: 12px 0;">${this.formatNumber(following.size)}</div>
              </div>
              <div style="background: white; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); border: 1px solid rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; justify-content: center; min-height: 140px;">
                <div style="color: #8e8e8e; font-size: 14px;">Followers</div>
                <div style="font-size: 32px; font-weight: 600; color: #262626; margin: 12px 0;">${this.formatNumber(followers.size)}</div>
              </div>
              <div style="background: white; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); border: 1px solid rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; justify-content: center; min-height: 140px;">
                <div style="color: #8e8e8e; font-size: 14px;">Not Following Back</div>
                <div style="font-size: 32px; font-weight: 600; color: #262626; margin: 12px 0;">${this.formatNumber(nonFollowersCount)}</div>
                <div style="color: #8e8e8e; font-size: 12px;">${nonFollowersPercentage}% of following</div>
              </div>
            </div>
            <div style="margin-top: 28px;">
              <div class="tabs-container"></div>
              <div id="search-container"></div>
              <div id="userList" style="max-height: 400px; overflow-y: auto; background: white; border-radius: 12px; padding: 8px;"></div>
            </div>
            <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
              <button id="reAnalyzeButton" style="
                background: linear-gradient(45deg, #405DE6, #5B51D8, #833AB4, #C13584, #E1306C, #FD1D1D);
                background-size: 400% 400%;
                animation: gradient 15s ease infinite;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 14px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
              ">
                Re-analyze
              </button>
              <div style="color: #8e8e8e; font-size: 12px;">
                Last analyzed: ${this.lastAnalyzed?.toLocaleString()}
              </div>
            </div>
          </div>
        `;

        // Reset search state when re-analyzing
        this.searchQuery = '';
        this.searchInput = null;

        this.updateResults();

        // Add reanalyze button functionality
        const reAnalyzeButton = document.getElementById('reAnalyzeButton');
        if (reAnalyzeButton) {
          reAnalyzeButton.onmouseover = () => {
            reAnalyzeButton.style.transform = 'translateY(-2px)';
            reAnalyzeButton.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
          };
          reAnalyzeButton.onmouseout = () => {
            reAnalyzeButton.style.transform = 'translateY(0)';
            reAnalyzeButton.style.boxShadow = 'none';
          };
          reAnalyzeButton.onclick = () => {
            if (this.results) {
              this.results.innerHTML = '';
            }
            this.analyze();
          };
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      if (this.results) {
        this.results.innerHTML = `
          <div style="
            margin-top: 24px;
            padding: 20px;
            background: #ffebee;
            border-radius: 12px;
            color: #c62828;
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Error</div>
              <div>${errorMessage}</div>
            </div>
          </div>
        `;
      }
    } finally {
      this.isAnalyzing = false;
      if (this.startButton && this.startButton.parentElement) {
        this.startButton.parentElement.removeChild(this.startButton);
        this.startButton = null;
      }
      if (this.progress) {
        this.progress.style.display = 'none';
      }
    }
  }

  private async unfollowUser(userId: string): Promise<boolean> {
    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastUnfollow = now - this.lastUnfollowTime;
      const baseDelay = 4000;
      const randomDelay = baseDelay * (1 + Math.random() * 0.2); // 100-120% of base delay

      if (timeSinceLastUnfollow < randomDelay) {
        await new Promise(resolve => setTimeout(resolve, randomDelay - timeSinceLastUnfollow));
      }

      // Check if we need a 5-minute pause
      if (this.unfollowCount > 0 && this.unfollowCount % 5 === 0) {
        const pauseMessage = document.createElement('div');
        pauseMessage.className = 'text-blue-600 text-sm mt-2';
        pauseMessage.textContent = 'Taking a 5-minute break to comply with rate limits...';
        this.results?.appendChild(pauseMessage);
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // 5 minutes
        this.results?.removeChild(pauseMessage);
      }

      const csrftoken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
      if (!csrftoken) {
        throw new Error('No CSRF token found');
      }

      const response = await fetch(`https://www.instagram.com/api/v1/friendships/destroy/${userId}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-csrftoken': csrftoken,
          'x-ig-app-id': '936619743392459',
          'x-asbd-id': '198387',
          'x-ig-www-claim': '0',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to unfollow user: ${response.status}`);
      }

      this.unfollowCount++;
      this.lastUnfollowTime = Date.now();
      return true;
    } catch (error) {
      console.error('Unfollow error:', error);
      return false;
    }
  }

  private async unfollowSelected(): Promise<void> {
    if (this.isUnfollowing || this.selectedUsers.size === 0) return;

    this.isUnfollowing = true;
    const total = this.selectedUsers.size;
    let completed = 0;

    // Create progress indicator
    const progressContainer = document.createElement('div');
    progressContainer.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50';
    progressContainer.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="relative h-5 w-5">
            <div class="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <span class="text-sm text-gray-600">
            Unfollowing ${completed}/${total}
          </span>
        </div>
        <button id="cancelUnfollow" class="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
          Cancel
        </button>
      </div>
    `;
    document.body.appendChild(progressContainer);

    const updateProgress = () => {
      const progressText = progressContainer.querySelector('span');
      if (progressText) {
        progressText.textContent = `Unfollowing ${completed}/${total}`;
      }
    };

    // Add cancel button handler
    const cancelButton = document.getElementById('cancelUnfollow');
    if (cancelButton) {
      cancelButton.onclick = () => {
        this.isUnfollowing = false;
        document.body.removeChild(progressContainer);
      };
    }

    try {
      for (const username of this.selectedUsers) {
        if (!this.isUnfollowing) break;

        const userData = this.userMap.get(username);
        if (!userData) {
          console.error(`No user ID found for username: ${username}`);
          continue;
        }

        const success = await this.unfollowUser(userData.id);
        if (success) {
          completed++;
          updateProgress();
          this.selectedUsers.delete(username);
          this.unfollowedUsers.add(username);
          this.updateResults();
        }
      }
    } finally {
      this.isUnfollowing = false;
      if (document.body.contains(progressContainer)) {
        document.body.removeChild(progressContainer);
      }
    }
  }

  private createActionButtons(): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 16px 0;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid #dbdbdb;
    `;

    const selectAllButton = document.createElement('button');
    selectAllButton.style.cssText = `
      padding: 7px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      background: none;
      border: 1px solid #dbdbdb;
      color: #262626;
    `;
    selectAllButton.textContent = 'Select All';
    
    selectAllButton.onmouseover = () => {
      selectAllButton.style.backgroundColor = '#f3f4f6';
    };
    
    selectAllButton.onmouseout = () => {
      selectAllButton.style.backgroundColor = 'transparent';
    };

    selectAllButton.onclick = () => {
      let relevantUsers: string[];
      if (this.activeTab === 'whitelist') {
        relevantUsers = this.allUsers.filter(user => this.whitelistedUsers.has(user));
      } else {
        relevantUsers = this.allUsers.filter(user => 
          !this.whitelistedUsers.has(user) && !this.unfollowedUsers.has(user)
        );
      }
      
      if (this.selectedUsers.size === relevantUsers.length) {
        this.selectedUsers.clear();
        selectAllButton.textContent = 'Select All';
        selectAllButton.style.backgroundColor = 'transparent';
        selectAllButton.style.borderColor = '#dbdbdb';
        selectAllButton.style.color = '#262626';
      } else {
        this.selectedUsers = new Set(relevantUsers);
        selectAllButton.textContent = 'Deselect All';
        selectAllButton.style.backgroundColor = '#f3f4f6';
        selectAllButton.style.borderColor = '#d1d5db';
        selectAllButton.style.color = '#262626';
      }
      this.updateResults();
    };

    container.appendChild(selectAllButton);

    if (this.activeTab === 'non-followers') {
      // Add whitelist and unfollow buttons for non-followers tab
      const whitelistButton = document.createElement('button');
      whitelistButton.style.cssText = `
        padding: 7px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #16a34a;
        border: none;
        color: white;
        opacity: ${this.selectedUsers.size === 0 ? '0.5' : '1'};
        cursor: ${this.selectedUsers.size === 0 ? 'not-allowed' : 'pointer'};
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      const heartHandsIcon = document.createElement('img');
      heartHandsIcon.src = chrome.runtime.getURL('assets/icons/HeartHandsEmoji.png');
      heartHandsIcon.alt = 'Whitelist';
      heartHandsIcon.style.cssText = `
        width: 16px;
        height: 16px;
        object-fit: contain;
      `;

      const buttonText = document.createElement('span');
      buttonText.textContent = 'Whitelist Selected';

      whitelistButton.appendChild(heartHandsIcon);
      whitelistButton.appendChild(buttonText);
      whitelistButton.disabled = this.selectedUsers.size === 0;
      
      whitelistButton.onmouseover = () => {
        if (!whitelistButton.disabled) {
          whitelistButton.style.backgroundColor = '#15803d';
        }
      };
      
      whitelistButton.onmouseout = () => {
        whitelistButton.style.backgroundColor = '#16a34a';
      };
      
      whitelistButton.onclick = () => {
        if (!whitelistButton.disabled) {
          for (const username of this.selectedUsers) {
            this.whitelistedUsers.add(username);
          }
          this.saveWhitelistedUsers();
          this.selectedUsers.clear();
          this.updateResults();
        }
      };

      const unfollowButton = document.createElement('button');
      unfollowButton.style.cssText = `
        padding: 7px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #0095f6;
        border: none;
        color: white;
        opacity: ${this.selectedUsers.size === 0 ? '0.5' : '1'};
        cursor: ${this.selectedUsers.size === 0 ? 'not-allowed' : 'pointer'};
      `;
      unfollowButton.textContent = 'Unfollow Selected';
      unfollowButton.disabled = this.selectedUsers.size === 0;
      
      unfollowButton.onmouseover = () => {
        if (!unfollowButton.disabled) {
          unfollowButton.style.backgroundColor = '#1aa1f7';
        }
      };
      
      unfollowButton.onmouseout = () => {
        unfollowButton.style.backgroundColor = '#0095f6';
      };
      
      unfollowButton.onclick = () => {
        if (!unfollowButton.disabled) {
          this.unfollowSelected();
        }
      };

      container.appendChild(whitelistButton);
      container.appendChild(unfollowButton);
    } else if (this.activeTab === 'whitelist') {
      // Add remove from whitelist button
      const removeButton = document.createElement('button');
      removeButton.style.cssText = `
        padding: 7px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #ef4444;
        border: none;
        color: white;
        opacity: ${this.selectedUsers.size === 0 ? '0.5' : '1'};
        cursor: ${this.selectedUsers.size === 0 ? 'not-allowed' : 'pointer'};
      `;
      removeButton.textContent = 'Remove from Whitelist';
      removeButton.disabled = this.selectedUsers.size === 0;
      
      removeButton.onmouseover = () => {
        if (!removeButton.disabled) {
          removeButton.style.backgroundColor = '#dc2626';
        }
      };
      
      removeButton.onmouseout = () => {
        removeButton.style.backgroundColor = '#ef4444';
      };
      
      removeButton.onclick = () => {
        if (!removeButton.disabled) {
          for (const username of this.selectedUsers) {
            this.whitelistedUsers.delete(username);
          }
          this.saveWhitelistedUsers();
          this.selectedUsers.clear();
          this.updateResults();
        }
      };

      container.appendChild(removeButton);
    }

    return container;
  }

  private createOnboarding(): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 32px;
      text-align: center;
      max-width: 480px;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
    `;

    const steps = [
      {
        title: 'Welcome to InstaReciprocate',
        description: 'Analyze your Instagram following and find out who\'s not following you back.',
        icon: chrome.runtime.getURL('assets/icons/icon128.png'),
        isLogo: true
      },
      {
        title: 'Key Features',
        description: 'Find non-followers, protect important accounts with whitelist, and safely manage your following.',
        icon: chrome.runtime.getURL('assets/icons/HeartHandsEmoji.png'),
        isLogo: false
      },
      {
        title: 'Safe & Secure',
        description: 'We follow Instagram\'s rate limits and protect your data. No information is stored on external servers.',
        icon: chrome.runtime.getURL('assets/icons/sparkles.png'),
        isLogo: false
      }
    ];

    const currentStep = steps[this.onboardingState.currentStep - 1];

    // Create step indicator with enhanced styling
    const stepIndicator = document.createElement('div');
    stepIndicator.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 32px;
    `;

    for (let i = 1; i <= this.onboardingState.totalSteps; i++) {
      const dot = document.createElement('div');
      const isActive = i === this.onboardingState.currentStep;
      dot.style.cssText = `
        width: ${isActive ? '10px' : '8px'};
        height: ${isActive ? '10px' : '8px'};
        border-radius: 50%;
        background-color: ${isActive ? '#0095f6' : '#dbdbdb'};
        transition: all 0.3s ease;
        ${isActive ? 'class: active-dot;' : ''}
      `;
      stepIndicator.appendChild(dot);
    }

    // Create content container with animation
    const contentContainer = document.createElement('div');
    contentContainer.className = 'onboarding-content';
    contentContainer.style.cssText = `
      opacity: 0;
      transform: translateY(10px);
    `;

    // Create icon with enhanced styling
    const icon = document.createElement('img');
    icon.src = currentStep.icon;
    icon.alt = currentStep.title;
    icon.className = 'onboarding-icon';
    icon.style.cssText = `
      width: 88px;
      height: 88px;
      margin-bottom: 28px;
      border-radius: ${currentStep.isLogo ? '20px' : '50%'};
      background-color: white;
      object-fit: contain;
      padding: ${currentStep.isLogo ? '0' : '16px'};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      opacity: 0;
      transform: scale(0.95);
      transition: all 0.3s ease;
    `;

    icon.onmouseover = () => {
      icon.style.transform = 'scale(1.05)';
      icon.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
    };

    icon.onmouseout = () => {
      icon.style.transform = 'scale(1)';
      icon.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
    };

    // Create title with enhanced styling
    const title = document.createElement('h2');
    title.textContent = currentStep.title;
    title.style.cssText = `
      font-size: 28px;
      font-weight: 700;
      color: #262626;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    `;

    // Create description with enhanced styling
    const description = document.createElement('p');
    description.textContent = currentStep.description;
    description.style.cssText = `
      font-size: 16px;
      color: #737373;
      margin-bottom: 32px;
      line-height: 1.6;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    `;

    // Create navigation buttons with enhanced styling
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 32px;
    `;

    if (this.onboardingState.currentStep > 1) {
      const backButton = document.createElement('button');
      backButton.textContent = 'Back';
      backButton.style.cssText = `
        padding: 14px 28px;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: none;
        border: 1.5px solid #dbdbdb;
        color: #262626;
      `;
      
      backButton.onmouseover = () => {
        backButton.style.backgroundColor = '#f3f4f6';
        backButton.style.borderColor = '#c0c0c0';
      };
      
      backButton.onmouseout = () => {
        backButton.style.backgroundColor = 'transparent';
        backButton.style.borderColor = '#dbdbdb';
      };
      
      backButton.onclick = () => {
        this.onboardingState.currentStep--;
        this.updateOnboarding();
      };
      
      buttonContainer.appendChild(backButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = this.onboardingState.currentStep === this.onboardingState.totalSteps ? 'Get Started' : 'Next';
    nextButton.className = this.onboardingState.currentStep === this.onboardingState.totalSteps ? 'get-started-btn' : '';
    nextButton.style.cssText = `
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #0095f6;
      border: none;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 149, 246, 0.2);
    `;
    
    nextButton.onmouseover = () => {
      nextButton.style.backgroundColor = '#1aa1f7';
      nextButton.style.transform = 'translateY(-1px)';
      nextButton.style.boxShadow = '0 6px 16px rgba(0, 149, 246, 0.25)';
    };
    
    nextButton.onmouseout = () => {
      nextButton.style.backgroundColor = '#0095f6';
      nextButton.style.transform = 'translateY(0)';
      nextButton.style.boxShadow = '0 4px 12px rgba(0, 149, 246, 0.2)';
    };
    
    nextButton.onclick = () => {
      if (this.onboardingState.currentStep === this.onboardingState.totalSteps) {
        this.completeOnboarding();
      } else {
        this.onboardingState.currentStep++;
        this.updateOnboarding();
      }
    };
    
    buttonContainer.appendChild(nextButton);

    // Add skip button with enhanced styling
    if (this.onboardingState.currentStep < this.onboardingState.totalSteps) {
      const skipButton = document.createElement('button');
      skipButton.textContent = 'Skip';
      skipButton.style.cssText = `
        position: absolute;
        top: 32px;
        right: 32px;
        background: none;
        border: none;
        font-size: 14px;
        color: #8e8e8e;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.2s ease;
      `;
      
      skipButton.onmouseover = () => {
        skipButton.style.color = '#262626';
        skipButton.style.backgroundColor = '#f3f4f6';
      };
      
      skipButton.onmouseout = () => {
        skipButton.style.color = '#8e8e8e';
        skipButton.style.backgroundColor = 'transparent';
      };
      
      skipButton.onclick = () => {
        this.completeOnboarding();
      };
      
      container.appendChild(skipButton);
    }

    contentContainer.appendChild(stepIndicator);
    contentContainer.appendChild(icon);
    contentContainer.appendChild(title);
    contentContainer.appendChild(description);
    contentContainer.appendChild(buttonContainer);
    container.appendChild(contentContainer);

    // Trigger animations after a short delay
    setTimeout(() => {
      contentContainer.style.opacity = '1';
      contentContainer.style.transform = 'translateY(0)';
      icon.style.opacity = '1';
      icon.style.transform = 'scale(1)';
    }, 50);

    return container;
  }

  private updateOnboarding(): void {
    if (this.onboardingContainer && this.container) {
      const newOnboarding = this.createOnboarding();
      this.onboardingContainer.replaceWith(newOnboarding);
      this.onboardingContainer = newOnboarding;
    }
  }

  private completeOnboarding(): void {
    // Always mark as completed after first viewing
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    
    this.onboardingState.hasCompleted = true;
    if (this.container) {
      this.container.innerHTML = '';
      this.initializeMainUI();
    }
  }

  private initializeMainUI(): void {
    if (!this.container) return;

    // Create header with close button
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 1px solid #dbdbdb;
    `;

    // Create title with Instagram icon
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('assets/icons/logo.jpg');
    icon.alt = 'InstaReciprocate Logo';
    icon.style.cssText = `
      width: 24px;
      height: 24px;
      object-fit: contain;
    `;

    const title = document.createElement('h1');
    title.textContent = 'InstaReciprocate';
    title.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #262626;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    title.prepend(icon);

    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 20px;
      color: #8e8e8e;
      cursor: pointer;
      padding: 8px;
      margin: -8px;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.backgroundColor = '#f3f4f6';
      closeButton.style.color = '#262626';
    };
    closeButton.onmouseout = () => {
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.color = '#8e8e8e';
    };
    closeButton.onclick = () => {
      this.cleanup();
      const backdrop = document.querySelector('.insta-reciprocate-backdrop');
      if (backdrop) document.body.removeChild(backdrop);
      document.body.removeChild(this.container!);
    };

    header.appendChild(titleContainer);
    header.appendChild(closeButton);

    // Create button with gradient
    this.startButton = document.createElement('button');
    this.startButton.textContent = 'Start Analysis';
    this.startButton.style.cssText = `
      background: linear-gradient(45deg, #405DE6, #5B51D8, #833AB4, #C13584, #E1306C, #FD1D1D);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
      color: white;
      border: none;
      padding: 16px 24px;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      width: 100%;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;

    this.startButton.onmouseover = () => {
      this.startButton!.style.transform = 'translateY(-2px)';
      this.startButton!.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
    };
    this.startButton.onmouseout = () => {
      this.startButton!.style.transform = 'translateY(0)';
      this.startButton!.style.boxShadow = 'none';
    };

    // Create progress
    this.progress = document.createElement('div');
    this.progress.style.cssText = `
      margin-top: 24px;
      padding: 20px;
      background: #f3f4f6;
      border-radius: 14px;
      display: none;
      font-size: 14px;
      color: #262626;
      text-align: center;
    `;

    // Create results
    this.results = document.createElement('div');
    this.results.style.cssText = 'margin-top: 24px;';

    // Add elements to container
    this.container.appendChild(header);
    this.container.appendChild(this.startButton);
    this.container.appendChild(this.progress);
    this.container.appendChild(this.results);

    // Add click handler
    this.startButton.addEventListener('click', () => this.analyze());
  }

  public init() {
    try {
      this.createUI();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Failed to inject InstaReciprocate:', errorMessage);
    }
  }
}

// Create and initialize
const app = new InstaReciprocate();
app.init();

export default InstaReciprocate; 