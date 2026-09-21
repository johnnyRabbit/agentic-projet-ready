// ============================================================
// STRUCTURED LOGGER — Centralized Logging System
// ============================================================
// Provides structured logging with levels, context, and
// multiple output targets (console, IndexedDB, remote).

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  agentId?: string;
  taskId?: string;
  projectId?: string;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enablePersistence: boolean;
  enableRemote: boolean;
  maxBufferSize: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  private config: LoggerConfig = {
    level: 'info',
    enableConsole: true,
    enablePersistence: false,
    enableRemote: false,
    maxBufferSize: 1000
  };

  private buffer: LogEntry[] = [];

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, { ...context, error: error?.message });
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    // Check if level is enabled
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      agentId: context?.agentId as string,
      taskId: context?.taskId as string,
      projectId: context?.projectId as string,
      error: context?.error as Error
    };

    // Add to buffer
    this.buffer.push(entry);
    if (this.buffer.length > this.config.maxBufferSize) {
      this.buffer.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Persist to IndexedDB
    if (this.config.enablePersistence) {
      this.persistLog(entry);
    }

    // Send to remote service
    if (this.config.enableRemote) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Output to console with formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? JSON.stringify(entry.context) : '';
    
    const message = `[${timestamp}] ${level} ${entry.message} ${context}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message, entry.error);
        break;
    }
  }

  /**
   * Persist log to IndexedDB
   */
  private async persistLog(entry: LogEntry): Promise<void> {
    // TODO: Implement IndexedDB persistence
    // This would require importing the database module
    // For now, just log to console
    console.debug('Log persisted:', entry);
  }

  /**
   * Send log to remote service
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    // TODO: Implement remote logging (e.g., Sentry, LogRocket)
    // For now, just log to console
    console.debug('Log sent to remote:', entry);
  }

  /**
   * Get all buffered logs
   */
  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  /**
   * Clear the log buffer
   */
  clearBuffer(): void {
    this.buffer = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.buffer, null, 2);
  }

  /**
   * Filter logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.buffer.filter(entry => entry.level === level);
  }

  /**
   * Filter logs by context
   */
  getLogsByContext(key: string, value: unknown): LogEntry[] {
    return this.buffer.filter(entry => 
      entry.context && entry.context[key] === value
    );
  }
}

// Singleton instance
export const logger = new Logger();

// Configure with defaults
logger.configure({
  level: 'info',
  enableConsole: true,
  enablePersistence: false,
  enableRemote: false,
  maxBufferSize: 1000
});
