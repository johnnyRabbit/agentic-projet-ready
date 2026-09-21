// ============================================================
// EXECUTION ENGINE — Real Code Execution Layer
// ============================================================
// Abstracts code execution, file operations, and git management.
// Currently uses virtual filesystem (browser-compatible).
// Designed to be replaced with real backend (Docker, Node.js).

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Map<string, FileNode>;
  createdAt: string;
  modifiedAt: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
  duration: number;
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  output?: string;
}

export interface TestSuiteResult {
  suite: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export interface GitStatus {
  branch: string;
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  files: string[];
}

export interface Worktree {
  id: string;
  path: string;
  branch: string;
  baseBranch: string;
  createdAt: string;
  files: FileNode;
  commits: GitCommit[];
}

export interface ExecutionEngine {
  // File operations
  readFile(worktreeId: string, path: string): Promise<string>;
  writeFile(worktreeId: string, path: string, content: string): Promise<void>;
  deleteFile(worktreeId: string, path: string): Promise<void>;
  listFiles(worktreeId: string, path?: string): Promise<string[]>;
  fileExists(worktreeId: string, path: string): Promise<boolean>;

  // Git operations
  createWorktree(id: string, baseBranch: string, newBranch: string): Promise<Worktree>;
  getWorktree(id: string): Promise<Worktree | null>;
  listWorktrees(): Promise<Worktree[]>;
  deleteWorktree(id: string): Promise<void>;
  commit(worktreeId: string, message: string, author: string): Promise<GitCommit>;
  getStatus(worktreeId: string): Promise<GitStatus>;

  // Execution
  executeCommand(worktreeId: string, command: string): Promise<ExecutionResult>;
  runTests(worktreeId: string, testPattern?: string): Promise<TestSuiteResult>;
  build(worktreeId: string): Promise<ExecutionResult>;
  lint(worktreeId: string): Promise<ExecutionResult>;

  // Repository
  cloneRepository(url: string, targetPath: string): Promise<Worktree>;
  initializeRepository(name: string): Promise<Worktree>;
}
