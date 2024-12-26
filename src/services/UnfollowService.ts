import { toast } from 'sonner';

export class UnfollowService {
  private static instance: UnfollowService;
  private isProcessing: boolean = false;
  private unfollowCount: number = 0;
  private lastUnfollowTime: number = 0;

  private constructor() {}

  public static getInstance(): UnfollowService {
    if (!UnfollowService.instance) {
      UnfollowService.instance = new UnfollowService();
    }
    return UnfollowService.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomDelay(): number {
    // Random delay between 100-120% of base delay (4000ms)
    const baseDelay = 4000;
    const multiplier = 1 + Math.random() * 0.2; // 1.0 to 1.2
    return Math.floor(baseDelay * multiplier);
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastUnfollow = now - this.lastUnfollowTime;
    const requiredDelay = this.getRandomDelay();

    if (timeSinceLastUnfollow < requiredDelay) {
      await this.delay(requiredDelay - timeSinceLastUnfollow);
    }

    // Check if we need a 5-minute pause
    if (this.unfollowCount > 0 && this.unfollowCount % 5 === 0) {
      toast.info('Taking a 5-minute break to comply with rate limits...');
      await this.delay(5 * 60 * 1000); // 5 minutes
      this.unfollowCount = 0;
    }

    this.lastUnfollowTime = Date.now();
  }

  public async unfollow(userId: string): Promise<boolean> {
    try {
      await this.enforceRateLimit();

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
      return true;
    } catch (error) {
      console.error('Unfollow error:', error);
      return false;
    }
  }

  public async unfollowBatch(userIds: string[], onProgress: (completed: number, total: number) => void): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    const total = userIds.length;
    let completed = 0;

    try {
      for (const userId of userIds) {
        if (!this.isProcessing) break;

        const success = await this.unfollow(userId);
        if (success) {
          completed++;
          onProgress(completed, total);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public stopProcessing(): void {
    this.isProcessing = false;
  }
}

export default UnfollowService; 