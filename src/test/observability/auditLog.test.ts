import { describe, it, expect, beforeEach } from 'vitest';
import { AuditLog } from '../../observability/AuditLog';

describe('AuditLog', () => {
  let auditLog: AuditLog;

  beforeEach(() => {
    auditLog = new AuditLog();
  });

  it('should log an action', () => {
    const entry = auditLog.log('create', 'project', {
      userId: 'user-1',
      resourceId: 'project-1',
      details: { name: 'Test Project' },
    });

    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.action).toBe('create');
    expect(entry.resource).toBe('project');
    expect(entry.userId).toBe('user-1');
  });

  it('should get all entries', () => {
    auditLog.log('create', 'project');
    auditLog.log('update', 'project');
    auditLog.log('delete', 'project');

    const entries = auditLog.getAll();
    expect(entries.length).toBe(3);
  });

  it('should get entries by user', () => {
    auditLog.log('create', 'project', { userId: 'user-1' });
    auditLog.log('update', 'project', { userId: 'user-2' });
    auditLog.log('delete', 'project', { userId: 'user-1' });

    const entries = auditLog.getByUser('user-1');
    expect(entries.length).toBe(2);
  });

  it('should get entries by resource', () => {
    auditLog.log('create', 'project');
    auditLog.log('create', 'task');
    auditLog.log('update', 'project');

    const entries = auditLog.getByResource('project');
    expect(entries.length).toBe(2);
  });

  it('should get entries by action', () => {
    auditLog.log('create', 'project');
    auditLog.log('update', 'project');
    auditLog.log('create', 'task');

    const entries = auditLog.getByAction('create');
    expect(entries.length).toBe(2);
  });

  it('should get entries by severity', () => {
    auditLog.log('create', 'project', { severity: 'info' });
    auditLog.log('delete', 'project', { severity: 'warning' });
    auditLog.log('error', 'system', { severity: 'error' });

    const entries = auditLog.getBySeverity('warning');
    expect(entries.length).toBe(1);
  });

  it('should get recent entries', () => {
    for (let i = 0; i < 150; i++) {
      auditLog.log('action', 'resource');
    }

    const recent = auditLog.getRecent(100);
    expect(recent.length).toBe(100);
  });

  it('should get entries by time range', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    auditLog.log('old', 'resource');
    
    // Wait a bit
    const midTime = new Date();
    
    auditLog.log('new', 'resource');

    const entries = auditLog.getByTimeRange(midTime, now);
    expect(entries.length).toBeGreaterThanOrEqual(1);
  });

  it('should export audit log', () => {
    auditLog.log('create', 'project');
    auditLog.log('update', 'project');

    const exported = auditLog.export();
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('string');
    
    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
  });

  it('should clear audit log', () => {
    auditLog.log('create', 'project');
    auditLog.log('update', 'project');

    auditLog.clear();
    const entries = auditLog.getAll();
    expect(entries.length).toBe(0);
  });

  it('should get statistics', () => {
    auditLog.log('create', 'project', { severity: 'info' });
    auditLog.log('update', 'project', { severity: 'info' });
    auditLog.log('delete', 'project', { severity: 'warning' });

    const stats = auditLog.getStats();
    expect(stats.total).toBe(3);
    expect(stats.bySeverity.info).toBe(2);
    expect(stats.bySeverity.warning).toBe(1);
    expect(stats.byAction.create).toBe(1);
    expect(stats.byResource.project).toBe(3);
  });

  it('should limit entries to maxEntries', () => {
    const auditLogSmall = new AuditLog();
    (auditLogSmall as any).maxEntries = 10;

    for (let i = 0; i < 20; i++) {
      auditLogSmall.log('action', 'resource');
    }

    const entries = auditLogSmall.getAll();
    expect(entries.length).toBe(10);
  });
});
