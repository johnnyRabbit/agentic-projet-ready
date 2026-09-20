# Phase 2: Real Execution Layer

## Overview

Phase 2 implements the execution layer that allows agents to actually write code, run tests, and manage git repositories. Currently uses a virtual filesystem (browser-compatible) with architecture ready for backend replacement.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 EXECUTION DASHBOARD UI                        │
│  (File Browser • Editor • Test Runner • Git Status)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXECUTION ENGINE                              │
│  (Unified interface for all execution operations)           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Virtual File  │  │ Git Manager  │  │ Test Runner  │      │
│  │   System     │  │              │  │              │      │
│  │              │  │ • Worktrees  │  │ • Run tests  │      │
│  │ • Read/Write │  │ • Commits    │  │ • Build      │      │
│  │ • Delete     │  │ • Status     │  │ • Lint       │      │
│  │ • List       │  │ • History    │  │ • Commands   │      │
│  │ • Clone      │  │ • Diff       │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  Currently: In-Memory (Browser)│
              │  Future: Docker + Node.js      │
              └───────────────────────────────┘
```

## Components

### 1. Virtual File System (`src/engine/execution/VirtualFileSystem.ts`)

In-memory filesystem that simulates real file operations.

**Features:**
- Read/write/delete files
- Create directories automatically
- List files recursively
- Clone filesystem (for worktrees)
- Export/import (JSON serialization)
- Size calculation

**API:**
```typescript
readFile(path: string): Promise<string>
writeFile(path: string, content: string): Promise<void>
deleteFile(path: string): Promise<void>
listFiles(path?: string): Promise<string[]>
fileExists(path: string): Promise<boolean>
clone(): VirtualFileSystem
export(): string
import(json: string): void
```

**Example:**
```typescript
const fs = new VirtualFileSystem();

// Write a file
await fs.writeFile('src/index.ts', 'console.log("Hello");');

// Read it back
const content = await fs.readFile('src/index.ts');

// List all files
const files = await fs.listFiles();
// ['src/index.ts']

// Clone for worktree
const cloned = fs.clone();
```

### 2. Git Manager (`src/engine/execution/GitManager.ts`)

Manages git worktrees and version control.

**Features:**
- Create isolated worktrees
- Track commits per worktree
- Get git status
- View commit history
- Generate diffs
- Initialize project structure

**API:**
```typescript
createWorktree(id, baseBranch, newBranch): Promise<Worktree>
getWorktree(id): Promise<Worktree | null>
listWorktrees(): Promise<Worktree[]>
deleteWorktree(id): Promise<void>
commit(worktreeId, message, author): Promise<GitCommit>
getStatus(worktreeId): Promise<GitStatus>
getHistory(worktreeId): Promise<GitCommit[]>
getDiff(worktreeId): Promise<string>
```

**Example:**
```typescript
const git = new GitManager();

// Create worktree
const wt = await git.createWorktree('wt-1', 'main', 'feature/new-feature');

// Write files (via filesystem)
const fs = git.getFileSystem('wt-1');
await fs.writeFile('src/feature.ts', 'export const feature = () => {}');

// Commit
const commit = await git.commit('wt-1', 'Add feature', 'AI Agent');
// { hash: 'abc123...', message: 'Add feature', ... }

// Get status
const status = await git.getStatus('wt-1');
// { branch: 'feature/new-feature', added: ['src/feature.ts'], ... }
```

### 3. Test Runner (`src/engine/execution/TestRunner.ts`)

Executes tests, builds, and linting.

**Features:**
- Run test suites
- Auto-generate tests for source files
- Build TypeScript projects
- Lint code
- Execute arbitrary commands

**API:**
```typescript
runTests(fs, testPattern?): Promise<TestSuiteResult>
build(fs): Promise<ExecutionResult>
lint(fs): Promise<ExecutionResult>
executeCommand(command): Promise<ExecutionResult>
```

**Example:**
```typescript
const runner = new TestRunner();
const fs = new VirtualFileSystem();

