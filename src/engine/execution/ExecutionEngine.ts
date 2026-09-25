interface FileTree {
  [name: string]: { type: 'file'; path: string } | { type: 'directory'; children: FileTree };
}

// ============================================================
// EXECUTION ENGINE — Main Implementation
// ============================================================
// Integrates VirtualFileSystem, GitManager, and TestRunner.
// Provides unified interface for code execution.

import {
  ExecutionEngine as IExecutionEngine,
  Worktree,
  GitCommit,
  GitStatus,
  ExecutionResult,
  TestSuiteResult,
} from './types';
import { GitManager } from './GitManager';
import { TestRunner } from './TestRunner';

export class ExecutionEngine implements IExecutionEngine {
  private gitManager: GitManager;
  private testRunner: TestRunner;

  constructor() {
    this.gitManager = new GitManager();
    this.testRunner = new TestRunner();
  }

  // --- File Operations ---

  async readFile(worktreeId: string, path: string): Promise<string> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    return fs.readFile(path);
  }

  async writeFile(worktreeId: string, path: string, content: string): Promise<void> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    await fs.writeFile(path, content);
  }

  async deleteFile(worktreeId: string, path: string): Promise<void> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    await fs.deleteFile(path);
  }

  async listFiles(worktreeId: string, path?: string): Promise<string[]> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    return fs.listFiles(path);
  }

  async fileExists(worktreeId: string, path: string): Promise<boolean> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    return fs.fileExists(path);
  }

  // --- Git Operations ---

  async createWorktree(id: string, baseBranch: string, newBranch: string): Promise<Worktree> {
    return this.gitManager.createWorktree(id, baseBranch, newBranch);
  }

  async getWorktree(id: string): Promise<Worktree | null> {
    return this.gitManager.getWorktree(id);
  }

  async listWorktrees(): Promise<Worktree[]> {
    return this.gitManager.listWorktrees();
  }

  async deleteWorktree(id: string): Promise<void> {
    await this.gitManager.deleteWorktree(id);
  }

  async commit(worktreeId: string, message: string, author: string): Promise<GitCommit> {
    return this.gitManager.commit(worktreeId, message, author);
  }

  async getStatus(worktreeId: string): Promise<GitStatus> {
    return this.gitManager.getStatus(worktreeId);
  }

  // --- Execution ---

  async executeCommand(worktreeId: string, command: string): Promise<ExecutionResult> {
    return this.testRunner.executeCommand(command);
  }

  async runTests(worktreeId: string, testPattern?: string): Promise<TestSuiteResult> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    return this.testRunner.runTests(fs, testPattern);
  }

  async build(worktreeId: string): Promise<ExecutionResult> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    return this.testRunner.build(fs);
  }

  async lint(worktreeId: string): Promise<ExecutionResult> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    return this.testRunner.lint(fs);
  }

  // --- Repository ---

  async cloneRepository(url: string, _targetPath: string): Promise<Worktree> {
    // Simulate cloning by creating a worktree with basic structure
    const id = `clone-${Date.now()}`;
    const worktree = await this.gitManager.createWorktree(id, 'main', 'main');

    const fs = this.gitManager.getFileSystem(id);
    if (fs) {
      // Add some sample files to simulate a cloned repo
      await fs.writeFile(
        'package.json',
        JSON.stringify(
          {
            name: 'cloned-repo',
            version: '1.0.0',
            description: `Cloned from ${url}`,
          },
          null,
          2
        )
      );

      await fs.writeFile('README.md', `# Cloned Repository\n\nSource: ${url}`);
    }

    return worktree;
  }

  async initializeRepository(name: string): Promise<Worktree> {
    const id = `repo-${Date.now()}`;
    const worktree = await this.gitManager.createWorktree(id, 'main', 'main');

    const fs = this.gitManager.getFileSystem(id);
    if (fs) {
      await fs.writeFile(
        'package.json',
        JSON.stringify(
          {
            name,
            version: '0.1.0',
            private: true,
          },
          null,
          2
        )
      );

      await fs.writeFile('README.md', `# ${name}\n\nNew repository created by AI Engineering Team`);

      await fs.writeFile(
        '.gitignore',
        `node_modules/
dist/
.env
*.log
`
      );
    }

    return worktree;
  }

  // --- Advanced Operations ---

  /**
   * Get file tree structure
   */
  async getFileTree(worktreeId: string): Promise<FileTree> {
    const fs = this.gitManager.getFileSystem(worktreeId);
    if (!fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }

    const files = await fs.listFiles();
    const directories = new Set(files.filter((path) => fs.getNode(path)?.type === 'directory'));
    return this.buildTree(files, directories);
  }

  /**
   * Get diff between current state and last commit
   */
  async getDiff(worktreeId: string): Promise<string> {
    return this.gitManager.getDiff(worktreeId);
  }

  /**
   * Get commit history
   */
  async getHistory(worktreeId: string): Promise<GitCommit[]> {
    return this.gitManager.getHistory(worktreeId);
  }

  // --- Private helpers ---

  private buildTree(files: string[], directories: Set<string>): FileTree {
    const tree: FileTree = Object.create(null);

    for (const file of files) {
      const parts = file.split('/');
      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1 && !directories.has(file)) {
          // File
          current[part] = { type: 'file', path: file };
        } else {
          // Directory
          if (!current[part]) {
            current[part] = { type: 'directory', children: Object.create(null) };
          }
          const node = current[part];
          if (node.type !== 'directory') throw new Error(`Not a directory: ${part}`);
          current = node.children;
        }
      }
    }

    return tree;
  }
}
