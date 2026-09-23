import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../auth/AuthService';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should register a new user', async () => {
    const response = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(response).toBeDefined();
    expect(response.user).toBeDefined();
    expect(response.user.email).toBe('test@example.com');
    expect(response.user.name).toBe('Test User');
    expect(response.session).toBeDefined();
    expect(response.session.token).toBeDefined();
  });

  it('should not register duplicate email', async () => {
    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await expect(
      authService.register({
        email: 'test@example.com',
        password: 'password456',
        name: 'Another User',
      })
    ).rejects.toThrow('User already exists');
  });

  it('should login with valid credentials', async () => {
    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    const response = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response).toBeDefined();
    expect(response.user.email).toBe('test@example.com');
    expect(response.session).toBeDefined();
  });

  it('should not login with invalid password', async () => {
    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should not login with non-existent user', async () => {
    await expect(
      authService.login({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should get current session', async () => {
    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    const session = await authService.getSession();
    expect(session).toBeDefined();
    expect(session?.userId).toBeDefined();
  });

  it('should get current user', async () => {
    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    const user = await authService.getCurrentUser();
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@example.com');
  });

  it('should logout successfully', async () => {
    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    await authService.logout();

    const session = await authService.getSession();
    expect(session).toBeNull();
  });

  it('should check if authenticated', async () => {
    expect(await authService.isAuthenticated()).toBe(false);

    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(await authService.isAuthenticated()).toBe(true);
  });

  it('should refresh session', async () => {
    await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    const newSession = await authService.refreshSession();
    expect(newSession).toBeDefined();
    expect(newSession?.token).toBeDefined();
  });
});
