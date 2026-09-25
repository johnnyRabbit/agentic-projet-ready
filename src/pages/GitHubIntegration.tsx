import { useState, useEffect } from 'react';
import { useGitHubStore } from '../store/githubStore';
import {
  Github,
  LogIn,
  LogOut,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export function GitHubIntegration() {
  const {
    config,
    isAuthenticated,
    user,
    loading,
    error,
    repositories,
    selectedRepository,
    pullRequests,
    webhooks,
    initialize,
    login,
    logout,
    loadRepositories,
    selectRepository,
    loadPullRequests,
    loadWebhooks,
    createWebhook,
    deleteWebhook,
  } = useGitHubStore();

  const [showConfig, setShowConfig] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState('http://localhost:3000/github/callback');
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState(['pull_request', 'issues', 'push']);

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Handle OAuth callback
      useGitHubStore
        .getState()
        .handleOAuthCallback(code)
        .then(() => {
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  // Initialize with config from localStorage
  useEffect(() => {
    const storedConfig = localStorage.getItem('github_config');
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      initialize(config);
      setClientId(config.clientId);
      setClientSecret(config.clientSecret);
      setRedirectUri(config.redirectUri);
    }
  }, [initialize]);

  const handleSaveConfig = () => {
    const newConfig = {
      clientId,
      clientSecret,
      redirectUri,
      scope: 'repo workflow webhook',
    };

    localStorage.setItem('github_config', JSON.stringify(newConfig));
    initialize(newConfig);
    setShowConfig(false);
  };

  const handleCreateWebhook = async () => {
    try {
      await createWebhook(webhookUrl, webhookEvents);
      setShowWebhookForm(false);
      setWebhookUrl('');
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const handleDeleteWebhook = async (hookId: number) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      await deleteWebhook(hookId);
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  if (!config) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Github size={24} className="text-indigo-400" />
              GitHub Integration
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Connect to GitHub to create PRs and receive webhook events
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="text-center py-12">
            <Github size={48} className="mx-auto text-slate-500 mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Configuration Required</h2>
            <p className="text-slate-400 mb-6">
              Please configure your GitHub OAuth app credentials to continue
            </p>
            <button
              onClick={() => setShowConfig(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Configure GitHub
            </button>
          </div>
        </div>

        {showConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-lg font-semibold text-white mb-4">GitHub OAuth Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Client ID</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Your GitHub OAuth App Client ID"
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Client Secret</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Your GitHub OAuth App Client Secret"
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Redirect URI</label>
                  <input
                    type="text"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                    placeholder="http://localhost:3000/github/callback"
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="bg-dark-700 rounded-lg p-3 border border-dark-500">
                  <p className="text-xs text-slate-400 mb-2">Setup Instructions:</p>
                  <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside">
                    <li>Go to GitHub Settings → Developer settings → OAuth Apps</li>
                    <li>Click "New OAuth App"</li>
                    <li>
                      Set Authorization callback URL to:{' '}
                      <code className="text-indigo-400">{redirectUri}</code>
                    </li>
                    <li>Copy Client ID and Client Secret here</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveConfig}
                    disabled={!clientId || !clientSecret}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Save Configuration
                  </button>
                  <button
                    onClick={() => setShowConfig(false)}
                    className="px-4 py-2.5 bg-dark-600 hover:bg-dark-500 text-white rounded-lg text-sm font-medium transition-colors border border-dark-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Github size={24} className="text-indigo-400" />
            GitHub Integration
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage repositories, pull requests, and webhooks
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full" />
                <span className="text-sm text-white">{user.login}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-dark-600 hover:bg-dark-500 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-dark-400"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogIn size={16} />
            {loading ? 'Connecting...' : 'Connect GitHub'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-danger" />
            <span className="text-sm text-danger">{error}</span>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="space-y-6">
          {/* Repository Selection */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Repositories</h2>
              <button
                onClick={loadRepositories}
                disabled={loading}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {repositories.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => selectRepository(repo)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedRepository?.id === repo.id
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-dark-700 border-dark-500 hover:border-indigo-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white font-medium">{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs bg-dark-600 text-slate-400 px-1.5 py-0.5 rounded">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{repo.fullName}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pull Requests */}
          {selectedRepository && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Pull Requests — {selectedRepository.name}
                </h2>
                <button
                  onClick={() => loadPullRequests()}
                  disabled={loading}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              <div className="space-y-2">
                {pullRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No pull requests found</p>
                ) : (
                  pullRequests.map((pr) => (
                    <div key={pr.id} className="bg-dark-700 rounded-lg p-3 border border-dark-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500">#{pr.number}</span>
                            <span className="text-sm text-white font-medium">{pr.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>
                              {pr.head.ref} → {pr.base.ref}
                            </span>
                            <span>•</span>
                            <span>{pr.additions ?? '—'} additions</span>
                            <span>•</span>
                            <span>{pr.deletions ?? '—'} deletions</span>
                          </div>
                        </div>
                        <a
                          href={pr.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          View
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            pr.state === 'open'
                              ? 'bg-success/20 text-success'
                              : pr.state === 'merged'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-danger/20 text-danger'
                          }`}
                        >
                          {pr.state}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Webhooks */}
          {selectedRepository && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">
                  Webhooks — {selectedRepository.name}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadWebhooks}
                    disabled={loading}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowWebhookForm(true)}
                    className="flex items-center gap-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    <Plus size={14} />
                    Add Webhook
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {webhooks.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No webhooks configured</p>
                ) : (
                  webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="bg-dark-700 rounded-lg p-3 border border-dark-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-white font-medium">{webhook.name}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                webhook.active
                                  ? 'bg-success/20 text-success'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}
                            >
                              {webhook.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mb-1">{webhook.config.url}</div>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event) => (
                              <span
                                key={event}
                                className="text-xs bg-dark-600 text-slate-300 px-2 py-0.5 rounded"
                              >
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="text-xs text-danger hover:text-danger/80 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {showWebhookForm && (
                <div className="mt-4 bg-dark-700 rounded-lg p-4 border border-dark-500">
                  <h3 className="text-sm font-medium text-white mb-3">Create Webhook</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1.5">Payload URL</label>
                      <input
                        type="text"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-app.com/webhooks/github"
                        className="w-full bg-dark-600 border border-dark-500 rounded-lg p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1.5">Events</label>
                      <div className="flex flex-wrap gap-2">
                        {['pull_request', 'issues', 'push', 'check_run', 'status'].map((event) => (
                          <label
                            key={event}
                            className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={webhookEvents.includes(event)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWebhookEvents([...webhookEvents, event]);
                                } else {
                                  setWebhookEvents(webhookEvents.filter((e) => e !== event));
                                }
                              }}
                              className="rounded"
                            />
                            {event}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateWebhook}
                        disabled={!webhookUrl}
                        className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Create Webhook
                      </button>
                      <button
                        onClick={() => setShowWebhookForm(false)}
                        className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded text-sm transition-colors border border-dark-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
