// ============================================================
// GIT MANAGER — Worktree & Version Control
// ============================================================
// Simulates git operations for browser environment.
// Structure ready for backend replacement (simple-git, isomorphic-git).

import { Worktree, GitCommit, GitStatus } from './types';
import { VirtualFileSystem } from './VirtualFileSystem';

export class GitManager {
  private worktrees: Map<string, Worktree> = new Map();
  private fileSystems: Map<string, VirtualFileSystem> = new Map();

  /**
   * Create a new worktree (isolated workspace)
   */
  async createWorktree(
    id: string,
    baseBranch: string,
    newBranch: string,
    baseWorktreeId?: string
  ): Promise<Worktree> {
    // Get base filesystem or create empty one
    let baseFs: VirtualFileSystem;
    if (baseWorktreeId && this.fileSystems.get(baseWorktreeId)) {
      const existingFs = this.fileSystems.get(baseWorktreeId);
      if (!existingFs) throw new Error('Base worktree not found');
      baseFs = existingFs.clone();
    } else {
      baseFs = new VirtualFileSystem();
      // Initialize with basic project structure
      await this.initializeProjectStructure(baseFs);
    }

    const worktree: Worktree = {
      id,
      path: `/worktrees/${id}`,
      branch: newBranch,
      baseBranch,
      createdAt: new Date().toISOString(),
      files: {
        name: 'root',
        type: 'directory',
        children: new Map(),
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      commits: [],
    };

    this.worktrees.set(id, worktree);
    this.fileSystems.set(id, baseFs);

    return worktree;
  }

  /**
   * Get worktree by ID
   */
  async getWorktree(id: string): Promise<Worktree | null> {
    return this.worktrees.get(id) || null;
  }

  /**
   * List all worktrees
   */
  async listWorktrees(): Promise<Worktree[]> {
    return Array.from(this.worktrees.values());
  }

  /**
   * Delete worktree
   */
  async deleteWorktree(id: string): Promise<void> {
    this.worktrees.delete(id);
    this.fileSystems.delete(id);
  }

  /**
   * Get filesystem for a worktree
   */
  getFileSystem(worktreeId: string): VirtualFileSystem | null {
    return this.fileSystems.get(worktreeId) || null;
  }

  /**
   * Commit changes in worktree
   */
  async commit(worktreeId: string, message: string, author: string): Promise<GitCommit> {
    const worktree = this.worktrees.get(worktreeId);
    const fs = this.fileSystems.get(worktreeId);

    if (!worktree || !fs) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }

    // Get all files
    const allFiles = await fs.listFiles();

    // Generate commit hash
    const hash = this.generateHash();

    const commit: GitCommit = {
      hash,
      message,
      author,
      timestamp: new Date().toISOString(),
      files: allFiles,
    };

    worktree.commits.push(commit);

    return commit;
  }

  /**
   * Get git status for worktree
   */
  async getStatus(worktreeId: string): Promise<GitStatus> {
    const worktree = this.worktrees.get(worktreeId);
    if (!worktree) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }

    // Simulate status (in real implementation, would compare with last commit)
    const fs = this.fileSystems.get(worktreeId);
    const allFiles = fs ? await fs.listFiles() : [];

    return {
      branch: worktree.branch,
      modified: [],
      added: allFiles.slice(-3), // Last 3 files as "added"
      deleted: [],
      untracked: [],
    };
  }

  /**
   * Get commit history
   */
  async getHistory(worktreeId: string): Promise<GitCommit[]> {
    const worktree = this.worktrees.get(worktreeId);
    if (!worktree) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }
    return [...worktree.commits].reverse();
  }

  /**
   * Get diff between commits (simulated)
   */
  async getDiff(worktreeId: string, _fromHash?: string, _toHash?: string): Promise<string> {
    const worktree = this.worktrees.get(worktreeId);
    if (!worktree) {
      throw new Error(`Worktree not found: ${worktreeId}`);
    }

    // Simulate diff output
    const commits = worktree.commits;
    if (commits.length === 0) {
      return 'No commits yet';
    }

    const lastCommit = commits[commits.length - 1];
    return `diff --git a/example.ts b/example.ts
--- a/example.ts
+++ b/example.ts
@@ -1,3 +1,5 @@
 // Example file
+// Added in commit ${lastCommit.hash.substring(0, 7)}
+// ${lastCommit.message}
 
 function example() {
   return true;
 }`;
  }

  // --- Private helpers ---

  private async initializeProjectStructure(fs: VirtualFileSystem): Promise<void> {
    // Create basic project structure
    await fs.writeFile(
      'package.json',
      JSON.stringify(
        {
          name: 'project',
          version: '1.0.0',
          scripts: {
            test: 'jest',
            build: 'tsc',
            lint: 'eslint .',
          },
        },
        null,
        2
      )
    );

    await fs.writeFile('README.md', '# Project\n\nAutonomous AI Engineering Team project.');

    await fs.writeFile(
      'src/index.ts',
      `// Main entry point
export function main() {
  console.log('Hello from AI Engineering Team');
}
`
    );

    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            strict: true,
          },
        },
        null,
        2
      )
    );
  }

  private generateHash(): string {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
}
