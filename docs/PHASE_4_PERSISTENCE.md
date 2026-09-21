# Phase 4: Persistence, Real Sandbox & Analytics

## Overview

Phase 4 transforms the application from a "demo" into a **real tool** by adding:
- **Real persistence** (IndexedDB) — projects survive page reloads
- **Real isolated execution** (Web Workers) — true code sandboxing
- **Real file access** (File System Access API) — read/write actual files
- **Real analytics** — historical metrics and insights
- **Data portability** — export/import for backup and migration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM DASHBOARD                         │
│  (System Health • Status • Data Management)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  IndexedDB   │  │   Browser    │  │   Analytics  │      │
│  │   Database   │  │ File System  │  │    Engine    │      │
│  │              │  │              │  │              │      │
│  │ • Projects   │  │ • Real files │  │ • Metrics    │      │
│  │ • Worktrees  │  │ • Read/Write │  │ • Trends     │      │
│  │ • PRs        │  │ • Directory  │  │ • Performance│      │
│  │ • Agent Runs │  │   access     │  │ • Insights   │      │
│  │ • Events     │  │              │  │              │      │
│  │ • Settings   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Web Worker   │  │  Export /    │                         │
│  │   Sandbox    │  │   Import     │                         │
│  │              │  │              │                         │
│  │ • Isolated   │  │ • Backup     │                         │
│  │ • Threaded   │  │ • Restore    │                         │
│  │ • Real exec  │  │ • Migrate    │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Database (`src/persistence/Database.ts`)

IndexedDB wrapper providing real persistence for all entities.

**Stores:**
- `projects` — Project metadata and configuration
- `worktrees` — Isolated workspaces with files and commits
- `pullRequests` — Generated PRs with full metadata
- `agentRuns` — Agent execution history with costs
- `decisions` — Architecture decisions and rationale
- `events` — Audit log of all actions
- `settings` — User preferences and configuration

**Features:**
- Full CRUD operations
- Indexed queries
- Export/Import (JSON backup)
- Database statistics
- Automatic schema migration

**API:**
```typescript
// CRUD
add<T>(storeName: T, record: DBSchema[T]): Promise<void>
get<T>(storeName: T, id: string): Promise<DBSchema[T] | undefined>
update<T>(storeName: T, record: DBSchema[T]): Promise<void>
delete<T>(storeName: T, id: string): Promise<void>
getAll<T>(storeName: T): Promise<DBSchema[T][]>
getByIndex<T>(storeName: T, indexName: string, value: IDBValidKey): Promise<DBSchema[T][]>

// Export/Import
exportAll(): Promise<string>
importAll(json: string): Promise<void>

// Stats
getStats(): Promise<{ projects: number, worktrees: number, ... }>
```

**Example:**
```typescript
import { database } from './persistence/Database';

// Create project
await database.add('projects', {
  id: 'proj-123',
  name: 'My Project',
  description: 'Example project',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  budget: 25,
  spent: 0,
  autonomyLevel: 3,
  tags: ['react', 'typescript']
});

// Get all projects
const projects = await database.getAll('projects');

// Export backup
const backup = await database.exportAll();
// Save to file...

// Import backup
await database.importAll(backup);
```

### 2. Web Worker Sandbox (`src/sandbox/WebWorkerSandbox.ts`)

Real isolated code execution using Web Workers.

**Features:**
- True thread isolation (separate JS context)
- Timeout protection
- Console output capture
- Return value extraction
- Error handling
- Batch execution

**API:**
```typescript
initialize(): Promise<void>
execute(code: string): Promise<WorkerSandboxResult>
executeBatch(codes: string[]): Promise<WorkerSandboxResult[]>
cleanup(): void
```

**Example:**
```typescript
import { webWorkerSandbox } from './sandbox/WebWorkerSandbox';

// Initialize
await webWorkerSandbox.initialize();

// Execute code
const result = await webWorkerSandbox.execute(`
  const add = (a, b) => a + b;
  console.log('Result:', add(2, 3));
  return add(10, 20);
`);

// {
//   success: true,
//   output: 'Result: 5',
//   returnValue: 30,
//   duration: 12,
//   logs: ['Result: 5']
// }
```

**Why Web Workers?**
- True isolation (separate global scope)
- No interference with main app
- Can run long computations without blocking UI
- Can be terminated if needed
- Real browser security model

### 3. Browser File System (`src/filesystem/BrowserFileSystem.ts`)

