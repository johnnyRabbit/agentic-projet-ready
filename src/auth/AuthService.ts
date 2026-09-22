// ============================================================
// AUTHENTICATION SERVICE
// ============================================================

import { User, AuthSession, AuthCredentials, AuthResponse, RegisterInput } from './types';

class AuthService {
  private readonly STORAGE_KEY = 'auth_session';
  private readonly USER_KEY = 'auth_user';
  private readonly USERS_DB = 'users_db';

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(input.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password (simple hash for demo - use bcrypt in production)
    const hashedPassword = await this.hashPassword(input.password);

    // Create user
    const user: User = {
      id: this.generateId(),
      email: input.email,
      name: input.name,
      role: 'developer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store user with password
    await this.storeUser({ ...user, password: hashedPassword });

    // Create session
    const session = await this.createSession(user.id);

    // Store session
    this.storeSession(session);
    this.storeUser(user);

    return { user, session };
  }

  /**
   * Login with email and password
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    // Get user with password
    const userRecord = await this.getUserRecordByEmail(credentials.email);
    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await this.verifyPassword(credentials.password, userRecord.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      createdAt: userRecord.createdAt,
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await this.storeUser(user);

    // Create session
    const session = await this.createSession(user.id);

    // Store session
    this.storeSession(session);

    return { user, session };
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthSession | null> {
    const sessionData = localStorage.getItem(this.STORAGE_KEY);
    if (!sessionData) return null;

    try {
      const session: AuthSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    if (!session) return null;

    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthSession | null> {
    const session = await this.getSession();
    if (!session) return null;

    // Create new session
    const newSession = await this.createSession(session.userId);
    this.storeSession(newSession);

    return newSession;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  // ========================================
  // Private Helpers
  // ========================================

  private async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.email === email) || null;
  }

  private async getUserRecordByEmail(email: string): Promise<any | null> {
    const users = await this.getAllUserRecords();
    return users.find(u => u.email === email) || null;
  }

  private async getAllUsers(): Promise<User[]> {
    const records = await this.getAllUserRecords();
    return records.map(({ password, ...user }) => user);
  }

  private async getAllUserRecords(): Promise<any[]> {
    const data = localStorage.getItem(this.USERS_DB);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async storeUser(user: User | any): Promise<void> {
    const users = await this.getAllUserRecords();
    const index = users.findIndex(u => u.id === user.id);
    
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem(this.USERS_DB, JSON.stringify(users));
  }

  private async createSession(userId: string): Promise<AuthSession> {
    const session: AuthSession = {
      userId,
      token: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString()
    };

    return session;
  }

  private storeSession(session: AuthSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for demo - use bcrypt in production
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const authService = new AuthService();
