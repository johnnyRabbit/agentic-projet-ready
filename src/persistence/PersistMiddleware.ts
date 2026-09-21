// ============================================================
// PERSISTENCE MIDDLEWARE — Zustand ↔ IndexedDB Sync
// ============================================================
// Simple persistence layer for Zustand stores

import { database } from '../persistence/Database';

export interface PersistOptions<T> {
  name: string;
  partialize?: (state: T) => Partial<T>;
}

// Save state to IndexedDB
export async function persistState<T>(
  name: string,
  state: T,
  partialize?: (state: T) => Partial<T>
): Promise<void> {
  const dataToPersist = partialize ? partialize(state) : state;
  
  await database.update('settings', {
    key: name,
    value: dataToPersist,
    updatedAt: new Date().toISOString()
  });
}

// Load state from IndexedDB
export async function loadState<T>(name: string): Promise<T | null> {
  const record = await database.get('settings', name);
  return record?.value as T || null;
}

// Clear persisted state
export async function clearPersistedState(name: string): Promise<void> {
  await database.delete('settings', name);
}

// Create a persistent store helper
export function createPersistentStore<T>(
  name: string,
  options?: PersistOptions<T>
) {
  return {
    get: async (): Promise<T | null> => {
      return loadState<T>(name);
    },
    
    set: async (state: T): Promise<void> => {
      await persistState(name, state, options?.partialize);
    },
    
    clear: async (): Promise<void> => {
      await clearPersistedState(name);
    }
  };
}