Real filesystem access using File System Access API (Chrome/Edge).

**Features:**
- Select directory with native picker
- Read/write real files
- Create directories
- Delete files
- Check file existence
- List directory contents

**API:**
```typescript
isAvailable(): boolean
selectDirectory(): Promise<boolean>
listFiles(path?: string): Promise<BrowserFileHandle[]>
readFile(path: string): Promise<string>
writeFile(path: string, content: string): Promise<void>
deleteFile(path: string): Promise<void>
fileExists(path: string): Promise<boolean>
getDirectoryName(): string | null
release(): void
```

**Example:**
```typescript
import { browserFileSystem } from './filesystem/BrowserFileSystem';

// Check availability
if (browserFileSystem.isAvailable()) {
  // Select directory
  await browserFileSystem.selectDirectory();
  
  // Write file
  await browserFileSystem.writeFile('src/index.ts', 'console.log("Hello");');
  
  // Read file
  const content = await browserFileSystem.readFile('src/index.ts');
  
  // List files
  const files = await browserFileSystem.listFiles('src');
}
```

**Browser Support:**
- ✅ Chrome 86+
- ✅ Edge 86+
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

**Fallback:**
For unsupported browsers, the app continues to use the virtual filesystem.

### 4. Analytics Engine (`src/analytics/AnalyticsEngine.ts`)

Historical metrics and insights from persisted data.

**Features:**
- Overall summary (cost, tokens, duration, success rate)
- Cost breakdown by phase
- Agent performance metrics
- Delivery trends
- Recent activity
- Project-specific analytics
- Export analytics

**API:**
```typescript
getSummary(): Promise<AnalyticsSummary>
getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null>
getCostOverTime(days?: number): Promise<Array<{ date: string; cost: number; tokens: number }>>
getAgentPerformance(): Promise<Array<{ role: string; runs: number; successRate: number; ... }>>
getRecentActivity(limit?: number): Promise<Array<{ type: string; description: string; timestamp: string }>>
exportAnalytics(): Promise<string>
```

**Example:**
```typescript
import { analyticsEngine } from './analytics/AnalyticsEngine';

// Get summary
const summary = await analyticsEngine.getSummary();
// {
//   totalProjects: 5,
//   totalDeliveries: 23,
//   totalCost: 42.50,
//   totalTokens: 425000,
//   averageCostPerDelivery: 1.85,
//   successRate: 95.2,
//   topAgents: [...],
//   costByPhase: [...],
//   deliveryTrend: [...]
// }

// Get agent performance
const agents = await analyticsEngine.getAgentPerformance();
// [
//   { role: 'developer', runs: 45, successRate: 98, averageCost: 0.42, ... },
//   { role: 'reviewer', runs: 23, successRate: 100, averageCost: 0.15, ... },
//   ...
// ]
```

### 5. Platform Dashboard (`src/pages/PlatformDashboard.tsx`)

System health and data management interface.

**Features:**
- Database status and statistics
- File system status and directory selection
- Web Worker sandbox status
- Analytics summary
- Data export/import
- Clear all data
- Top agents visualization
- Cost breakdown by phase

### 6. Analytics Dashboard (`src/pages/AnalyticsDashboard.tsx`)

Detailed metrics and insights visualization.

**Features:**
- Key metrics (total cost, avg duration, success rate, tokens)
- Cost over time chart (30 days)
- Agent performance comparison
- Recent activity feed
- Export analytics

## Data Flow

```
User Action (create project, deliver PR, etc.)
    ↓
Application Logic
    ↓
┌─────────────────────────────────────────────────────────┐
│  Database (IndexedDB)                                    │
│  ├─ projects                                             │
│  ├─ worktrees                                            │
│  ├─ pullRequests                                         │
│  ├─ agentRuns                                            │
│  ├─ decisions                                            │
│  ├─ events                                               │
│  └─ settings                                             │
└─────────────────────────────────────────────────────────┘
    ↓
Analytics Engine (reads from database)
    ↓
Dashboard UI (displays metrics)
```

## Example: Complete Workflow with Persistence

