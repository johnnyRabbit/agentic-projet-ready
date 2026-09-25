// Wire formats used by the existing REST client. These types do not validate
// remote payloads; runtime validation remains part of the integration roadmap.
export interface APIUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

export interface APIRepository {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

export interface APIPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  html_url: string;
  diff_url: string;
  head: { ref: string; sha: string; repo: APIRepository };
  base: { ref: string; sha: string; repo: APIRepository };
  user: APIUser;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  mergeable?: boolean | null;
  mergeable_state?: string;
  commits?: number;
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

export interface APIWebhook {
  id: number;
  name: string;
  active: boolean;
  events: string[];
  config: { url: string; content_type: string; secret?: string };
  created_at: string;
  updated_at: string;
}
