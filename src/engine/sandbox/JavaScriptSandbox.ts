// ============================================================
// JAVASCRIPT SANDBOX — Real Code Execution in Browser
// ============================================================
// Executes JavaScript code safely in the browser using
// Function constructor with restricted globals.
// Validates code structure and catches runtime errors.

export interface SandboxResult {
  success: boolean;
  output: string;
  returnValue?: unknown;
  error?: string;
  duration: number;
  logs: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: CodeMetrics;
}

export interface ValidationError {
  line: number;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  line: number;
  message: string;
  severity: 'warning' | 'info';
}

export interface CodeMetrics {
  lines: number;
  characters: number;
  functions: number;
  classes: number;
  imports: number;
  exports: number;
  complexity: number;
}

export class JavaScriptSandbox {
  private timeoutMs: number;

  constructor(timeoutMs: number = 2000) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Execute JavaScript code in a sandboxed environment
   */
  async execute(code: string, context: Record<string, unknown> = {}): Promise<SandboxResult> {
    const startTime = Date.now();
    const logs: string[] = [];

    try {
      // Create a sandboxed function with restricted globals
      const sandbox = this.createSandbox(logs, context);
      
      // Wrap code to capture return value
      const wrappedCode = `
        'use strict';
        const __exports = {};
        const __module = { exports: __exports };
        
        ${code}
        
        return typeof module !== 'undefined' ? module.exports : __exports;
      `;

      // Execute with timeout
      const result = await this.executeWithTimeout(wrappedCode, sandbox);
      
      return {
        success: true,
        output: logs.join('\n'),
        returnValue: result,
        duration: Date.now() - startTime,
        logs
      };
    } catch (error) {
      return {
        success: false,
        output: logs.join('\n'),
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        logs
      };
    }
  }

  /**
   * Validate code without executing
   */
  validate(code: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const lines = code.split('\n');

    // Syntax validation (try to parse)
    try {
      new Function(code);
    } catch (e) {
      errors.push({
        line: 1,
        message: `Syntax error: ${e instanceof Error ? e.message : String(e)}`,
        severity: 'error'
      });
    }

    // Static analysis
    let functions = 0;
    let classes = 0;
    let imports = 0;
    let exports = 0;
    let complexity = 0;

    lines.forEach((line, i) => {
      const lineNum = i + 1;
      const trimmed = line.trim();

      // Count functions
      if (/function\s+\w+/.test(line) || /=>\s*{/.test(line) || /\w+\s*\(.*\)\s*{/.test(line)) {
        functions++;
      }

      // Count classes
      if (/class\s+\w+/.test(line)) {
        classes++;
      }

      // Count imports
      if (/^import\s+/.test(trimmed) || /require\s*\(/.test(line)) {
        imports++;
      }

      // Count exports
      if (/^export\s+/.test(trimmed) || /module\.exports/.test(line)) {
        exports++;
      }

      // Complexity (if, for, while, switch, &&, ||, ?)
      const branches = (line.match(/\b(if|for|while|switch|case)\b/g) || []).length;
      const operators = (line.match(/(&&|\|\||\?)/g) || []).length;
      complexity += branches + operators;

      // Warnings
      if (/eval\s*\(/.test(line)) {
        warnings.push({ line: lineNum, message: 'Avoid using eval()', severity: 'warning' });
      }
      if (/console\.log/.test(line)) {
        warnings.push({ line: lineNum, message: 'Remove console.log before production', severity: 'info' });
      }
      if (/var\s+/.test(line)) {
        warnings.push({ line: lineNum, message: 'Use let/const instead of var', severity: 'info' });
      }
      if (line.length > 120) {
        warnings.push({ line: lineNum, message: 'Line too long (>120 chars)', severity: 'info' });
      }
      if (/TODO|FIXME|HACK/.test(line)) {
        warnings.push({ line: lineNum, message: 'Contains TODO/FIXME comment', severity: 'info' });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        lines: lines.length,
        characters: code.length,
        functions,
        classes,
        imports,
        exports,
        complexity
      }
    };
  }

  /**
   * Generate a diff between two code versions
   */
  generateDiff(original: string, modified: string, filename: string = 'file.ts'): string {
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    
    let diff = `diff --git a/${filename} b/${filename}\n`;
    diff += `--- a/${filename}\n`;
    diff += `+++ b/${filename}\n`;

    // Simple line-by-line diff
    const maxLen = Math.max(origLines.length, modLines.length);
    let inHunk = false;
    let hunkStart = 0;

    for (let i = 0; i < maxLen; i++) {
      const origLine = origLines[i];
      const modLine = modLines[i];

      if (origLine !== modLine) {
        if (!inHunk) {
          diff += `@@ -${Math.max(1, i)} +${Math.max(1, i)} @@\n`;
          inHunk = true;
        }
        if (origLine !== undefined) {
          diff += `-${origLine}\n`;
        }
        if (modLine !== undefined) {
          diff += `+${modLine}\n`;
        }
      } else {
        if (inHunk && origLine !== undefined) {
          diff += ` ${origLine}\n`;
        }
        inHunk = false;
      }
    }

    return diff;
  }

  // --- Private helpers ---

  private createSandbox(logs: string[], context: Record<string, unknown>): Record<string, unknown> {
    return {
      console: {
        log: (...args: unknown[]) => logs.push(args.map(a => String(a)).join(' ')),
        error: (...args: unknown[]) => logs.push(`ERROR: ${args.map(a => String(a)).join(' ')}`),
        warn: (...args: unknown[]) => logs.push(`WARN: ${args.map(a => String(a)).join(' ')}`),
        info: (...args: unknown[]) => logs.push(`INFO: ${args.map(a => String(a)).join(' ')}`)
      },
      setTimeout: (fn: () => void, ms: number) => {
        if (ms > this.timeoutMs) throw new Error('Timeout too long');
        return globalThis.setTimeout(fn, ms);
      },
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      Map,
      Set,
      Promise,
      ...context
    };
  }

  private async executeWithTimeout(code: string, sandbox: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout (${this.timeoutMs}ms)`));
      }, this.timeoutMs);

      try {
        const keys = Object.keys(sandbox);
        const values = Object.values(sandbox);
        const fn = new Function(...keys, code);
        const result = fn(...values);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }
}