// Add source file
await fs.writeFile('src/math.ts', 'export const add = (a, b) => a + b;');

// Run tests (auto-generates tests if none exist)
const results = await runner.runTests(fs);
// { suite: 'all', passed: 3, failed: 0, skipped: 0, duration: 142 }

// Build
const buildResult = await runner.build(fs);
// { success: true, output: '✓ Compiled 1 files successfully', ... }

// Lint
const lintResult = await runner.lint(fs);
// { success: true, output: '✓ Linted 1 files', ... }
```

### 4. Execution Engine (`src/engine/execution/ExecutionEngine.ts`)

Unified interface that integrates all execution components.

**Features:**
- File operations (delegates to VirtualFileSystem)
- Git operations (delegates to GitManager)
- Execution operations (delegates to TestRunner)
- Repository management (clone, initialize)
- Advanced operations (file tree, diff, history)

**API:**
```typescript
// File operations
readFile(worktreeId, path): Promise<string>
writeFile(worktreeId, path, content): Promise<void>
deleteFile(worktreeId, path): Promise<void>
listFiles(worktreeId, path?): Promise<string[]>
fileExists(worktreeId, path): Promise<boolean>

// Git operations
createWorktree(id, baseBranch, newBranch): Promise<Worktree>
getWorktree(id): Promise<Worktree | null>
listWorktrees(): Promise<Worktree[]>
deleteWorktree(id): Promise<void>
commit(worktreeId, message, author): Promise<GitCommit>
getStatus(worktreeId): Promise<GitStatus>

// Execution
executeCommand(worktreeId, command): Promise<ExecutionResult>
runTests(worktreeId, testPattern?): Promise<TestSuiteResult>
build(worktreeId): Promise<ExecutionResult>
lint(worktreeId): Promise<ExecutionResult>

// Repository
cloneRepository(url, targetPath): Promise<Worktree>
initializeRepository(name): Promise<Worktree>

// Advanced
getFileTree(worktreeId): Promise<any>
getDiff(worktreeId): Promise<string>
getHistory(worktreeId): Promise<GitCommit[]>
```

### 5. Execution Dashboard (`src/pages/ExecutionDashboard.tsx`)

Interactive UI for managing execution.

**Features:**
- Worktree management (create, select, delete)
- File browser with tree view
- Code editor with syntax highlighting
- Test runner with results visualization
- Build and lint execution
- Git commit workflow
- Real-time output console

**Usage:**
1. Navigate to "Execution" in sidebar
2. Create a worktree
3. Browse/create/edit files
4. Run tests, build, or lint
5. Commit changes
6. View results in output console

## Data Flow

```
User Action (create worktree, edit file, run test)
    ↓
Execution Dashboard (UI)
    ↓
Execution Engine (orchestrator)
    ↓
┌─────────────────────────────────────┐
│  Virtual File System  │  Git Manager  │
│  Test Runner          │               │
└─────────────────────────────────────┘
    ↓
Result (file content, test results, git status)
    ↓
Execution Dashboard (display)
```

## Example Workflow

**Scenario:** Developer agent implements a feature

1. **Create worktree**
   ```typescript
   const wt = await engine.createWorktree('wt-1', 'main', 'feature/charging-timeline');
   ```

2. **Write code**
   ```typescript
   await engine.writeFile('wt-1', 'src/charging.ts', `
     export class ChargingTimeline {
       // Implementation
     }
   `);
   ```

3. **Run tests**
   ```typescript
   const results = await engine.runTests('wt-1');
   // { passed: 5, failed: 0, ... }
   ```

4. **Build**
   ```typescript
   const buildResult = await engine.build('wt-1');
   // { success: true, ... }
   ```

5. **Commit**
   ```typescript
   const commit = await engine.commit('wt-1', 'Implement charging timeline', 'Developer Agent');
   ```

6. **Create PR** (Phase 3)
   ```typescript
   // Will integrate with GitHub API
   ```

## Current Limitations

### Browser Environment
- **Virtual filesystem** — In-memory only, not persisted
- **Simulated execution** — Tests/build/lint are simulated
- **No real git** — Commits are tracked in memory
- **No Docker** — No actual sandbox isolation

### What's Simulated
- Test execution (generates realistic results)
- Build process (checks for tsconfig.json)
- Linting (returns success with warnings)
- Git operations (tracks commits in memory)

## Future: Backend Replacement

### Phase 3: Node.js Backend

Replace virtual implementations with real ones:

```typescript
// Current (Virtual)
class VirtualFileSystem {
  async readFile(path: string): Promise<string> {
    // In-memory
  }
}

