// ============================================================
// DATABASE — IndexedDB Persistence Layer
// ============================================================
// Real persistence for all entities. Transforms the app from
// "demo" to "real tool" — projects survive page reloads.

export interface DBSchema {
  projects: ProjectRecord;
  worktrees: WorktreeRecord;
  pullRequests: PullRequestRecord;
  agentRuns: AgentRunRecord;
  decisions: DecisionRecord;
  events: EventRecord;
  settings: SettingsRecord;
}

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  budget: number;
  spent: number;
  autonomyLevel: number;
  repositoryUrl?: string;
  tags: string[];
}

export interface WorktreeRecord {
  id: string;
  projectId: string;
  branch: string;
  baseBranch: string;
  status: 'active' | 'merged' | 'abandoned';
  createdAt: string;
  files: Record<string, string>; // path -> content
  commits: Array<{
    hash: string;
    message: string;
    author: string;
    timestamp: string;
  }>;
}

export interface PullRequestRecord {
  id: string;
  number: number;
  projectId: string;
  worktreeId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  stats: {
    files: number;
    additions: number;
    deletions: number;
  };
  costReport: {
    totalCost: number;
    totalTokens: number;
    agentDuration: string;
    estimatedHumanEffort: string;
  };
  checks: Array<{
    name: string;
    status: string;
    duration: number;
  }>;
  traceability: Array<{
    requirement: string;
    userStory: string;
    task: string;
    commit: string;
  }>;
}

export interface AgentRunRecord {
  id: string;
  projectId: string;
  worktreeId?: string;
  agentRole: string;
  status: 'complete' | 'failed';
  input: string;
  output: string;
  model: string;
  provider: string;
  tokens: number;
  cost: number;
  duration: number;
  confidence: number;
  createdAt: string;
}

export interface DecisionRecord {
  id: string;
  projectId: string;
  title: string;
  context: string;
  options: Array<{ agent: string; position: string }>;
  finalDecision: string;
  confidence: number;
  decidedBy: 'agent' | 'human';
  createdAt: string;
}

export interface EventRecord {
  id: string;
  projectId: string;
  type: string;
  agentId?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

export const DB_NAME = 'ai-engineering-team';
// Unified, additive schema for BackendAPI and persistence (legacy v1/v2 installations).
export const DB_VERSION = 3;
export const DATABASE_OPEN_TIMEOUT_MS = 8000;

export class Database {
  private db: IDBDatabase | null = null;
  private opening: Promise<IDBDatabase> | null = null;

