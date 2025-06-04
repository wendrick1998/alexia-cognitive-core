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
      errors: { count: 0 }
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
        
        if (latency < 100) this.metrics.network.connectionQuality = 'excellent';
        else if (latency < 300) this.metrics.network.connectionQuality = 'good';
        else this.metrics.network.connectionQuality = 'poor';
      } catch {
        this.metrics.network.connectionQuality = 'offline';
      }
      this.notifySubscribers();
    }, 10000);
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
