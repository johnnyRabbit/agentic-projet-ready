// ============================================================
// PERFORMANCE MONITOR — Track performance metrics
// ============================================================

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  name: string;
  value: number;
  unit: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 10000;
  private webVitals: WebVitals = {};

  /**
   * Record a metric
   */
  record(
    name: string,
    value: number,
    unit: string,
    options: {
      component?: string;
      metadata?: Record<string, unknown>;
    } = {}
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      name,
      value,
      unit,
      component: options.component,
      metadata: options.metadata,
    };

    this.metrics.push(metric);

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    return metric;
  }

  /**
   * Start a timer
   */
  startTimer(name: string): () => PerformanceMetric {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      return this.record(name, duration, 'ms');
    };
  }

  /**
   * Measure a function execution
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const endTimer = this.startTimer(name);
    try {
      const result = await fn();
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  }

  /**
   * Record Web Vitals
   */
  recordWebVitals(vitals: WebVitals): void {
    this.webVitals = { ...this.webVitals, ...vitals };

    // Record each vital as a metric
    Object.entries(vitals).forEach(([name, value]) => {
      if (value !== undefined) {
        const unit = name === 'cls' ? 'score' : 'ms';
        this.record(`web-vital-${name}`, value, unit, {
          component: 'web-vitals',
        });
      }
    });
  }

  /**
   * Get all metrics
   */
  getAll(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get metrics by component
   */
  getByComponent(component: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.component === component);
  }

  /**
   * Get recent metrics
   */
  getRecent(limit: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit).reverse();
  }

  /**
   * Get Web Vitals
   */
  getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  /**
   * Get average value for a metric
   */
  getAverage(name: string): number {
    const metrics = this.getByName(name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  /**
   * Get min value for a metric
   */
  getMin(name: string): number {
    const metrics = this.getByName(name);
    if (metrics.length === 0) return 0;
    return Math.min(...metrics.map((m) => m.value));
  }

  /**
   * Get max value for a metric
   */
  getMax(name: string): number {
    const metrics = this.getByName(name);
    if (metrics.length === 0) return 0;
    return Math.max(...metrics.map((m) => m.value));
  }

  /**
   * Get percentiles for a metric
   */
  getPercentiles(name: string): { p50: number; p90: number; p95: number; p99: number } {
    const metrics = this.getByName(name);
    if (metrics.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const length = values.length;

    return {
      p50: values[Math.floor(length * 0.5)],
      p90: values[Math.floor(length * 0.9)],
      p95: values[Math.floor(length * 0.95)],
      p99: values[Math.floor(length * 0.99)],
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.webVitals = {};
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    byName: Record<string, number>;
    byComponent: Record<string, number>;
  } {
    const byName: Record<string, number> = {};
    const byComponent: Record<string, number> = {};

    this.metrics.forEach((metric) => {
      byName[metric.name] = (byName[metric.name] || 0) + 1;
      if (metric.component) {
        byComponent[metric.component] = (byComponent[metric.component] || 0) + 1;
      }
    });

    return {
      total: this.metrics.length,
      byName,
      byComponent,
    };
  }

  /**
   * Export metrics
   */
  export(): string {
    return JSON.stringify(
      {
        metrics: this.metrics,
        webVitals: this.webVitals,
      },
      null,
      2
    );
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Automatically collect Web Vitals if available
if (typeof window !== 'undefined' && 'performance' in window) {
  // Collect TTFB
  window.addEventListener('load', () => {
    const [navigationEntry] = performance.getEntriesByType('navigation');
    if (navigationEntry) {
      performanceMonitor.recordWebVitals({
        ttfb: (navigationEntry as PerformanceNavigationTiming).responseStart,
      });
    }
  });

  // Collect FCP, LCP, FID, CLS using PerformanceObserver
  if ('PerformanceObserver' in window) {
    // FCP
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        performanceMonitor.recordWebVitals({
          fcp: entries[0].startTime,
        });
      }
    });
    try {
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // Browser doesn't support paint timing
    }

    // LCP
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        performanceMonitor.recordWebVitals({
          lcp: entries[entries.length - 1].startTime,
        });
      }
    });
    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Browser doesn't support LCP
    }

    // FID
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const firstInput = entries[0] as PerformanceEventTiming;
        performanceMonitor.recordWebVitals({
          fid: firstInput.processingStart - firstInput.startTime,
        });
      }
    });
    try {
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // Browser doesn't support FID
    }
  }
}
