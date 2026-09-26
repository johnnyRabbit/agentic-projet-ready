// ============================================================
// BACKEND API - Simulated Backend with IndexedDB
// ============================================================

import { Database, database, DB_NAME, DB_VERSION } from '../persistence/Database';

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
  private connection: Database;

  constructor(config: BackendConfig) {
    // The shared Database owns the schema version, never an individual consumer.
    this.connection = config.dbName === DB_NAME ? database : new Database(config.dbName);
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    await this.connection.open();
  }

  /**
   * Close database connection
   */
  close(): void {
    void this.connection.close();
  }

  /**
   * Generic CRUD operations
   */
  async create<T>(storeName: string, data: T): Promise<APIResponse<T>> {
    const db = await this.connection.open();

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve({
          success: true,
          data,
          timestamp: new Date().toISOString(),
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to create record',
          timestamp: new Date().toISOString(),
        });
      };
    });
  }

  async read<T>(storeName: string, id: string): Promise<APIResponse<T>> {
    const db = await this.connection.open();

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve({
          success: true,
          data: request.result,
          timestamp: new Date().toISOString(),
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to read record',
          timestamp: new Date().toISOString(),
        });
      };
    });
  }

  async update<T>(storeName: string, id: string, data: Partial<T>): Promise<APIResponse<T>> {
    const db = await this.connection.open();

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      // First get existing record
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          resolve({
            success: false,
            error: 'Record not found',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
        const updateRequest = store.put(updated);

        updateRequest.onsuccess = () => {
          resolve({
            success: true,
            data: updated,
            timestamp: new Date().toISOString(),
          });
        };

        updateRequest.onerror = () => {
          resolve({
            success: false,
            error: updateRequest.error?.message || 'Failed to update record',
            timestamp: new Date().toISOString(),
          });
        };
      };

      getRequest.onerror = () => {
        resolve({
          success: false,
          error: getRequest.error?.message || 'Failed to read record',
          timestamp: new Date().toISOString(),
        });
      };
    });
  }

  async delete(storeName: string, id: string): Promise<APIResponse<void>> {
    const db = await this.connection.open();

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve({
          success: true,
          timestamp: new Date().toISOString(),
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to delete record',
          timestamp: new Date().toISOString(),
        });
      };
    });
  }

  async list<T>(storeName: string, options?: QueryOptions): Promise<APIResponse<T[]>> {
    const db = await this.connection.open();

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as T[];

        // Apply ordering
        if (options?.orderBy) {
          const orderBy = options.orderBy;
          results.sort((a, b) => {
            const aVal = (a as Record<string, string | number>)[orderBy];
            const bVal = (b as Record<string, string | number>)[orderBy];
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
          timestamp: new Date().toISOString(),
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to list records',
          timestamp: new Date().toISOString(),
        });
      };
    });
  }

  async query<T>(
    storeName: string,
    indexName: string,
    value: IDBValidKey
  ): Promise<APIResponse<T[]>> {
    const db = await this.connection.open();

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve({
          success: true,
          data: request.result,
          timestamp: new Date().toISOString(),
        });
      };

      request.onerror = () => {
        resolve({
          success: false,
          error: request.error?.message || 'Failed to query records',
          timestamp: new Date().toISOString(),
        });
      };
    });
  }

  /**
   * Batch operations
   */
  async batch<T>(
    storeName: string,
    operations: Array<{ type: 'add' | 'put' | 'delete'; data?: T; id?: string }>
  ): Promise<APIResponse<void>> {
    const db = await this.connection.open();

    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => {
        resolve({
          success: true,
          timestamp: new Date().toISOString(),
        });
      };

      transaction.onerror = () => {
        resolve({
          success: false,
          error: transaction.error?.message || 'Batch operation failed',
          timestamp: new Date().toISOString(),
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
  async exportData(): Promise<APIResponse<Record<string, unknown[]>>> {
    const db = await this.connection.open();

    const exportData: Record<string, unknown[]> = {};
    const storeNames = Array.from(db.objectStoreNames);

    for (const storeName of storeNames) {
      const response = await this.list(storeName);
      if (response.success && response.data) {
        exportData[storeName] = response.data;
      }
    }

    return {
      success: true,
      data: exportData,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Import data
   */
  async importData(data: Record<string, unknown[]>): Promise<APIResponse<void>> {
    const db = await this.connection.open();

    for (const [storeName, records] of Object.entries(data)) {
      if (db.objectStoreNames.contains(storeName)) {
        for (const record of records) {
          await this.create(storeName, record);
        }
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const backendAPI = new BackendAPI({
  dbName: DB_NAME,
  version: DB_VERSION,
});
