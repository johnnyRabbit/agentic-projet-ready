import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorTracker } from '../../observability/ErrorTracker';

describe('ErrorTracker', () => {
  let errorTracker: ErrorTracker;

  beforeEach(() => {
    errorTracker = new ErrorTracker();
  });

  it('should track an error', () => {
    const entry = errorTracker.track(new Error('Test error'), {
      component: 'TestComponent',
      userId: 'user-1',
    });

    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.message).toBe('Test error');
    expect(entry.component).toBe('TestComponent');
    expect(entry.userId).toBe('user-1');
  });

  it('should track string error', () => {
    const entry = errorTracker.track('String error message');

    expect(entry).toBeDefined();
    expect(entry.message).toBe('String error message');
  });

  it('should get all errors', () => {
    errorTracker.track(new Error('Error 1'));
    errorTracker.track(new Error('Error 2'));
    errorTracker.track(new Error('Error 3'));

    const errors = errorTracker.getAll();
    expect(errors.length).toBe(3);
  });

  it('should get unresolved errors', () => {
    const error1 = errorTracker.track(new Error('Error 1'));
    errorTracker.track(new Error('Error 2'));

    errorTracker.resolve(error1.id);

    const unresolved = errorTracker.getUnresolved();
    expect(unresolved.length).toBe(1);
    expect(unresolved[0].message).toBe('Error 2');
  });

  it('should resolve error', () => {
    const error = errorTracker.track(new Error('Test error'));

    errorTracker.resolve(error.id);

    const errors = errorTracker.getAll();
    const resolved = errors.find((e) => e.id === error.id);
    expect(resolved?.resolved).toBe(true);
  });

  it('should get errors by severity', () => {
    errorTracker.track(new Error('Error 1'), { severity: 'error' });
    errorTracker.track(new Error('Error 2'), { severity: 'critical' });
    errorTracker.track(new Error('Error 3'), { severity: 'error' });

    const errors = errorTracker.getBySeverity('error');
    expect(errors.length).toBe(2);
  });

  it('should get errors by component', () => {
    errorTracker.track(new Error('Error 1'), { component: 'ComponentA' });
    errorTracker.track(new Error('Error 2'), { component: 'ComponentB' });
    errorTracker.track(new Error('Error 3'), { component: 'ComponentA' });

    const errors = errorTracker.getByComponent('ComponentA');
    expect(errors.length).toBe(2);
  });

  it('should get recent errors', () => {
    for (let i = 0; i < 150; i++) {
      errorTracker.track(new Error(`Error ${i}`));
    }

    const recent = errorTracker.getRecent(100);
    expect(recent.length).toBe(100);
  });

  it('should call onError callbacks', () => {
    let callbackCalled = false;
    errorTracker.onError(() => {
      callbackCalled = true;
    });

    errorTracker.track(new Error('Test error'));

    expect(callbackCalled).toBe(true);
  });

  it('should clear all errors', () => {
    errorTracker.track(new Error('Error 1'));
    errorTracker.track(new Error('Error 2'));

    errorTracker.clear();
    const errors = errorTracker.getAll();
    expect(errors.length).toBe(0);
  });

  it('should get statistics', () => {
    errorTracker.track(new Error('Error 1'), { severity: 'error', component: 'A' });
    errorTracker.track(new Error('Error 2'), { severity: 'critical', component: 'B' });
    errorTracker.track(new Error('Error 3'), { severity: 'error', component: 'A' });

    const stats = errorTracker.getStats();
    expect(stats.total).toBe(3);
    expect(stats.unresolved).toBe(3);
    expect(stats.bySeverity.error).toBe(2);
    expect(stats.bySeverity.critical).toBe(1);
    expect(stats.byComponent.A).toBe(2);
    expect(stats.byComponent.B).toBe(1);
  });

  it('should export errors', () => {
    errorTracker.track(new Error('Error 1'));
    errorTracker.track(new Error('Error 2'));

    const exported = errorTracker.export();
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('string');

    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
  });

  it('should limit errors to maxErrors', () => {
    const trackerSmall = new ErrorTracker();
    Reflect.set(trackerSmall, 'maxErrors', 10);

    for (let i = 0; i < 20; i++) {
      trackerSmall.track(new Error(`Error ${i}`));
    }

    const errors = trackerSmall.getAll();
    expect(errors.length).toBe(10);
  });

  it('should include stack trace for Error objects', () => {
    const error = new Error('Test error');
    const entry = errorTracker.track(error);

    expect(entry.stack).toBeDefined();
    expect(entry.stack).toContain('Error: Test error');
  });
});
