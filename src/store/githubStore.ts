import { create } from 'zustand';
import { GitHubClient } from '../engine/github/GitHubClient';
import { WebhookHandler, WEBHOOK_EVENTS } from '../engine/github/WebhookHandler';
import { 
  GitHubConfig, 
  GitHubUser, 
  GitHubRepository, 
  GitHubPullRequest,
  GitHubWebhook,
  GitHubWebhookPayload
} from '../engine/github/types';

// ============================================================
// GITHUB STORE — State Management for GitHub Integration
// ============================================================

interface GitHubState {
  // Configuration
  config: GitHubConfig | null;
  client: GitHubClient | null;
  webhookHandler: WebhookHandler | null;
  
  // Authentication
  isAuthenticated: boolean;
  user: GitHubUser | null;
  loading: boolean;
  error: string | null;
  
  // Data
  repositories: GitHubRepository[];
  selectedRepository: GitHubRepository | null;
  pullRequests: GitHubPullRequest[];
  webhooks: GitHubWebhook[];
  
  // Actions
  initialize: (config: GitHubConfig) => void;
  login: () => void;
  handleOAuthCallback: (code: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  loadRepositories: () => Promise<void>;
  selectRepository: (repo: GitHubRepository | null) => void;
  loadPullRequests: (state?: 'open' | 'closed' | 'all') => Promise<void>;
  createPullRequest: (
    title: string,
    body: string,
    head: string,
    base: string,
    draft?: boolean
  ) => Promise<GitHubPullRequest>;
  mergePullRequest: (number: number) => Promise<void>;
  loadWebhooks: () => Promise<void>;
  createWebhook: (url: string, events: string[]) => Promise<void>;
  deleteWebhook: (hookId: number) => Promise<void>;
  handleWebhook: (event: string, signature: string, payload: string) => Promise<void>;
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
  // Initial state
  config: null,
  client: null,
  webhookHandler: null,
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  repositories: [],
  selectedRepository: null,
  pullRequests: [],
  webhooks: [],

  // Initialize GitHub client
  initialize: (config: GitHubConfig) => {
    const client = new GitHubClient(config);
    const webhookHandler = new WebhookHandler(config.clientSecret);
    
    // Register default webhook handlers
    webhookHandler.on(WEBHOOK_EVENTS.PULL_REQUEST_OPENED, async (payload) => {
      console.log('PR opened:', payload.pullRequest?.title);
      // Trigger delivery pipeline
    });

    webhookHandler.on(WEBHOOK_EVENTS.PULL_REQUEST_CLOSED, async (payload) => {
      console.log('PR closed:', payload.pullRequest?.title);
    });

    webhookHandler.on(WEBHOOK_EVENTS.ISSUES_OPENED, async (payload) => {
      console.log('Issue opened:', payload.issue?.title);
      // Auto-analyze issue
    });

    set({ 
      config, 
      client, 
      webhookHandler,
      isAuthenticated: client.isAuthenticated()
    });

    // Load user if already authenticated
    if (client.isAuthenticated()) {
      get().loadUser();
      get().loadRepositories();
    }
  },

  // Start OAuth flow
  login: () => {
    const { client } = get();
    if (!client) {
      throw new Error('GitHub client not initialized');
    }

    const authUrl = client.getAuthorizationUrl();
    window.location.href = authUrl;
  },

  // Handle OAuth callback
  handleOAuthCallback: async (code: string) => {
    const { client } = get();
    if (!client) {
      throw new Error('GitHub client not initialized');
    }

    set({ loading: true, error: null });

    try {
      await client.exchangeCodeForToken(code);
      set({ isAuthenticated: true });
      
      await get().loadUser();
      await get().loadRepositories();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Authentication failed',
        isAuthenticated: false 
      });
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: () => {
    const { client } = get();
    if (client) {
      client.logout();
    }
    set({
      isAuthenticated: false,
      user: null,
      repositories: [],
      selectedRepository: null,
      pullRequests: [],
      webhooks: []
    });
  },

  // Load current user
  loadUser: async () => {
    const { client } = get();
    if (!client) return;

    set({ loading: true, error: null });

    try {
      const user = await client.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load user',
        isAuthenticated: false 
      });
    } finally {
      set({ loading: false });
    }
  },

  // Load repositories
  loadRepositories: async () => {
    const { client } = get();
    if (!client) return;

    set({ loading: true, error: null });

    try {
      const repositories = await client.listRepositories();
      set({ repositories });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load repositories'
      });
    } finally {
      set({ loading: false });
    }
  },

  // Select repository
  selectRepository: (repo: GitHubRepository | null) => {
    set({ selectedRepository: repo });
    
    if (repo) {
      get().loadPullRequests();
      get().loadWebhooks();
    } else {
      set({ pullRequests: [], webhooks: [] });
    }
  },

  // Load pull requests
  loadPullRequests: async (state: 'open' | 'closed' | 'all' = 'open') => {
    const { client, selectedRepository } = get();
    if (!client || !selectedRepository) return;

    set({ loading: true, error: null });

    try {
      const pullRequests = await client.listPullRequests(
        selectedRepository.owner,
        selectedRepository.name,
        state
      );
      set({ pullRequests });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load pull requests'
      });
    } finally {
      set({ loading: false });
    }
  },

  // Create pull request
  createPullRequest: async (title, body, head, base, draft = false) => {
    const { client, selectedRepository } = get();
    if (!client || !selectedRepository) {
      throw new Error('No repository selected');
    }

    set({ loading: true, error: null });

    try {
      const pr = await client.createPullRequest({
        owner: selectedRepository.owner,
        repo: selectedRepository.name,
        title,
        body,
        head,
        base,
        draft
      });

      // Reload pull requests
      await get().loadPullRequests();

      return pr;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create pull request'
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Merge pull request
  mergePullRequest: async (number: number) => {
    const { client, selectedRepository } = get();
    if (!client || !selectedRepository) {
      throw new Error('No repository selected');
    }

    set({ loading: true, error: null });

    try {
      await client.mergePullRequest(
        selectedRepository.owner,
        selectedRepository.name,
        number
      );

      // Reload pull requests
      await get().loadPullRequests();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to merge pull request'
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Load webhooks
  loadWebhooks: async () => {
    const { client, selectedRepository } = get();
    if (!client || !selectedRepository) return;

    set({ loading: true, error: null });

    try {
      const webhooks = await client.listWebhooks(
        selectedRepository.owner,
        selectedRepository.name
      );
      set({ webhooks });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load webhooks'
      });
    } finally {
      set({ loading: false });
    }
  },

  // Create webhook
  createWebhook: async (url: string, events: string[]) => {
    const { client, selectedRepository, config } = get();
    if (!client || !selectedRepository || !config) {
      throw new Error('No repository selected');
    }

    set({ loading: true, error: null });

    try {
      await client.createWebhook(
        selectedRepository.owner,
        selectedRepository.name,
        url,
        events,
        config.clientSecret
      );

      // Reload webhooks
      await get().loadWebhooks();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create webhook'
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete webhook
  deleteWebhook: async (hookId: number) => {
    const { client, selectedRepository } = get();
    if (!client || !selectedRepository) {
      throw new Error('No repository selected');
    }

    set({ loading: true, error: null });

    try {
      await client.deleteWebhook(
        selectedRepository.owner,
        selectedRepository.name,
        hookId
      );

      // Reload webhooks
      await get().loadWebhooks();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete webhook'
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Handle incoming webhook
  handleWebhook: async (event: string, signature: string, payload: string) => {
    const { webhookHandler } = get();
    if (!webhookHandler) {
      throw new Error('Webhook handler not initialized');
    }

    const result = await webhookHandler.handleWebhook(event, signature, payload);
    
    if (!result.success) {
      throw new Error(result.error);
    }
  }
}));
