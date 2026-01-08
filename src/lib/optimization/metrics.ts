import { performance } from 'node:perf_hooks';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  measureAsync = async <T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> => {
    const start = performance.now();
    let success = true;

    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - start;
      this.recordMetric({
        operation,
        duration,
        timestamp: Date.now(),
        success,
        metadata
      });
    }
  };

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  getMetrics(options?: {
    operation?: string;
    timeRange?: { start: number; end: number };
  }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (options?.operation) {
      filtered = filtered.filter(m => m.operation === options.operation);
    }

    if (options?.timeRange) {
      filtered = filtered.filter(
        m => m.timestamp >= options.timeRange!.start && 
            m.timestamp <= options.timeRange!.end
      );
    }

    return filtered;
  }

  getAverageResponseTime(operation: string): number {
    const metrics = this.getMetrics({ operation });
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getP95ResponseTime(operation: string): number {
    const metrics = this.getMetrics({ operation })
      .map(m => m.duration)
      .sort((a, b) => a - b);
      
    if (metrics.length === 0) return 0;
    
    const idx = Math.ceil(metrics.length * 0.95) - 1;
    return metrics[idx];
  }

  getSuccessRate(operation: string): number {
    const metrics = this.getMetrics({ operation });
    if (metrics.length === 0) return 0;

    const successful = metrics.filter(m => m.success).length;
    return (successful / metrics.length) * 100;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();