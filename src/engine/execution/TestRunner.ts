// ============================================================
// TEST RUNNER — Test Execution Engine
// ============================================================
// Simulates test execution for browser environment.
// Structure ready for backend replacement (Jest, Vitest, etc.).

import { TestResult, TestSuiteResult, ExecutionResult } from './types';
import { VirtualFileSystem } from './VirtualFileSystem';

export class TestRunner {
  /**
   * Run tests in a worktree
   */
  async runTests(
    fs: VirtualFileSystem,
    testPattern?: string
  ): Promise<TestSuiteResult> {
    const startTime = Date.now();
    
    // Find test files
    const allFiles = await fs.listFiles();
    const testFiles = allFiles.filter(f => 
      f.includes('.test.') || 
      f.includes('.spec.') ||
      f.includes('__tests__')
    );

    // If no test files exist, create some based on source files
    if (testFiles.length === 0) {
      await this.generateTests(fs);
      return this.runTests(fs, testPattern);
    }

    // Filter by pattern if provided
    const filteredFiles = testPattern 
      ? testFiles.filter(f => f.includes(testPattern))
      : testFiles;

    // Run each test file
    const allTests: TestResult[] = [];
    
    for (const file of filteredFiles) {
      const content = await fs.readFile(file);
      const tests = this.extractTests(content, file);
      allTests.push(...tests);
    }

    const passed = allTests.filter(t => t.status === 'pass').length;
    const failed = allTests.filter(t => t.status === 'fail').length;
    const skipped = allTests.filter(t => t.status === 'skip').length;
    const duration = Date.now() - startTime;

    return {
      suite: testPattern || 'all',
      tests: allTests,
      passed,
      failed,
      skipped,
      duration
    };
  }

  /**
   * Build project
   */
  async build(fs: VirtualFileSystem): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    // Check if TypeScript config exists
    const hasTsConfig = await fs.fileExists('tsconfig.json');
    if (!hasTsConfig) {
      return {
        success: false,
        output: '',
        error: 'tsconfig.json not found',
        exitCode: 1,
        duration: Date.now() - startTime
      };
    }

    // Simulate build process
    const srcFiles = (await fs.listFiles('src')).filter(f => f.endsWith('.ts'));
    
    if (srcFiles.length === 0) {
      return {
        success: false,
        output: '',
        error: 'No source files found in src/',
        exitCode: 1,
        duration: Date.now() - startTime
      };
    }

    // Simulate successful build
    const duration = Date.now() - startTime + Math.floor(Math.random() * 1000);
    
    return {
      success: true,
      output: `✓ Compiled ${srcFiles.length} files successfully\n  Build completed in ${duration}ms`,
      exitCode: 0,
      duration
    };
  }

  /**
   * Lint project
   */
  async lint(fs: VirtualFileSystem): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    const allFiles = await fs.listFiles();
    const tsFiles = allFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    
    // Simulate linting
    const warnings = Math.floor(Math.random() * 3);
    const errors = 0;
    const duration = Date.now() - startTime + Math.floor(Math.random() * 500);

    const success = errors === 0;
    const output = success 
      ? `✓ Linted ${tsFiles.length} files\n  ${warnings} warning(s), 0 error(s)`
      : `✗ Lint failed\n  ${warnings} warning(s), ${errors} error(s)`;

    return {
      success,
      output,
      exitCode: success ? 0 : 1,
      duration
    };
  }

  /**
   * Execute arbitrary command (simulated)
   */
  async executeCommand(command: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    // Simulate common commands
    if (command.startsWith('npm test') || command === 'jest') {
      return {
        success: true,
        output: 'Test suite passed',
        exitCode: 0,
        duration: Date.now() - startTime + 1000
      };
    }
    
    if (command.startsWith('npm run build') || command === 'tsc') {
      return {
        success: true,
        output: 'Build successful',
        exitCode: 0,
        duration: Date.now() - startTime + 1500
      };
    }

    if (command.startsWith('npm run lint') || command === 'eslint') {
      return {
        success: true,
        output: 'No lint errors',
        exitCode: 0,
        duration: Date.now() - startTime + 500
      };
    }

    // Generic command
    return {
      success: true,
      output: `Command executed: ${command}`,
      exitCode: 0,
      duration: Date.now() - startTime + 200
    };
  }

  // --- Private helpers ---

  private extractTests(content: string, file: string): TestResult[] {
    const tests: TestResult[] = [];
    
    // Extract test names from content
    const testMatches = content.match(/(?:test|it|describe)\s*\(\s*['"]([^'"]+)['"]/g) || [];
    
    for (const match of testMatches) {
      const nameMatch = match.match(/['"]([^'"]+)['"]/);
      if (nameMatch) {
        const testName = nameMatch[1];
        const duration = Math.floor(Math.random() * 100) + 10;
        
        // Simulate test result (90% pass rate)
        const status: TestResult['status'] = Math.random() > 0.1 ? 'pass' : 'fail';
        
        tests.push({
          name: testName,
          status,
          duration,
          error: status === 'fail' ? 'Assertion failed: expected true to be false' : undefined
        });
      }
    }

    // If no tests found, generate some based on file name
    if (tests.length === 0) {
      const baseName = file.split('/').pop()?.replace(/\.(test|spec)\./, '') || 'unknown';
      tests.push(
        {
          name: `${baseName} should work correctly`,
          status: 'pass',
          duration: Math.floor(Math.random() * 50) + 10
        },
        {
          name: `${baseName} should handle edge cases`,
          status: 'pass',
          duration: Math.floor(Math.random() * 50) + 10
        }
      );
    }

    return tests;
  }

  private async generateTests(fs: VirtualFileSystem): Promise<void> {
    // Find source files and generate tests for them
    const allFiles = await fs.listFiles();
    const srcFiles = allFiles.filter(f => 
      f.startsWith('src/') && 
      (f.endsWith('.ts') || f.endsWith('.tsx')) &&
      !f.includes('.test.') &&
      !f.includes('.spec.')
    );

    for (const file of srcFiles) {
      const testFile = file.replace(/\.tsx?$/, '.test.ts');
      const baseName = file.split('/').pop()?.replace(/\.[^.]+$/, '') || 'module';
      
      const testContent = `import { describe, it, expect } from 'vitest';

describe('${baseName}', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });

  it('should handle edge cases', () => {
    const result = null;
    expect(result).toBeFalsy();
  });

  it('should process data', () => {
    const data = [1, 2, 3];
    expect(data.length).toBe(3);
  });
});
`;

      await fs.writeFile(testFile, testContent);
    }
  }
}
