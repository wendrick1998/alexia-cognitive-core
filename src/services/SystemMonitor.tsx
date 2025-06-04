
/**
 * @description Serviço de monitoramento do sistema
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    latency: number;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  };
  performance: {
    fps: number;
    loadTime: number;
  };
  errors: {
    count: number;
    lastError?: Error;
  };
  // Core Web Vitals
  LCP: number | null;
  FID: number | null;
  CLS: number | null;
  FCP: number | null;
  TTFB: number | null;
  // Additional metrics for dashboard
  memoryUsage: number;
  jsHeapSize: number;
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  userSatisfaction: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

class SystemMonitor {
  private metrics: SystemMetrics;
  private alerts: Alert[] = [];
  private subscribers: ((metrics: SystemMetrics) => void)[] = [];
  private alertSubscribers: ((alert: Alert) => void)[] = [];

  constructor() {
    this.metrics = {
      memory: { used: 0, total: 0, percentage: 0 },
      network: { latency: 0, connectionQuality: 'good' },
      performance: { fps: 60, loadTime: 0 },
      errors: { count: 0 },
      LCP: null,
      FID: null,
      CLS: null,
      FCP: null,
      TTFB: null,
      memoryUsage: 0,
      jsHeapSize: 0,
      renderTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      userSatisfaction: 85
    };

    this.startMonitoring();
  }

  private startMonitoring() {
    // Monitor memory usage
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memory = {
          used: memory.usedJSHeapSize / (1024 * 1024),
          total: memory.totalJSHeapSize / (1024 * 1024),
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        };
        this.metrics.memoryUsage = this.metrics.memory.used;
        this.metrics.jsHeapSize = this.metrics.memory.total;
      }
      this.notifySubscribers();
    }, 5000);

    // Monitor network latency
    setInterval(async () => {
      const start = performance.now();
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
        const latency = performance.now() - start;
        this.metrics.network.latency = latency;
        this.metrics.apiResponseTime = latency;
        
        if (latency < 100) this.metrics.network.connectionQuality = 'excellent';
        else if (latency < 300) this.metrics.network.connectionQuality = 'good';
        else this.metrics.network.connectionQuality = 'poor';
      } catch {
        this.metrics.network.connectionQuality = 'offline';
      }
      this.notifySubscribers();
    }, 10000);

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              this.metrics.LCP = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              this.metrics.FID = (entry as any).processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              this.metrics.CLS = (this.metrics.CLS || 0) + (entry as any).value;
            }
          }
          this.notifySubscribers();
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance observer not supported');
      }
    }
  }

  subscribe(callback: (metrics: SystemMetrics) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  subscribeToAlerts(callback: (alert: Alert) => void) {
    this.alertSubscribers.push(callback);
    return () => {
      this.alertSubscribers = this.alertSubscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.metrics));
  }

  private addAlert(type: Alert['type'], message: string) {
    const alert: Alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.unshift(alert);
    this.alertSubscribers.forEach(callback => callback(alert));
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getAlerts() {
    return this.alerts;
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  clearResolvedAlerts() {
    this.alerts = this.alerts.filter(alert => !alert.resolved);
  }
}

export const systemMonitor = new SystemMonitor();
