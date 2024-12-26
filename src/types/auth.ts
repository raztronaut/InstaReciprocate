export interface InstagramAuth {
  ds_user_id: string;
  csrftoken: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface UserNode {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_verified: boolean;
  is_private: boolean;
  follows_viewer: boolean;
}

export interface PageInfo {
  has_next_page: boolean;
  end_cursor: string | null;
}

export interface GraphQLResponse {
  data: {
    user: {
      edge_follow?: {
        count: number;
        page_info: PageInfo;
        edges: Array<{ node: UserNode }>;
      };
      edge_followed_by?: {
        count: number;
        page_info: PageInfo;
        edges: Array<{ node: UserNode }>;
      };
    };
  };
} 