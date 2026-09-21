import { GitHubWebhookPayload } from './types';

// ============================================================
// WEBHOOK HANDLER — Process GitHub Webhook Events
// ============================================================

export type WebhookEventHandler = (payload: GitHubWebhookPayload) => void | Promise<void>;

export class WebhookHandler {
  private handlers: Map<string, WebhookEventHandler[]> = new Map();
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Register event handler
   */
  on(event: string, handler: WebhookEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  /**
   * Remove event handler
   */
  off(event: string, handler: WebhookEventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(
    event: string,
    signature: string,
    payload: string
  ): Promise<{ success: boolean; error?: string }> {
    // Verify signature
    if (!this.verifySignature(signature, payload)) {
      return { success: false, error: 'Invalid signature' };
    }

    try {
      const data: GitHubWebhookPayload = JSON.parse(payload);
      
      // Call all handlers for this event
      const handlers = this.handlers.get(event) || [];
      const allHandlers = [
        ...handlers,
        ...(this.handlers.get('*') || []) // Wildcard handlers
      ];

      for (const handler of allHandlers) {
        await handler(data);
      }

      return { success: true };
    } catch (error) {
      console.error('Webhook handler error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Verify webhook signature
   */
  private async verifySignature(signature: string, payload: string): Promise<boolean> {
    if (!signature || !this.secret) {
      return false;
    }

    // Extract signature algorithm and hash
    const [algorithm, hash] = signature.split('=');
    if (algorithm !== 'sha256') {
      return false;
    }

    // Create HMAC
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.secret);
    const messageData = encoder.encode(payload);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const computedHash = signatureArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedHash === hash;
  }

  /**
   * Get all registered events
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// ============================================================
// Webhook Event Types
// ============================================================

export const WEBHOOK_EVENTS = {
  // Pull Request Events
  PULL_REQUEST_OPENED: 'pull_request.opened',
  PULL_REQUEST_CLOSED: 'pull_request.closed',
  PULL_REQUEST_REOPENED: 'pull_request.reopened',
  PULL_REQUEST_SYNCHRONIZE: 'pull_request.synchronize',
  PULL_REQUEST_REVIEW_REQUESTED: 'pull_request.review_requested',
  PULL_REQUEST_REVIEW_REQUEST_REMOVED: 'pull_request.review_request_removed',
  PULL_REQUEST_READY_FOR_REVIEW: 'pull_request.ready_for_review',
  PULL_REQUEST_LOCKED: 'pull_request.locked',
  PULL_REQUEST_UNLOCKED: 'pull_request.unlocked',
  PULL_REQUEST_ASSIGNED: 'pull_request.assigned',
  PULL_REQUEST_UNASSIGNED: 'pull_request.unassigned',
  PULL_REQUEST_LABELED: 'pull_request.labeled',
  PULL_REQUEST_UNLABELED: 'pull_request.unlabeled',
  PULL_REQUEST_EDITED: 'pull_request.edited',

  // Issue Events
  ISSUES_OPENED: 'issues.opened',
  ISSUES_CLOSED: 'issues.closed',
  ISSUES_REOPENED: 'issues.reopened',
  ISSUES_ASSIGNED: 'issues.assigned',
  ISSUES_UNASSIGNED: 'issues.unassigned',
  ISSUES_LABELED: 'issues.labeled',
  ISSUES_UNLABELED: 'issues.unlabeled',
  ISSUES_EDITED: 'issues.edited',

  // Push Events
  PUSH: 'push',

  // Check Run Events
  CHECK_RUN_CREATED: 'check_run.created',
  CHECK_RUN_COMPLETED: 'check_run.completed',
  CHECK_RUN_REREQUESTED: 'check_run.rerequested',

  // Check Suite Events
  CHECK_SUITE_COMPLETED: 'check_suite.completed',
  CHECK_SUITE_REREQUESTED: 'check_suite.rerequested',

  // Status Events
  STATUS: 'status',

  // Branch Events
  CREATE: 'create',
  DELETE: 'delete',

  // Repository Events
  REPOSITORY_CREATED: 'repository.created',
  REPOSITORY_DELETED: 'repository.deleted',
  REPOSITORY_ARCHIVED: 'repository.archived',
  REPOSITORY_UNARCHIVED: 'repository.unarchived',
  REPOSITORY_EDITED: 'repository.edited',

  // Installation Events
  INSTALLATION_CREATED: 'installation.created',
  INSTALLATION_DELETED: 'installation.deleted',
  INSTALLATION_SUSPEND: 'installation.suspend',
  INSTALLATION_UNSUSPEND: 'installation.unsuspend',

  // Wildcard
  ALL: '*'
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];
