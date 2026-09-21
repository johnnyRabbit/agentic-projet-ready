// ============================================================
// BACKEND API - Simulated Backend with IndexedDB
// ============================================================

import { User } from '../auth/types';

export interface BackendConfig {
  dbName: string;
  version: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export class BackendAPI {
  private db: IDBDatabase | null = null;
  private config: BackendConfig;

  constructor(config: BackendConfig) {
    this.config = config;
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('userId', 'userId', { unique: false });
          projectStore.createIndex('status', 'status', { unique: false });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Work requests store
        if (!db.objectStoreNames.contains('workRequests')) {
          const wrStore = db.createObjectStore('workRequests', { keyPath: 'id' });
          wrStore.createIndex('projectId', 'projectId', { unique: false });
          wrStore.createIndex('status', 'status', { unique: false });
          wrStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Agent runs store
        if (!db.objectStoreNames.contains('agentRuns')) {
          const arStore = db.createObjectStore('agentRuns', { keyPath: 'id' });
          arStore.createIndex('projectId', 'projectId', { unique: false });
          arStore.createIndex('status', 'status', { unique: false });
          arStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Pull requests store
        if (!db.objectStoreNames.contains('pullRequests')) {
          const prStore = db.createObjectStore('pullRequests', { keyPath: 'id' });
          prStore.createIndex('projectId', 'projectId', { unique: false });
          prStore.createIndex('status', 'status', { unique: false });
          prStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('type', 'type', { unique: false });
          analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Generic CRUD operations
   */
  async create<T>(storeName: string, data: T): Promise<APIResponse<T>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve({
          success: true,
          data,
          timestamp: new Date().toISOString()
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to create record',
          timestamp: new Date().toISOString()
        });
      };
    });
  }

  async read<T>(storeName: string, id: string): Promise<APIResponse<T>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve({
          success: true,
          data: request.result,
          timestamp: new Date().toISOString()
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to read record',
          timestamp: new Date().toISOString()
        });
      };
    });
  }

  async update<T>(storeName: string, id: string, data: Partial<T>): Promise<APIResponse<T>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // First get existing record
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          resolve({
            success: false,
            error: 'Record not found',
            timestamp: new Date().toISOString()
          });
          return;
        }

        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
        const updateRequest = store.put(updated);

        updateRequest.onsuccess = () => {
          resolve({
            success: true,
            data: updated,
            timestamp: new Date().toISOString()
          });
        };

        updateRequest.onerror = () => {
          resolve({
            success: false,
            error: updateRequest.error?.message || 'Failed to update record',
            timestamp: new Date().toISOString()
          });
        };
      };

      getRequest.onerror = () => {
        resolve({
          success: false,
          error: getRequest.error?.message || 'Failed to read record',
          timestamp: new Date().toISOString()
        });
      };
    });
  }

  async delete(storeName: string, id: string): Promise<APIResponse<void>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve({
          success: true,
          timestamp: new Date().toISOString()
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to delete record',
          timestamp: new Date().toISOString()
        });
      };
    });
  }

  async list<T>(storeName: string, options?: QueryOptions): Promise<APIResponse<T[]>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as T[];

        // Apply ordering
        if (options?.orderBy) {
          results.sort((a: any, b: any) => {
            const aVal = a[options.orderBy!];
            const bVal = b[options.orderBy!];
            const direction = options.orderDirection === 'desc' ? -1 : 1;
            return aVal < bVal ? -direction : direction;
          });
        }

        // Apply pagination
        if (options?.offset) {
          results = results.slice(options.offset);
        }
        if (options?.limit) {
          results = results.slice(0, options.limit);
        }

        resolve({
          success: true,
          data: results,
          timestamp: new Date().toISOString()
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to list records',
          timestamp: new Date().toISOString()
        });
      };
    });
  }

  async query<T>(storeName: string, indexName: string, value: any): Promise<APIResponse<T[]>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve({
          success: true,
          data: request.result,
          timestamp: new Date().toISOString()
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to query records',
          timestamp: new Date().toISOString()
        });
      };
    });
  }

  /**
   * Batch operations
   */
  async batch<T>(storeName: string, operations: Array<{ type: 'add' | 'put' | 'delete'; data?: T; id?: string }>): Promise<APIResponse<void>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => {
        resolve({
          success: true,
          timestamp: new Date().toISOString()
        });
      };

      transaction.onerror = () => {
        resolve({
          success: false,
          error: transaction.error?.message || 'Batch operation failed',
          timestamp: new Date().toISOString()
        });
      };

      for (const op of operations) {
        if (op.type === 'add' && op.data) {
          store.add(op.data);
        } else if (op.type === 'put' && op.data) {
          store.put(op.data);
        } else if (op.type === 'delete' && op.id) {
          store.delete(op.id);
        }
      }
    });
  }

  /**
   * Export all data
   */
  async exportData(): Promise<APIResponse<Record<string, any[]>>> {
    if (!this.db) throw new Error('Database not initialized');

    const exportData: Record<string, any[]> = {};
    const storeNames = Array.from(this.db.objectStoreNames);

    for (const storeName of storeNames) {
      const response = await this.list(storeName);
      if (response.success && response.data) {
        exportData[storeName] = response.data;
      }
    }

    return {
      success: true,
      data: exportData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Import data
   */
  async importData(data: Record<string, any[]>): Promise<APIResponse<void>> {
    if (!this.db) throw new Error('Database not initialized');

    for (const [storeName, records] of Object.entries(data)) {
      if (this.db.objectStoreNames.contains(storeName)) {
        for (const record of records) {
          await this.create(storeName, record);
        }
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
export const backendAPI = new BackendAPI({
  dbName: 'ai-engineering-team',
  version: 1
});
