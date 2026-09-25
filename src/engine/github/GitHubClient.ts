import {
  GitHubConfig,
  GitHubToken,
  GitHubUser,
  GitHubRepository,
  GitHubPullRequest,
  GitHubWebhook,
  CreatePullRequestInput,
} from './types';

// ============================================================
// GITHUB CLIENT — Real GitHub API Integration
// ============================================================

const GITHUB_API_URL = 'https://api.github.com';
import type { APIUser, APIRepository, APIPullRequest, APIWebhook } from './apiTypes';
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

export class GitHubClient {
  private config: GitHubConfig;
  private token: GitHubToken | null = null;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.loadToken();
  }

  // ============================================================
  // OAuth Authentication
  // ============================================================

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      state: state || this.generateState(),
    });

    return `${GITHUB_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<GitHubToken> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.statusText}`);
    }

    const data = await response.json();

    this.token = {
      accessToken: data.access_token,
      tokenType: data.token_type,
      scope: data.scope,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
    };

    this.saveToken();
    return this.token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null && this.token.accessToken !== '';
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.token?.accessToken || null;
  }

  /**
   * Clear authentication
   */
  logout(): void {
    this.token = null;
    localStorage.removeItem('github_token');
  }

  // ============================================================
  // User Operations
  // ============================================================

  /**
   * Get authenticated user
   */
  async getCurrentUser(): Promise<GitHubUser> {
    const response = await this.request<APIUser>('/user');
    return {
      id: response.id,
      login: response.login,
      name: response.name || response.login,
      email: response.email || '',
      avatarUrl: response.avatar_url,
      url: response.html_url,
    };
  }

  // ============================================================
  // Repository Operations
  // ============================================================

  /**
   * List user repositories
   */
  async listRepositories(page: number = 1, perPage: number = 30): Promise<GitHubRepository[]> {
    const response = await this.request<APIRepository[]>(
      `/user/repos?page=${page}&per_page=${perPage}&sort=updated`
    );

    return response.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      defaultBranch: repo.default_branch,
    }));
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await this.request<APIRepository>(`/repos/${owner}/${repo}`);

    return {
      id: response.id,
      name: response.name,
      fullName: response.full_name,
      owner: response.owner.login,
      private: response.private,
      htmlUrl: response.html_url,
      cloneUrl: response.clone_url,
      defaultBranch: response.default_branch,
    };
  }

  // ============================================================
  // Pull Request Operations
  // ============================================================

  /**
   * Create a new pull request
   */
  async createPullRequest(input: CreatePullRequestInput): Promise<GitHubPullRequest> {
    const response = await this.request<APIPullRequest>(
      `/repos/${input.owner}/${input.repo}/pulls`,
      {
        method: 'POST',
        body: JSON.stringify({
          title: input.title,
          body: input.body,
          head: input.head,
          base: input.base,
          draft: input.draft || false,
          maintainer_can_modify: input.maintainerCanModify || true,
        }),
      }
    );

    return this.mapPullRequest(response);
  }

  /**
   * List pull requests
   */
  async listPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubPullRequest[]> {
    const response = await this.request<APIPullRequest[]>(
      `/repos/${owner}/${repo}/pulls?state=${state}`
    );
    return response.map((pr) => this.mapPullRequest(pr));
  }

  /**
   * Get pull request details
   */
  async getPullRequest(owner: string, repo: string, number: number): Promise<GitHubPullRequest> {
    const response = await this.request<APIPullRequest>(`/repos/${owner}/${repo}/pulls/${number}`);
    return this.mapPullRequest(response);
  }

  /**
   * Merge a pull request
   */
  async mergePullRequest(
    owner: string,
    repo: string,
    number: number,
    commitTitle?: string,
    commitMessage?: string
  ): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/pulls/${number}/merge`, {
      method: 'PUT',
      body: JSON.stringify({
        commit_title: commitTitle,
        commit_message: commitMessage,
        merge_method: 'squash',
      }),
    });
  }

  // ============================================================
  // Webhook Operations
  // ============================================================

  /**
   * Create a webhook
   */
  async createWebhook(
    owner: string,
    repo: string,
    url: string,
    events: string[],
    secret?: string
  ): Promise<GitHubWebhook> {
    const response = await this.request<APIWebhook>(`/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events,
        config: {
          url,
          content_type: 'json',
          secret: secret || this.generateWebhookSecret(),
        },
      }),
    });

    return {
      id: response.id,
      name: response.name,
      active: response.active,
      events: response.events,
      config: {
        url: response.config.url,
        contentType: response.config.content_type,
        secret: response.config.secret,
      },
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    };
  }

  /**
   * List webhooks
   */
  async listWebhooks(owner: string, repo: string): Promise<GitHubWebhook[]> {
    const response = await this.request<APIWebhook[]>(`/repos/${owner}/${repo}/hooks`);

    return response.map((hook) => ({
      id: hook.id,
      name: hook.name,
      active: hook.active,
      events: hook.events,
      config: {
        url: hook.config.url,
        contentType: hook.config.content_type,
        secret: hook.config.secret,
      },
      createdAt: hook.created_at,
      updatedAt: hook.updated_at,
    }));
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(owner: string, repo: string, hookId: number): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/hooks/${hookId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  /**
   * Make authenticated request to GitHub API
   */
  private async request<T = void>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new Error('Not authenticated. Please login first.');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${this.token.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Map GitHub API response to PullRequest type
   */
  private mapPullRequest(data: APIPullRequest): GitHubPullRequest {
    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body || '',
      state: data.merged ? 'merged' : data.state,
      htmlUrl: data.html_url,
      diffUrl: data.diff_url,
      head: {
        ref: data.head.ref,
        sha: data.head.sha,
        repo: {
          id: data.head.repo.id,
          name: data.head.repo.name,
          fullName: data.head.repo.full_name,
          owner: data.head.repo.owner.login,
          private: data.head.repo.private,
          htmlUrl: data.head.repo.html_url,
          cloneUrl: data.head.repo.clone_url,
          defaultBranch: data.head.repo.default_branch,
        },
      },
      base: {
        ref: data.base.ref,
        sha: data.base.sha,
        repo: {
          id: data.base.repo.id,
          name: data.base.repo.name,
          fullName: data.base.repo.full_name,
          owner: data.base.repo.owner.login,
          private: data.base.repo.private,
          htmlUrl: data.base.repo.html_url,
          cloneUrl: data.base.repo.clone_url,
          defaultBranch: data.base.repo.default_branch,
        },
      },
      user: {
        id: data.user.id,
        login: data.user.login,
        name: data.user.name || data.user.login,
        email: '',
        avatarUrl: data.user.avatar_url,
        url: data.user.html_url,
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      mergedAt: data.merged_at,
      mergeable: data.mergeable,
      mergeableState: data.mergeable_state,
      commits: data.commits,
      additions: data.additions,
      deletions: data.deletions,
      changedFiles: data.changed_files,
    };
  }

  /**
   * Save token to localStorage
   */
  private saveToken(): void {
    if (this.token) {
      localStorage.setItem('github_token', JSON.stringify(this.token));
    }
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): void {
    const stored = localStorage.getItem('github_token');
    if (stored) {
      try {
        this.token = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load GitHub token:', error);
        this.token = null;
      }
    }
  }

  /**
   * Generate random state for OAuth
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Generate random webhook secret
   */
  private generateWebhookSecret(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
}
