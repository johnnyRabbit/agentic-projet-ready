# GitHub Integration Guide

This guide explains how to set up and use the GitHub integration feature in the AI Engineering Team platform.

## Overview

The GitHub integration allows you to:
- Connect your GitHub account via OAuth
- Create pull requests directly from the platform
- Manage repositories and branches
- Set up webhooks for real-time updates
- Automatically trigger workflows on GitHub events

## Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the details:
   - **Application name**: AI Engineering Team (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### 2. Configure the Platform

1. Navigate to the **GitHub** page in the sidebar
2. Click "Configure GitHub"
3. Enter your:
   - Client ID
   - Client Secret
   - Redirect URI (must match the callback URL)
4. Click "Save Configuration"

### 3. Connect Your Account

1. Click "Connect GitHub"
2. Authorize the application on GitHub
3. You'll be redirected back to the platform
4. Your repositories will be loaded automatically

## Features

### Repository Management

- View all your repositories
- Select a repository to work with
- See repository details (private/public, default branch)

### Pull Requests

- View all pull requests for selected repository
- Create new pull requests with:
  - Custom title and description
  - Source and target branches
  - Draft mode option
- Merge pull requests directly
- Track PR status (open, merged, closed)

### Webhooks

- Create webhooks for real-time updates
- Subscribe to events:
  - `pull_request` - PR created, updated, merged
  - `issues` - Issues created, updated, closed
  - `push` - Code pushed to repository
  - `check_run` - CI/CD status updates
  - `status` - Commit status changes
- Manage existing webhooks
- Automatic event handling

## API Reference

### GitHubClient

The `GitHubClient` class provides methods to interact with the GitHub API:

```typescript
// Authentication
getAuthorizationUrl(): string
exchangeCodeForToken(code: string): Promise<GitHubToken>
isAuthenticated(): boolean
logout(): void

// User
getCurrentUser(): Promise<GitHubUser>

// Repositories
listRepositories(): Promise<GitHubRepository[]>
getRepository(owner: string, repo: string): Promise<GitHubRepository>

// Pull Requests
createPullRequest(input: CreatePullRequestInput): Promise<GitHubPullRequest>
listPullRequests(owner: string, repo: string): Promise<GitHubPullRequest[]>
getPullRequest(owner: string, repo: string, number: number): Promise<GitHubPullRequest>
mergePullRequest(owner: string, repo: string, number: number): Promise<void>

// Webhooks
createWebhook(owner: string, repo: string, url: string, events: string[]): Promise<GitHubWebhook>
listWebhooks(owner: string, repo: string): Promise<GitHubWebhook[]>
deleteWebhook(owner: string, repo: string, hookId: number): Promise<void>
```

### WebhookHandler

The `WebhookHandler` class processes incoming webhook events:

```typescript
// Register event handlers
on(event: string, handler: WebhookEventHandler): void
off(event: string, handler: WebhookEventHandler): void

// Handle incoming webhook
handleWebhook(event: string, signature: string, payload: string): Promise<void>
```

### Available Events

```typescript
WEBHOOK_EVENTS = {
  // Pull Request Events
  PULL_REQUEST_OPENED: 'pull_request.opened',
  PULL_REQUEST_CLOSED: 'pull_request.closed',
  PULL_REQUEST_MERGED: 'pull_request.merged',
  
  // Issue Events
  ISSUES_OPENED: 'issues.opened',
  ISSUES_CLOSED: 'issues.closed',
  
  // Push Events
  PUSH: 'push',
  
  // Check Run Events
  CHECK_RUN_COMPLETED: 'check_run.completed',
  
  // And more...
}
```

## Webhook Security

All webhooks are secured using HMAC-SHA256 signatures:

1. GitHub sends a `X-Hub-Signature-256` header with each webhook
2. The platform verifies the signature using your client secret
3. Invalid signatures are rejected

## Error Handling

The integration handles common errors:

- **Authentication errors**: Token expired or revoked
- **Rate limiting**: GitHub API rate limits
- **Permission errors**: Insufficient OAuth scopes
- **Network errors**: Connection issues

All errors are displayed in the UI with helpful messages.

## Best Practices

### OAuth Scopes

Request only the scopes you need:
- `repo` - Full control of private repositories
- `workflow` - Update GitHub Actions workflows
- `webhook` - Manage webhooks

### Webhook Events

Subscribe only to events you need to reduce noise:
- For PR automation: `pull_request`
- For issue tracking: `issues`
- For CI/CD: `check_run`, `status`

### Rate Limiting

GitHub API has rate limits:
- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

The platform automatically handles rate limiting with exponential backoff.

## Troubleshooting

### "Configuration Required" Error

**Problem**: GitHub OAuth app not configured

**Solution**: 
1. Create OAuth app on GitHub
2. Enter credentials in the platform
3. Save configuration

### "Authentication Failed" Error

**Problem**: OAuth token invalid or expired

**Solution**:
1. Click "Logout"
2. Click "Connect GitHub"
3. Re-authorize the application

### "Webhook Verification Failed" Error

**Problem**: Webhook signature mismatch

**Solution**:
1. Check that client secret matches
2. Verify webhook URL is correct
3. Recreate the webhook

### Repositories Not Loading

**Problem**: No repositories shown

**Solution**:
1. Check OAuth scopes include `repo`
2. Verify you have access to repositories
3. Click "Refresh" button

## Advanced Usage

### Custom Webhook Handlers

Register custom handlers for specific events:

```typescript
import { useGitHubStore } from './store/githubStore';
import { WEBHOOK_EVENTS } from './engine/github/WebhookHandler';

const { webhookHandler } = useGitHubStore();

webhookHandler.on(WEBHOOK_EVENTS.PULL_REQUEST_OPENED, async (payload) => {
  console.log('PR opened:', payload.pullRequest?.title);
  // Trigger custom workflow
});
```

### Programmatic PR Creation

Create pull requests from code:

```typescript
import { useGitHubStore } from './store/githubStore';

const { createPullRequest } = useGitHubStore();

await createPullRequest(
  'feature/new-feature',
  'main',
  'Add new feature',
  'This PR adds a new feature that...',
  false // not a draft
);
```

## Security Considerations

1. **Never commit client secrets** to version control
2. **Use environment variables** for sensitive data
3. **Rotate secrets regularly** (every 90 days)
4. **Review webhook payloads** before processing
5. **Validate all inputs** from GitHub API

## Future Enhancements

Planned features:
- [ ] GitHub Actions integration
- [ ] Automatic branch creation
- [ ] Code review automation
- [ ] Issue template generation
- [ ] Release management
- [ ] Team collaboration features

## Support

For issues or questions:
- Check the [GitHub API documentation](https://docs.github.com/en/rest)
- Review the [OAuth documentation](https://docs.github.com/en/developers/apps)
- Open an issue on the project repository
