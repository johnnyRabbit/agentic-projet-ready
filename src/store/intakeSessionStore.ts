import { create } from 'zustand';

// Survives page navigation within the app, never persisted to browser storage.
export const useIntakeSessionStore = create<{
  apiKey: string;
  setApiKey: (key: string) => void;
}>((set) => ({ apiKey: '', setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }) }));
