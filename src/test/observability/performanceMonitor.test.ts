import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor } from '../../observability/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('should record a metric', () => {
    const metric = monitor.record('load-time', 150, 'ms', {
      component: 'App',
    });

    expect(metric).toBeDefined();
    expect(metric.id).toBeDefined();
    expect(metric.name).toBe('load-time');
    expect(metric.value).toBe(150);
    expect(metric.unit).toBe('ms');
    expect(metric.component).toBe('App');
  });

  it('should get all metrics', () => {
    monitor.record('metric-1', 100, 'ms');
    monitor.record('metric-2', 200, 'ms');
    monitor.record('metric-3', 300, 'ms');

    const metrics = monitor.getAll();
    expect(metrics.length).toBe(3);
  });

  it('should get metrics by name', () => {
    monitor.record('load-time', 100, 'ms');
    monitor.record('render-time', 50, 'ms');
    monitor.record('load-time', 150, 'ms');

    const metrics = monitor.getByName('load-time');
    expect(metrics.length).toBe(2);
  });

  it('should get metrics by component', () => {
    monitor.record('load-time', 100, 'ms', { component: 'App' });
    monitor.record('render-time', 50, 'ms', { component: 'Header' });
    monitor.record('load-time', 150, 'ms', { component: 'App' });

    const metrics = monitor.getByComponent('App');
    expect(metrics.length).toBe(2);
  });

  it('should get recent metrics', () => {
    for (let i = 0; i < 150; i++) {
      monitor.record('metric', i, 'ms');
    }

    const recent = monitor.getRecent(100);
    expect(recent.length).toBe(100);
  });

  it('should record web vitals', () => {
    monitor.recordWebVitals({
      fcp: 1000,
      lcp: 2000,
      fid: 50,
      cls: 0.1,
    });

    const vitals = monitor.getWebVitals();
    expect(vitals.fcp).toBe(1000);
    expect(vitals.lcp).toBe(2000);
    expect(vitals.fid).toBe(50);
    expect(vitals.cls).toBe(0.1);
  });

  it('should calculate average', () => {
    monitor.record('load-time', 100, 'ms');
    monitor.record('load-time', 200, 'ms');
    monitor.record('load-time', 300, 'ms');

    const avg = monitor.getAverage('load-time');
    expect(avg).toBe(200);
  });

  it('should calculate min', () => {
    monitor.record('load-time', 100, 'ms');
    monitor.record('load-time', 50, 'ms');
    monitor.record('load-time', 200, 'ms');

    const min = monitor.getMin('load-time');
    expect(min).toBe(50);
  });

  it('should calculate max', () => {
    monitor.record('load-time', 100, 'ms');
    monitor.record('load-time', 300, 'ms');
    monitor.record('load-time', 200, 'ms');

    const max = monitor.getMax('load-time');
    expect(max).toBe(300);
  });

  it('should calculate percentiles', () => {
    for (let i = 1; i <= 100; i++) {
      monitor.record('load-time', i, 'ms');
    }

    const percentiles = monitor.getPercentiles('load-time');
    expect(percentiles.p50).toBe(50);
    expect(percentiles.p90).toBe(90);
    expect(percentiles.p95).toBe(95);
    expect(percentiles.p99).toBe(99);
  });

  it('should return 0 for non-existent metric stats', () => {
    expect(monitor.getAverage('non-existent')).toBe(0);
    expect(monitor.getMin('non-existent')).toBe(0);
    expect(monitor.getMax('non-existent')).toBe(0);
  });

  it('should start and stop timer', () => {
    const endTimer = monitor.startTimer('operation');
    
    // Simulate some work
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Wait 10ms
    }
    
    const metric = endTimer();
    expect(metric.name).toBe('operation');
    expect(metric.value).toBeGreaterThanOrEqual(10);
    expect(metric.unit).toBe('ms');
  });

  it('should measure async function', async () => {
    const result = await monitor.measure('async-operation', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'result';
    });

    expect(result).toBe('result');
    
    const metrics = monitor.getByName('async-operation');
    expect(metrics.length).toBe(1);
    expect(metrics[0].value).toBeGreaterThanOrEqual(10);
  });

  it('should clear all metrics', () => {
    monitor.record('metric-1', 100, 'ms');
    monitor.record('metric-2', 200, 'ms');
    monitor.recordWebVitals({ fcp: 1000 });

    monitor.clear();
    
    expect(monitor.getAll().length).toBe(0);
    expect(Object.keys(monitor.getWebVitals()).length).toBe(0);
  });

  it('should get statistics', () => {
    monitor.record('load-time', 100, 'ms', { component: 'App' });
    monitor.record('render-time', 50, 'ms', { component: 'Header' });
    monitor.record('load-time', 150, 'ms', { component: 'App' });

    const stats = monitor.getStats();
    expect(stats.total).toBe(3);
    expect(stats.byName['load-time']).toBe(2);
    expect(stats.byName['render-time']).toBe(1);
    expect(stats.byComponent.App).toBe(2);
    expect(stats.byComponent.Header).toBe(1);
  });

  it('should export metrics', () => {
    monitor.record('metric-1', 100, 'ms');
    monitor.recordWebVitals({ fcp: 1000 });

    const exported = monitor.export();
    expect(exported).toBeDefined();
    expect(typeof exported).toBe('string');
    
    const parsed = JSON.parse(exported);
    expect(parsed.metrics).toBeDefined();
    expect(parsed.webVitals).toBeDefined();
    expect(parsed.metrics.length).toBe(1);
    expect(parsed.webVitals.fcp).toBe(1000);
  });

  it('should limit metrics to maxMetrics', () => {
    const monitorSmall = new PerformanceMonitor();
    (monitorSmall as any).maxMetrics = 10;

    for (let i = 0; i < 20; i++) {
      monitorSmall.record('metric', i, 'ms');
    }

    const metrics = monitorSmall.getAll();
    expect(metrics.length).toBe(10);
  });
});