  constructor(private readonly name: string = DB_NAME) {}

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.opening) return this.opening;
    const request = indexedDB.open(this.name, DB_VERSION);
    this.opening = new Promise((resolve, reject) => {
      let failed = false;
      const fail = (error: Error) => {
        failed = true;
        clearTimeout(timer);
        reject(error);
      };
      const timer = setTimeout(
        () =>
          fail(
            new Error(
              'O armazenamento local não respondeu. Feche outras janelas desta aplicação e tente novamente.'
            )
          ),
        DATABASE_OPEN_TIMEOUT_MS
      );
      request.onerror = () => {
        this.opening = null;
        fail(
          new Error(
            'Não foi possível abrir o armazenamento local. Feche outras janelas desta aplicação e tente novamente.'
          )
        );
      };
      // Keep a blocked request cached until it terminates; retries must not queue
      // more requests behind the same blocked migration and wait indefinitely.
      request.onblocked = () =>
        fail(
          new Error(
            'Feche as outras janelas da aplicação para atualizar o armazenamento local. Depois tente novamente.'
          )
        );
      request.onsuccess = () => {
        clearTimeout(timer);
        this.opening = null;
        const connection = request.result;
        if (failed) {
          connection.close();
          return;
        }
        this.db = connection;
        connection.onversionchange = () => {
          connection.close();
          if (this.db === connection) this.db = null;
        };
        connection.onclose = () => {
          if (this.db === connection) this.db = null;
        };
        resolve(connection);
      };

      request.onupgradeneeded = (event) => {
        if (failed) {
          request.transaction?.abort();
          return;
        }
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('status', 'status', { unique: false });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Worktrees store
        if (!db.objectStoreNames.contains('worktrees')) {
          const worktreeStore = db.createObjectStore('worktrees', { keyPath: 'id' });
          worktreeStore.createIndex('projectId', 'projectId', { unique: false });
          worktreeStore.createIndex('status', 'status', { unique: false });
        }

        // Pull Requests store
        if (!db.objectStoreNames.contains('pullRequests')) {
          const prStore = db.createObjectStore('pullRequests', { keyPath: 'id' });
          prStore.createIndex('projectId', 'projectId', { unique: false });
          prStore.createIndex('number', 'number', { unique: true });
        }

        // Agent Runs store
        if (!db.objectStoreNames.contains('agentRuns')) {
          const runStore = db.createObjectStore('agentRuns', { keyPath: 'id' });
          runStore.createIndex('projectId', 'projectId', { unique: false });
          runStore.createIndex('agentRole', 'agentRole', { unique: false });
          runStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Decisions store
        if (!db.objectStoreNames.contains('decisions')) {
          const decisionStore = db.createObjectStore('decisions', { keyPath: 'id' });
          decisionStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Events store (audit log)
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id' });
          eventStore.createIndex('projectId', 'projectId', { unique: false });
          eventStore.createIndex('type', 'type', { unique: false });
          eventStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // BackendAPI used a separate v1 schema. Preserve its data and merge the
        // stores/indexes regardless of which module originally created this database.
        const legacyIndexes: Record<string, string[]> = {
          projects: ['userId', 'status', 'createdAt'],
          pullRequests: ['projectId', 'status', 'createdAt', 'number'],
          agentRuns: ['projectId', 'agentRole', 'status', 'createdAt'],
          workRequests: ['projectId', 'status', 'createdAt'],
          analytics: ['type', 'timestamp'],
        };
        const migration = request.transaction;
        if (!migration) throw new Error('Missing schema migration transaction');
        for (const [name, indexes] of Object.entries(legacyIndexes)) {
          const store = db.objectStoreNames.contains(name)
            ? migration.objectStore(name)
            : db.createObjectStore(name, { keyPath: 'id' });
          for (const index of indexes) {
            if (!store.indexNames.contains(index))
              store.createIndex(index, index, { unique: false });
          }
        }
      };
    });
    return this.opening;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // --- Generic CRUD operations ---

  async add<T extends keyof DBSchema>(storeName: T, record: DBSchema[T]): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.add(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T extends keyof DBSchema>(storeName: T, id: string): Promise<DBSchema[T] | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async update<T extends keyof DBSchema>(storeName: T, record: DBSchema[T]): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete<T extends keyof DBSchema>(storeName: T, id: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAll<T extends keyof DBSchema>(storeName: T): Promise<DBSchema[T][]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getByIndex<T extends keyof DBSchema>(
    storeName: T,
    indexName: string,
    value: IDBValidKey
  ): Promise<DBSchema[T][]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async count<T extends keyof DBSchema>(storeName: T): Promise<number> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.count();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clear<T extends keyof DBSchema>(storeName: T): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // --- Export/Import ---

  async exportAll(): Promise<string> {
    const data: Record<string, unknown[]> = {};
    const storeNames: (keyof DBSchema)[] = [
      'projects',
      'worktrees',
      'pullRequests',
      'agentRuns',
      'decisions',
      'events',
      'settings',
    ];

    for (const storeName of storeNames) {
      data[storeName] = await this.getAll(storeName);
    }

    return JSON.stringify(data, null, 2);
  }

  async importAll(json: string): Promise<void> {
    const data = JSON.parse(json);
    const storeNames: (keyof DBSchema)[] = [
      'projects',
      'worktrees',
      'pullRequests',
      'agentRuns',
      'decisions',
      'events',
      'settings',
    ];

    for (const storeName of storeNames) {
      if (data[storeName]) {
        await this.clear(storeName);
        for (const record of data[storeName]) {
          await this.add(storeName, record as DBSchema[typeof storeName]);
        }
      }
    }
  }

  // --- Database info ---

  async getStats(): Promise<{
    projects: number;
    worktrees: number;
    pullRequests: number;
    agentRuns: number;
    decisions: number;
    events: number;
    totalSize: number;
  }> {
    const [projects, worktrees, pullRequests, agentRuns, decisions, events] = await Promise.all([
      this.count('projects'),
      this.count('worktrees'),
      this.count('pullRequests'),
      this.count('agentRuns'),
      this.count('decisions'),
      this.count('events'),
    ]);

    // Estimate size
    const allData = await this.exportAll();
    const totalSize = new Blob([allData]).size;

    return {
      projects,
      worktrees,
      pullRequests,
      agentRuns,
      decisions,
      events,
      totalSize,
    };
  }
}

// Singleton instance
export const database = new Database();