```typescript
import { database } from './persistence/Database';
import { deliveryEngine } from './delivery/DeliveryEngine';
import { analyticsEngine } from './analytics/AnalyticsEngine';

// 1. Create project (persisted)
await database.add('projects', {
  id: 'proj-123',
  name: 'Notification Filter',
  description: 'Add filtering by unread status',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  budget: 25,
  spent: 0,
  autonomyLevel: 3,
  tags: ['react', 'typescript']
});

// 2. Deliver feature
const result = await deliveryEngine.deliver({
  userStory: 'As a user, I want to filter notifications...',
  requirements: ['Filter button', 'Toggle all/unread'],
  plan: 'Implementation plan',
  code: {
    'src/filter.ts': 'export class Filter { ... }',
    'src/filter.test.ts': 'describe("Filter", () => { ... })'
  }
});

// 3. Save PR (persisted)
await database.add('pullRequests', {
  id: `pr-${result.pullRequest.number}`,
  number: result.pullRequest.number,
  projectId: 'proj-123',
  worktreeId: 'wt-123',
  title: result.pullRequest.title,
  description: result.pullRequest.description,
  status: result.pullRequest.status,
  createdAt: new Date().toISOString(),
  stats: result.pullRequest.stats,
  costReport: result.costReport,
  checks: result.pullRequest.checks,
  traceability: result.traceability
});

// 4. Save agent runs (persisted)
for (const run of result.agentRuns) {
  await database.add('agentRuns', {
    id: run.id,
    projectId: 'proj-123',
    agentRole: run.agentRole,
    status: run.status,
    input: run.input,
    output: run.output,
    model: run.model,
    provider: run.provider,
    tokens: run.tokens,
    cost: run.cost,
    duration: run.duration,
    confidence: run.confidence,
    createdAt: new Date().toISOString()
  });
}

// 5. Get analytics (reads from database)
const summary = await analyticsEngine.getSummary();
// { totalProjects: 1, totalDeliveries: 1, totalCost: 0.42, ... }

// 6. Export backup
const backup = await database.exportAll();
// Save to file...
```

## Integration with Previous Phases

### Phase 1 Integration
- Model Router decisions can be persisted
- Budget Engine can use database for limits
- Context Engine can cache context packs

### Phase 2 Integration
- Execution Engine worktrees can be persisted
- Test results can be stored
- Build outputs can be saved

### Phase 3 Integration
- Delivery Engine results are persisted
- PRs are stored in database
- Traceability links are saved
- Decisions are recorded

### Complete Stack
```
Phase 1: Engine + UI (Groq, Model Router, Budget, Context, Agents)
Phase 2: Execution Layer (Filesystem, Git, Tests, Dashboard)
Phase 3: Delivery Pipeline (GitHub, CI/CD, Traceability, PR)
Phase 4: Persistence + Real Sandbox + Analytics ← CURRENT
```

## Success Metrics

**Primary KPI:**
> "Data persists across page reloads and sessions."

**Phase 4 Metrics:**
- ✅ Database operational (IndexedDB)
- ✅ Projects persist across reloads
- ✅ PRs are saved and retrievable
- ✅ Agent runs are logged
- ✅ Analytics calculated from real data
- ✅ Web Worker sandbox operational
- ✅ File System Access API integrated
- ✅ Export/Import functional
- ✅ Data portability verified

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Web Workers | ✅ | ✅ | ✅ | ✅ |
| File System Access | ✅ 86+ | ✅ 86+ | ❌ | ❌ |
| BroadcastChannel | ✅ | ✅ | ✅ | ❌ |

**Fallbacks:**
- File System Access → Virtual filesystem (in-memory)
- BroadcastChannel → Polling

## Future: Backend Migration

The current implementation is browser-only. To migrate to a backend:

```typescript
// Current (Browser - IndexedDB)
class Database {
  async add<T>(storeName: T, record: DBSchema[T]): Promise<void> {
    const db = await this.open();
    const tx = db.transaction(storeName, 'readwrite');
    // IndexedDB operations...
  }
}

// Future (Backend - PostgreSQL)
class Database {
  async add<T>(storeName: T, record: DBSchema[T]): Promise<void> {
    await db.query(`INSERT INTO ${storeName} VALUES (...)`);
  }
}
```

The interface remains the same — only the implementation changes.

## Conclusion

Phase 4 transforms the application from a demo into a real tool:

1. **Real persistence** — Projects, PRs, and history survive page reloads
2. **Real isolation** — Web Workers provide true code sandboxing
3. **Real file access** — File System Access API reads/writes actual files
4. **Real analytics** — Metrics calculated from persisted data
5. **Real portability** — Export/import for backup and migration

The system is now production-ready for individual use. The next phase would add backend infrastructure for team collaboration.
