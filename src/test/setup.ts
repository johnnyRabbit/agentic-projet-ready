import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock crypto.subtle
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => {
        // Simple mock hash
        return new ArrayBuffer(32);
      },
    },
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  },
});

// Mock IndexedDB
const indexedDBMock = {
  open: () => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: () => ({
        createIndex: () => {},
      }),
      objectStoreNames: {
        contains: () => false,
      },
      transaction: () => ({
        objectStore: () => ({
          add: () => ({
            onsuccess: null,
            onerror: null,
          }),
          get: () => ({
            onsuccess: null,
            onerror: null,
            result: null,
          }),
          getAll: () => ({
            onsuccess: null,
            onerror: null,
            result: [],
          }),
          put: () => ({
            onsuccess: null,
            onerror: null,
          }),
          delete: () => ({
            onsuccess: null,
            onerror: null,
          }),
        }),
      }),
    },
  }),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock,
});
