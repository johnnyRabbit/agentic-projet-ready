// ============================================================
// AUTH STORE - Zustand State Management
// ============================================================

import { create } from 'zustand';
import { authService } from './AuthService';
import { User, AuthSession, AuthState } from './types';

interface AuthStore {
  // State
  user: User | null;
  session: AuthSession | null;
  state: AuthState;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  session: null,
  state: 'unauthenticated',
  error: null,

  // Initialize auth state from storage
  initialize: async () => {
    try {
      set({ state: 'authenticating' });

      const session = await authService.getSession();
      const user = await authService.getCurrentUser();

      if (session && user) {
        set({
          user,
          session,
          state: 'authenticated',
          error: null,
        });
      } else {
        set({
          user: null,
          session: null,
          state: 'unauthenticated',
          error: null,
        });
      }
    } catch (error) {
      set({
        state: 'error',
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
      });
    }
  },

  // Login
  login: async (email: string, password: string) => {
    try {
      set({ state: 'authenticating', error: null });

      const response = await authService.login({ email, password });

      set({
        user: response.user,
        session: response.session,
        state: 'authenticated',
        error: null,
      });
    } catch (error) {
      set({
        state: 'error',
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  },

  // Register
  register: async (email: string, password: string, name: string) => {
    try {
      set({ state: 'authenticating', error: null });

      const response = await authService.register({ email, password, name });

      set({
        user: response.user,
        session: response.session,
        state: 'authenticated',
        error: null,
      });
    } catch (error) {
      set({
        state: 'error',
        error: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
      set({
        user: null,
        session: null,
        state: 'unauthenticated',
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  },

  // Refresh session
  refreshSession: async () => {
    try {
      const session = await authService.refreshSession();
      if (session) {
        set({ session, error: null });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh session',
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
