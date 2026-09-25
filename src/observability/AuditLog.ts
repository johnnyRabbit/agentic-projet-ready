import { logger } from '../utils/logger';
// ============================================================
// AUDIT LOG — Track all system actions
// ============================================================

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, unknown>;
}

export class AuditLog {
  private entries: AuditEntry[] = [];
  private maxEntries = 10000;

  /**
   * Log an action
   */
  log(
    action: string,
    resource: string,
    options: {
      userId?: string;
      resourceId?: string;
      details?: Record<string, unknown>;
      severity?: AuditEntry['severity'];
      metadata?: Record<string, unknown>;
    } = {}
  ): AuditEntry {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: options.userId,
      action,
      resource,
      resourceId: options.resourceId,
      details: options.details,
      severity: options.severity || 'info',
      metadata: options.metadata,
    };

    this.entries.push(entry);

    // Keep only last N entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    // Log to console for debugging
    logger.debug(`[AUDIT] ${entry.action} on ${entry.resource}`, entry.details);

    return entry;
  }

  /**
   * Get all audit entries
   */
  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by user
   */
  getByUser(userId: string): AuditEntry[] {
    return this.entries.filter((e) => e.userId === userId);
  }

  /**
   * Get entries by resource
   */
  getByResource(resource: string): AuditEntry[] {
    return this.entries.filter((e) => e.resource === resource);
  }

  /**
   * Get entries by action
   */
  getByAction(action: string): AuditEntry[] {
    return this.entries.filter((e) => e.action === action);
  }

  /**
   * Get entries by severity
   */
  getBySeverity(severity: AuditEntry['severity']): AuditEntry[] {
    return this.entries.filter((e) => e.severity === severity);
  }

  /**
   * Get entries in time range
   */
  getByTimeRange(start: Date, end: Date): AuditEntry[] {
    return this.entries.filter((e) => {
      const entryDate = new Date(e.timestamp);
      return entryDate >= start && entryDate <= end;
    });
  }

  /**
   * Get recent entries
   */
  getRecent(limit: number = 100): AuditEntry[] {
    return this.entries.slice(-limit).reverse();
  }

  /**
   * Export audit log
   */
  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Clear audit log
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byAction: Record<string, number>;
    byResource: Record<string, number>;
  } {
    const bySeverity: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const byResource: Record<string, number> = {};

    this.entries.forEach((entry) => {
      bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
      byResource[entry.resource] = (byResource[entry.resource] || 0) + 1;
    });

    return {
      total: this.entries.length,
      bySeverity,
      byAction,
      byResource,
    };
  }
}

// Singleton instance
export const auditLog = new AuditLog();
