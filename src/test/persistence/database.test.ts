import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import {
  Database,
  database,
  DB_NAME,
  DB_VERSION,
  DATABASE_OPEN_TIMEOUT_MS,
} from '../../persistence/Database';
import { BackendAPI } from '../../backend/BackendAPI';
import { intakeService } from '../../engine/intake/IntakeService';

const connections: IDBDatabase[] = [];
async function seedLegacy(
  version: number,
  layout: 'backend' | 'persistence'
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, version);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of ['projects', 'agentRuns', 'pullRequests']) {
        db.createObjectStore(name, { keyPath: 'id' }).createIndex('createdAt', 'createdAt');
      }
      request.transaction
        ?.objectStore('projects')
        .put({ id: 'existing', name: 'Preservar projeto' });
      if (layout === 'backend') {
        db.createObjectStore('workRequests', { keyPath: 'id' }).put({
          id: 'old-request',
          source: 'legacy',
        });
        db.createObjectStore('analytics', { keyPath: 'id' });
      } else {
        db.createObjectStore('settings', { keyPath: 'key' }).put({
          key: 'existing',
          value: 'Preservar dados',
        });
      }
    };
    request.onsuccess = () => {
      connections.push(request.result);
      resolve(request.result);
    };
  });
}

beforeEach(async () => {
  await database.close();
  vi.stubGlobal('indexedDB', new IDBFactory());
});
afterEach(async () => {
  for (const connection of connections.splice(0)) connection.close();
  await database.close();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('shared IndexedDB startup and migration', () => {
  it.each([
    [1, 'backend'],
    [1, 'persistence'],
    [2, 'backend'],
    [2, 'persistence'],
  ] as const)(
    'preserves legacy v%s %s data and creates all stores and indexes',
    async (version, layout) => {
      const legacy = await seedLegacy(version, layout);
      legacy.close();
      const backend = new BackendAPI({ dbName: DB_NAME, version: 1 });
      // App initializes the backend before Work Requests. Both must use one version/connection.
      await backend.initialize();
      const record = await intakeService.create('Criar tarefas');
      expect((await intakeService.get(record.id)).source.text).toBe('Criar tarefas');
      expect((await backend.read('projects', 'existing')).data).toMatchObject({
        name: 'Preservar projeto',
      });
      const db = await database.open();
      expect(db.version).toBe(DB_VERSION);
      expect(Array.from(db.objectStoreNames)).toEqual(
        expect.arrayContaining([
          'settings',
          'workRequests',
          'analytics',
          'worktrees',
          'decisions',
          'events',
        ])
      );
      expect(Array.from(db.transaction('projects').objectStore('projects').indexNames)).toContain(
        'userId'
      );
      expect(Array.from(db.transaction('agentRuns').objectStore('agentRuns').indexNames)).toEqual(
        expect.arrayContaining(['agentRole', 'status', 'projectId'])
      );
      if (layout === 'persistence')
        expect((await database.get('settings', 'existing'))?.value).toBe('Preservar dados');
      else
        expect((await backend.read('workRequests', 'old-request')).data).toMatchObject({
          source: 'legacy',
        });
    }
  );

  it('shares a single open request between concurrent application startup and intake', async () => {
    const spy = vi.spyOn(indexedDB, 'open');
    const backend = new BackendAPI({ dbName: DB_NAME, version: 1 });
    await Promise.all([backend.initialize(), backend.initialize(), intakeService.list()]);
    expect(spy).toHaveBeenCalledTimes(1);
    const record = await intakeService.create('Criar tarefas');
    await database.close();
    expect((await intakeService.get(record.id)).source.text).toBe('Criar tarefas');
    expect((await backend.list('projects')).success).toBe(true);
  });

  it('reports a blocked migration on every retry and recovers after the old connection closes', async () => {
    const blocker = await seedLegacy(1, 'backend');
    const spy = vi.spyOn(indexedDB, 'open');
    await expect(database.open()).rejects.toThrow('Feche as outras janelas');
    await expect(intakeService.create('Texto a preservar')).rejects.toThrow(
      'Feche as outras janelas'
    );
    expect(spy).toHaveBeenCalledTimes(1);
    blocker.close();
    // Wait for the rejected upgrade to finish without leaving a hidden connection open.
    await vi.waitFor(async () => expect((await database.open()).version).toBe(DB_VERSION));
    expect((await intakeService.create('Texto a preservar')).source.text).toBe('Texto a preservar');
  });

  it('closes its exact connection on versionchange so an upgrade is not blocked', async () => {
    await database.open();
    const upgraded = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION + 1);
      request.onblocked = () => reject(new Error('Connection leaked'));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    connections.push(upgraded);
    expect(upgraded.version).toBe(DB_VERSION + 1);
  });

  it('times out a browser open that never emits an event and closes a late connection', async () => {
    vi.useFakeTimers();
    const pending = {} as IDBOpenDBRequest;
    vi.spyOn(indexedDB, 'open').mockReturnValue(pending);
    const storage = new Database('stalled-test');
    const result = expect(storage.open()).rejects.toThrow('não respondeu');
    await vi.advanceTimersByTimeAsync(DATABASE_OPEN_TIMEOUT_MS);
    await result;
    const close = vi.fn();
    Object.defineProperty(pending, 'result', { value: { close } });
    pending.onsuccess?.call(pending, new Event('success'));
    expect(close).toHaveBeenCalledOnce();
  });
});
