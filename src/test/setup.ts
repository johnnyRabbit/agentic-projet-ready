import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';

// Use real hashing: a constant digest makes password tests meaningless.
Object.defineProperty(window, 'crypto', { value: webcrypto, configurable: true });
