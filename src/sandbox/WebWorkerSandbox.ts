// ============================================================
// WEB WORKER SANDBOX — Real Isolated Code Execution
// ============================================================
// Executes JavaScript code in a real Web Worker for true
// isolation. The worker runs in a separate thread with its
// own global scope, preventing interference with the main app.

export interface WorkerSandboxResult {
  success: boolean;
  output: string;
  returnValue?: unknown;
  error?: string;
  duration: number;
  logs: string[];
}

// Worker code as string (will be created as Blob URL)
const WORKER_CODE = `
// Capture console output
const logs = [];
const originalConsole = { ...self.console };

self.console = {
  log: (...args) => {
    logs.push({ type: 'log', data: args.map(String).join(' ') });
    self.postMessage({ type: 'log', data: args.map(String).join(' ') });
  },
  error: (...args) => {
    logs.push({ type: 'error', data: args.map(String).join(' ') });
    self.postMessage({ type: 'log', data: 'ERROR: ' + args.map(String).join(' ') });
  },
  warn: (...args) => {
    logs.push({ type: 'warn', data: args.map(String).join(' ') });
    self.postMessage({ type: 'log', data: 'WARN: ' + args.map(String).join(' ') });
  },
  info: (...args) => {
    logs.push({ type: 'info', data: args.map(String).join(' ') });
    self.postMessage({ type: 'log', data: 'INFO: ' + args.map(String).join(' ') });
  }
};

self.onmessage = async (e) => {
  const { code, timeout } = e.data;
  const startTime = Date.now();
  
  try {
    // Set up timeout
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Execution timeout (' + timeout + 'ms)'));
      }, timeout);
    });
    
    // Execute code
    const executionPromise = (async () => {
      // Create function with restricted globals
      const fn = new Function('console', 'setTimeout', 'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Error', 'Map', 'Set', 'Promise', code);
      
      // Execute with sandboxed globals
      const result = fn(
        self.console,
        self.setTimeout,
        Math, Date, JSON, Array, Object, String, Number, Boolean, RegExp, Error, Map, Set, Promise
      );
      
      return result;
    })();
    
    const result = await Promise.race([executionPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    
    self.postMessage({
      type: 'result',
      success: true,
      returnValue: result,
      logs: logs,
      duration: Date.now() - startTime
    });
  } catch (error) {
    self.postMessage({
      type: 'result',
      success: false,
      error: error.message || String(error),
      logs: logs,
      duration: Date.now() - startTime
    });
  }
};
`;

export class WebWorkerSandbox {
  private workerUrl: string | null = null;
  private timeoutMs: number;

  constructor(timeoutMs: number = 5000) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Initialize the worker (create Blob URL)
   */
  async initialize(): Promise<void> {
    if (this.workerUrl) return;

    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    this.workerUrl = URL.createObjectURL(blob);
  }

  /**
   * Execute code in isolated Web Worker
   */
  async execute(code: string): Promise<WorkerSandboxResult> {
    await this.initialize();

    if (!this.workerUrl) {
      throw new Error('Worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerUrl!);
      const startTime = Date.now();
      const logs: string[] = [];

      // Set up timeout for the entire operation
      const operationTimeout = setTimeout(() => {
        worker.terminate();
        resolve({
          success: false,
          output: logs.join('\n'),
          error: `Operation timeout (${this.timeoutMs}ms)`,
          duration: Date.now() - startTime,
          logs
        });
      }, this.timeoutMs + 1000); // Extra buffer

      worker.onmessage = (e) => {
        const { type, data } = e.data;

        if (type === 'log') {
          logs.push(data);
        } else if (type === 'result') {
          clearTimeout(operationTimeout);
          worker.terminate();

          resolve({
            success: e.data.success,
            output: logs.join('\n'),
            returnValue: e.data.returnValue,
            error: e.data.error,
            duration: e.data.duration,
            logs
          });
        }
      };

      worker.onerror = (error) => {
        clearTimeout(operationTimeout);
        worker.terminate();

        resolve({
          success: false,
          output: logs.join('\n'),
          error: error.message || 'Worker error',
          duration: Date.now() - startTime,
          logs
        });
      };

      // Send code to worker
      worker.postMessage({ code, timeout: this.timeoutMs });
    });
  }

  /**
   * Execute multiple code snippets sequentially
   */
  async executeBatch(codes: string[]): Promise<WorkerSandboxResult[]> {
    const results: WorkerSandboxResult[] = [];

    for (const code of codes) {
      const result = await this.execute(code);
      results.push(result);
    }

    return results;
  }

  /**
   * Clean up worker resources
   */
  cleanup(): void {
    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }
  }
}

// Singleton instance
export const webWorkerSandbox = new WebWorkerSandbox();
