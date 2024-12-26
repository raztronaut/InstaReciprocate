import { GraphQLResponse, UserNode } from '@/types/auth';
import { getInstagramAuth } from '@/lib/utils/auth';

const FOLLOWING_QUERY_HASH = '3dec7e2c57367ef3da3d987d89f9dbc8';
const FOLLOWERS_QUERY_HASH = 'd04b0a864b4b54837c0d870b0e77e076';

// Rate limiting constants
const TIME_BETWEEN_REQUESTS = 1000;
const TIME_AFTER_BATCH = 10000;
const BATCH_SIZE = 6;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getRandomDelay = (baseDelay: number) => {
  return baseDelay * (0.7 + Math.random() * 0.3);
};

export class InstagramService {
  private requestCount = 0;
  private isPaused = false;

  constructor() {
    this.requestCount = 0;
  }

  async pause(): Promise<void> {
    this.isPaused = true;
  }

  async resume(): Promise<void> {
    this.isPaused = false;
  }

  private async enforceRateLimit(): Promise<void> {
    if (this.isPaused) {
      throw new Error('Operation paused');
    }

    this.requestCount++;

    if (this.requestCount % BATCH_SIZE === 0) {
      await sleep(TIME_AFTER_BATCH);
    } else {
      await sleep(getRandomDelay(TIME_BETWEEN_REQUESTS));
    }
  }

  private async fetchGraphQL(queryHash: string, variables: any): Promise<GraphQLResponse> {
    await this.enforceRateLimit();

    const auth = getInstagramAuth();
    if (!auth) throw new Error('Not authenticated');

    const response = await fetch(
      `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${JSON.stringify(variables)}`,
      {
        headers: {
          'x-csrftoken': auth.csrftoken,
          'x-ig-app-id': '936619743392459',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async getFollowing(userId: string, after?: string): Promise<{ users: UserNode[]; pageInfo: { hasNext: boolean; endCursor: string | null } }> {
    const variables = {
      id: userId,
      include_reel: false,
      fetch_mutual: true,
      first: 24,
      after,
    };

    const response = await this.fetchGraphQL(FOLLOWING_QUERY_HASH, variables);
    const edge_follow = response.data.user.edge_follow;

    return {
      users: edge_follow?.edges.map(edge => edge.node) || [],
      pageInfo: {
        hasNext: edge_follow?.page_info.has_next_page || false,
        endCursor: edge_follow?.page_info.end_cursor || null,
      },
    };
  }

  async getFollowers(userId: string, after?: string): Promise<{ users: UserNode[]; pageInfo: { hasNext: boolean; endCursor: string | null } }> {
    const variables = {
      id: userId,
      include_reel: false,
      fetch_mutual: true,
      first: 24,
      after,
    };

    const response = await this.fetchGraphQL(FOLLOWERS_QUERY_HASH, variables);
    const edge_followed_by = response.data.user.edge_followed_by;

    return {
      users: edge_followed_by?.edges.map(edge => edge.node) || [],
      pageInfo: {
        hasNext: edge_followed_by?.page_info.has_next_page || false,
        endCursor: edge_followed_by?.page_info.end_cursor || null,
      },
    };
  }
} 