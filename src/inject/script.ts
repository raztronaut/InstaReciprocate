class InstagramAnalytics {
  private container: HTMLDivElement | null = null;
  private startButton: HTMLButtonElement | null = null;
  private progress: HTMLDivElement | null = null;
  private results: HTMLDivElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private isAnalyzing: boolean = false;
  private isUnfollowing: boolean = false;
  private unfollowCount: number = 0;
  private lastUnfollowTime: number = 0;
  private lastAnalyzed: Date | null = null;
  private service: any = null;
  private whitelistedUsers: Set<string>;
  private selectedUsers: Set<string> = new Set();
  private activeTab: 'non-followers' | 'whitelist' = 'non-followers';
  private userMap: Map<string, { id: string; username: string; }> = new Map();
  private allUsers: string[] = [];

  constructor() {
    this.whitelistedUsers = this.loadWhitelistedUsers();
    // Listen for whitelist updates from other parts of the app
    window.addEventListener('whitelistUpdated', ((event: CustomEvent) => {
      this.whitelistedUsers = new Set(event.detail.users);
      this.updateResults();
    }) as EventListener);
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
      cursor: pointer;
      background-color: ${this.whitelistedUsers.has(username) ? '#f0fdf4' : 'transparent'};
      border: 1px solid ${this.whitelistedUsers.has(username) ? '#86efac' : '#e5e7eb'};
    `;

    const leftSection = document.createElement('div');
    leftSection.style.cssText = 'display: flex; align-items: center; flex-grow: 1;';

    // Add checkbox for selection
    if (!this.whitelistedUsers.has(username) && this.activeTab === 'non-followers') {
      const checkbox = document.createElement('div');
      checkbox.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 4px;
        margin-right: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border: 2px solid ${this.selectedUsers.has(username) ? '#3b82f6' : '#d1d5db'};
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
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2">
            <path d="M2 6l3 3 5-5" />
          </svg>
        `;
      }

      leftSection.appendChild(checkbox);
    }

    // Create profile image container
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
      width: 40px;
      height: 40px;
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
    img.src = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    img.onerror = () => {
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    };

    imgContainer.appendChild(img);
    leftSection.appendChild(imgContainer);

    // Create username container
    const usernameContainer = document.createElement('div');
    usernameContainer.style.cssText = 'flex-grow: 1; min-width: 0;';
    
    const usernameText = document.createElement('div');
    usernameText.style.cssText = 'font-weight: 600; color: #262626; overflow: hidden; text-overflow: ellipsis;';
    usernameText.textContent = `@${username}`;
    
    usernameContainer.appendChild(usernameText);
    leftSection.appendChild(usernameContainer);

    // Create action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; flex-shrink: 0;';

    // Create whitelist button
    const whitelistButton = document.createElement('button');
    whitelistButton.style.cssText = `
      background: ${this.whitelistedUsers.has(username) ? '#dcfce7' : '#f3f4f6'};
      color: ${this.whitelistedUsers.has(username) ? '#16a34a' : '#6b7280'};
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
      white-space: nowrap;
    `;
    whitelistButton.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
      </svg>
      <span>${this.whitelistedUsers.has(username) ? 'Protected' : 'Protect'}</span>
    `;

    whitelistButton.onmouseover = () => {
      whitelistButton.style.backgroundColor = this.whitelistedUsers.has(username) ? '#bbf7d0' : '#e5e7eb';
    };

    whitelistButton.onmouseout = () => {
      whitelistButton.style.backgroundColor = this.whitelistedUsers.has(username) ? '#dcfce7' : '#f3f4f6';
    };

    whitelistButton.onclick = (e) => {
      e.stopPropagation();
      this.toggleWhitelist(username);
    };

    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.style.cssText = `
      background: none;
      border: none;
      padding: 8px;
      color: #0095f6;
      cursor: pointer;
      font-size: 14px;
      border-radius: 4px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    `;
    copyButton.textContent = 'Copy';

    copyButton.addEventListener('mouseover', () => {
      copyButton.style.backgroundColor = '#f3f4f6';
    });

    copyButton.addEventListener('mouseout', () => {
      copyButton.style.backgroundColor = 'transparent';
    });

    copyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(username);
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    });

    actionsContainer.appendChild(whitelistButton);
    actionsContainer.appendChild(copyButton);

    item.appendChild(leftSection);
    item.appendChild(actionsContainer);

    return item;
  }

  private createTabs(): HTMLDivElement {
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    `;

    const createTab = (text: string, count: number, type: 'non-followers' | 'whitelist') => {
      const tab = document.createElement('button');
      tab.style.cssText = `
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        ${this.activeTab === type 
          ? 'background: #0095f6; color: white;' 
          : 'background: #f3f4f6; color: #6b7280;'}
      `;
      tab.textContent = `${text} (${count})`;
      tab.onclick = () => this.switchTab(type);
      return tab;
    };

    const nonFollowersCount = this.allUsers.filter(user => 
      !this.whitelistedUsers.has(user)
    ).length;

    tabsContainer.appendChild(createTab('Users Not Following Back', nonFollowersCount, 'non-followers'));
    tabsContainer.appendChild(createTab('Whitelist', this.whitelistedUsers.size, 'whitelist'));

    return tabsContainer;
  }

  private switchTab(tab: 'non-followers' | 'whitelist'): void {
    this.activeTab = tab;
    this.updateResults();
  }

  private updateResults(): void {
    if (!this.results) return;

    const userList = document.getElementById('userList');
    if (!userList) return;

    // Store current search term
    const searchTerm = this.searchInput?.value.toLowerCase() || '';

    // Clear existing items
    userList.innerHTML = '';

    // Get users based on active tab
    const usersToShow = this.activeTab === 'whitelist'
      ? this.allUsers.filter(user => this.whitelistedUsers.has(user))
      : this.allUsers.filter(user => !this.whitelistedUsers.has(user));

    // Handle action buttons for non-followers tab
    if (this.activeTab === 'non-followers') {
      // Look for existing action buttons container
      let actionButtonsContainer = document.querySelector('.action-buttons-container');
      if (!actionButtonsContainer) {
        actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'action-buttons-container';
        if (userList.parentElement) {
          userList.parentElement.insertBefore(actionButtonsContainer, userList);
        }
      }
      actionButtonsContainer.innerHTML = ''; // Clear existing buttons
      actionButtonsContainer.appendChild(this.createActionButtons());
    }

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

    // Filter and show users
    usersToShow
      .filter(username => username.toLowerCase().includes(searchTerm))
      .forEach(username => {
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
    this.container.id = 'instagram-analytics-root';
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
    `;

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
      gap: 12px;
    `;

    const icon = document.createElement('div');
    icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2Z" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#262626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const title = document.createElement('h2');
    title.textContent = 'Instagram Analytics';
    title.style.cssText = `
      font-size: 20px;
      font-weight: 600;
      margin: 0;
      color: #262626;
    `;

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
      document.body.removeChild(backdrop);
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

    // Add keyframes for gradient animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

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

    // Add backdrop and container to body
    document.body.appendChild(backdrop);
    document.body.appendChild(this.container);

    // Add keyboard shortcut for closing
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.container && document.body.contains(this.container)) {
        document.body.removeChild(backdrop);
        document.body.removeChild(this.container);
      }
    });

    // Add click handler
    this.startButton.addEventListener('click', () => this.analyze());
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

  private createSearchInput() {
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

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Search users...';
    this.searchInput.style.cssText = `
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    `;
    this.searchInput.onfocus = () => {
      this.searchInput!.style.borderColor = '#0095f6';
    };
    this.searchInput.onblur = () => {
      this.searchInput!.style.borderColor = '#dbdbdb';
    };

    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(this.searchInput);

    return searchContainer.outerHTML;
  }

  private async analyze() {
    if (this.isAnalyzing || !this.startButton || !this.progress || !this.results) return;

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
            this.userMap.set(user.username, { id: user.id, username: user.username });
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
          response.users.forEach((u: any) => followers.add(u.username));
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
            <div style="font-size: 18px; font-weight: 600; color: #262626; margin-bottom: 20px;">Results</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px;">
              <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                <div style="color: #8e8e8e; font-size: 14px; margin-bottom: 8px;">Following</div>
                <div style="font-size: 28px; font-weight: 600; color: #262626;">${this.formatNumber(following.size)}</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                <div style="color: #8e8e8e; font-size: 14px; margin-bottom: 8px;">Followers</div>
                <div style="font-size: 28px; font-weight: 600; color: #262626;">${this.formatNumber(followers.size)}</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
                <div style="color: #8e8e8e; font-size: 14px; margin-bottom: 8px;">Not Following Back</div>
                <div style="font-size: 28px; font-weight: 600; color: #262626;">${this.formatNumber(nonFollowersCount)}</div>
                <div style="color: #8e8e8e; font-size: 12px; margin-top: 4px;">${nonFollowersPercentage}% of following</div>
              </div>
            </div>
            <div style="margin-top: 28px;">
              <div class="tabs-container"></div>
              ${this.createSearchInput()}
              <div id="userList" style="max-height: 400px; overflow-y: auto; background: white; border-radius: 12px; padding: 8px;"></div>
            </div>
            <div style="margin-top: 16px; text-align: right; color: #8e8e8e; font-size: 12px;">
              Last analyzed: ${this.lastAnalyzed?.toLocaleString()}
            </div>
          </div>
        `;

        this.updateResults();

        // Add search functionality
        if (this.searchInput) {
          this.searchInput.addEventListener('input', () => {
            this.updateResults();
          });
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
      if (this.startButton) {
        this.startButton.disabled = false;
        this.startButton.style.opacity = '1';
        this.startButton.style.cursor = 'pointer';
        this.startButton.innerHTML = 'Start Analysis';
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
    container.className = 'flex items-center gap-4 mb-4';

    const selectAllButton = document.createElement('button');
    selectAllButton.className = `
      px-4 py-2 rounded-md text-sm font-medium transition-all
      bg-blue-50 text-blue-600 hover:bg-blue-100
    `;
    selectAllButton.textContent = 'Select All';
    selectAllButton.onclick = () => {
      const nonWhitelistedUsers = this.allUsers.filter(user => !this.whitelistedUsers.has(user));
      if (this.selectedUsers.size === nonWhitelistedUsers.length) {
        this.selectedUsers.clear();
        selectAllButton.textContent = 'Select All';
        selectAllButton.className = 'px-4 py-2 rounded-md text-sm font-medium transition-all bg-blue-50 text-blue-600 hover:bg-blue-100';
      } else {
        this.selectedUsers = new Set(nonWhitelistedUsers);
        selectAllButton.textContent = 'Deselect All';
        selectAllButton.className = 'px-4 py-2 rounded-md text-sm font-medium transition-all bg-gray-100 text-gray-600 hover:bg-gray-200';
      }
      this.updateResults();
    };

    const unfollowButton = document.createElement('button');
    unfollowButton.className = `
      px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md 
      hover:bg-red-600 transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
    unfollowButton.textContent = 'Unfollow Selected';
    unfollowButton.onclick = () => this.unfollowSelected();

    container.appendChild(selectAllButton);
    container.appendChild(unfollowButton);

    return container;
  }

  public init() {
    try {
      this.createUI();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Failed to inject Instagram Analytics:', errorMessage);
    }
  }
}

// Create and initialize
const app = new InstagramAnalytics();
app.init();

export default InstagramAnalytics; 