// Future (Real)
class NodeFileSystem {
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }
}
```

### Docker Integration

```typescript
class DockerExecutor {
  async executeInSandbox(command: string): Promise<ExecutionResult> {
    // Run in isolated Docker container
    const container = await docker.createContainer({
      Image: 'node:18',
      Cmd: ['sh', '-c', command],
      // ... security settings
    });
    return container.run();
  }
}
```

### Real Git

```typescript
import simpleGit from 'simple-git';

class RealGitManager {
  private git: SimpleGit;
  
  async commit(message: string): Promise<GitCommit> {
    await this.git.add('.');
    await this.git.commit(message);
    return this.parseCommit();
  }
}
```

## Security Considerations

### Current (Browser)
- ✅ No real file system access
- ✅ No code execution
- ✅ Isolated per session
- ⚠️ No persistence

### Future (Backend)
- ✅ Docker sandbox isolation
- ✅ Resource limits (CPU, memory, time)
- ✅ Network restrictions
- ✅ File system permissions
- ✅ Secret management
- ✅ Audit logging

## Performance

### Current Performance
- File operations: < 1ms (in-memory)
- Test execution: 100-500ms (simulated)
- Build: 200-800ms (simulated)
- Git operations: < 1ms (in-memory)

### Expected Backend Performance
- File operations: 1-10ms (disk I/O)
- Test execution: 1-30s (real tests)
- Build: 2-60s (real compilation)
- Git operations: 10-100ms (real git)

## Integration with Agent Harness

The Execution Engine integrates with the Agent Harness:

```typescript
// In AgentHarness
async executeDeveloperAgent(task: Task) {
  // Create worktree
  const wt = await this.executionEngine.createWorktree(
    `task-${task.id}`,
    'main',
    `feature/${task.id}`
  );
  
  // Agent writes code
  const code = await this.modelRouter.execute({
    taskType: 'code-generation',
    // ...
  });
  
  // Write to filesystem
  await this.executionEngine.writeFile(wt.id, 'src/feature.ts', code);
  
  // Run tests
  const testResults = await this.executionEngine.runTests(wt.id);
  
  // If tests pass, commit
  if (testResults.failed === 0) {
    await this.executionEngine.commit(wt.id, task.description, 'Developer Agent');
  }
  
  return { worktree: wt, testResults };
}
```

## Success Metrics

- ✅ Virtual filesystem operational
- ✅ Git worktree management working
- ✅ Test runner functional
- ✅ Execution dashboard interactive
- ✅ Architecture ready for backend replacement
- ⏳ Real code execution (Phase 3)
- ⏳ Docker sandbox (Phase 3)
- ⏳ GitHub integration (Phase 4)

## Next Steps

1. **Backend API** — Node.js/Express server
2. **Real Filesystem** — Replace VirtualFileSystem with fs operations
3. **Docker Sandbox** — Isolated execution environment
4. **Real Tests** — Execute actual Jest/Vitest tests
5. **Real Git** — Use simple-git for actual git operations
6. **Persistence** — Save worktrees to disk
7. **GitHub Integration** — Create PRs from worktrees
