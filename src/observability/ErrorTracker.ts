// ============================================================
// ERROR TRACKER — Track and report errors
// ============================================================

export interface ErrorEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  context?: Record<string, unknown>;
  severity: 'error' | 'critical';
  resolved: boolean;
}

export class ErrorTracker {
  private errors: ErrorEntry[] = [];
  private maxErrors = 1000;
  private onErrorCallbacks: ((error: ErrorEntry) => void)[] = [];

  /**
   * Track an error
   */
  track(
    error: Error | string,
    options: {
      component?: string;
      userId?: string;
      context?: Record<string, unknown>;
      severity?: ErrorEntry['severity'];
    } = {}
  ): ErrorEntry {
    const entry: ErrorEntry = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      component: options.component,
      userId: options.userId,
      context: options.context,
      severity: options.severity || 'error',
      resolved: false,
    };

    this.errors.push(entry);

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Notify callbacks
    this.onErrorCallbacks.forEach((callback) => {
      try {
        callback(entry);
      } catch (e) {
        console.error('Error callback failed:', e);
      }
    });

    // Log to console
    console.error(`[ERROR] ${entry.message}`, entry.context);

    return entry;
  }

  /**
   * Mark error as resolved
   */
  resolve(errorId: string): void {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  /**
   * Get all errors
   */
  getAll(): ErrorEntry[] {
    return [...this.errors];
  }

  /**
   * Get unresolved errors
   */
  getUnresolved(): ErrorEntry[] {
    return this.errors.filter((e) => !e.resolved);
  }

  /**
   * Get errors by severity
   */
  getBySeverity(severity: ErrorEntry['severity']): ErrorEntry[] {
    return this.errors.filter((e) => e.severity === severity);
  }

  /**
   * Get errors by component
   */
  getByComponent(component: string): ErrorEntry[] {
    return this.errors.filter((e) => e.component === component);
  }

  /**
   * Get recent errors
   */
  getRecent(limit: number = 100): ErrorEntry[] {
    return this.errors.slice(-limit).reverse();
  }

  /**
   * Register error callback
   */
  onError(callback: (error: ErrorEntry) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    unresolved: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
  } {
    const bySeverity: Record<string, number> = {};
    const byComponent: Record<string, number> = {};

    this.errors.forEach((error) => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      if (error.component) {
        byComponent[error.component] = (byComponent[error.component] || 0) + 1;
      }
    });

    return {
      total: this.errors.length,
      unresolved: this.getUnresolved().length,
      bySeverity,
      byComponent,
    };
  }

  /**
   * Export errors
   */
  export(): string {
    return JSON.stringify(this.errors, null, 2);
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.track(event.error || event.message, {
      component: 'window',
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.track(event.reason, {
      component: 'promise',
      severity: 'critical',
    });
  });
}
