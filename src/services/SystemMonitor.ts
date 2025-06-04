
/**
 * @description Sistema de monitoramento e observabilidade em tempo real
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    responseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  network: {
    latency: number;
    bandwidth: number;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  };
  ui: {
    renderTime: number;
    bundleSize: number;
    chunksLoaded: number;
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
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SystemMonitor {
  private metrics: SystemMetrics = {
    memory: { used: 0, total: 0, percentage: 0 },
    performance: { responseTime: 0, requestsPerSecond: 0, errorRate: 0 },
    network: { latency: 0, bandwidth: 0, connectionQuality: 'good' },
    ui: { renderTime: 0, bundleSize: 0, chunksLoaded: 0 },
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

  private alerts: Alert[] = [];
  private listeners: Array<(metrics: SystemMetrics) => void> = [];
  private alertListeners: Array<(alert: Alert) => void> = [];
  private isMonitoring = false;
  private intervalId?: number;

  constructor() {
    this.startMonitoring();
  }

  public startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = window.setInterval(() => {
      this.collectMetrics();
    }, 5000); // Coleta métricas a cada 5 segundos

    // Monitorar erros globalmente
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }

  private async collectMetrics() {
    try {
      // Coletar métricas de memória
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        this.metrics.memory = {
          used: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          percentage: (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100
        };
        this.metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024);
        this.metrics.jsHeapSize = memInfo.totalJSHeapSize / (1024 * 1024);
      }

      // Coletar métricas de performance
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        this.metrics.performance.responseTime = navigationTiming.responseEnd - navigationTiming.requestStart;
        this.metrics.apiResponseTime = this.metrics.performance.responseTime;
      }

      // Core Web Vitals
      this.collectWebVitals();

      // Coletar métricas de rede
      await this.measureNetworkQuality();

      // Coletar métricas de UI
      this.collectUIMetrics();

      // Notificar listeners
      this.notifyListeners();

      // Verificar alertas
      this.checkAlerts();
    } catch (error) {
      console.error('Erro ao coletar métricas:', error);
    }
  }

  private collectWebVitals() {
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
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              this.metrics.FCP = entry.startTime;
            }
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'] });
      } catch (error) {
        console.warn('Performance observer not supported');
      }
    }
  }

  private async measureNetworkQuality() {
    const startTime = performance.now();
    
    try {
      // Fazer uma pequena requisição para medir latência
      const response = await fetch('/favicon.ico', { 
        cache: 'no-cache',
        method: 'HEAD'
      });
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      this.metrics.network.latency = latency;
      
      // Determinar qualidade da conexão baseada na latência
      if (latency < 100) {
        this.metrics.network.connectionQuality = 'excellent';
      } else if (latency < 300) {
        this.metrics.network.connectionQuality = 'good';
      } else if (latency < 1000) {
        this.metrics.network.connectionQuality = 'poor';
      } else {
        this.metrics.network.connectionQuality = 'offline';
      }
    } catch (error) {
      this.metrics.network.connectionQuality = 'offline';
      this.metrics.network.latency = Infinity;
    }
  }

  private collectUIMetrics() {
    // Coletar métricas de recursos carregados
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    let chunksCount = 0;

    resources.forEach(resource => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        totalSize += (resource as any).transferSize || 0;
        if (resource.name.includes('.js')) chunksCount++;
      }
    });

    this.metrics.ui.bundleSize = Math.round(totalSize / 1024); // KB
    this.metrics.ui.chunksLoaded = chunksCount;

    // Medir tempo de renderização
    const paintTiming = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintTiming.find(entry => entry.name === 'first-contentful-paint');
    if (firstContentfulPaint) {
      this.metrics.ui.renderTime = firstContentfulPaint.startTime;
      this.metrics.renderTime = firstContentfulPaint.startTime;
    }
  }

  private checkAlerts() {
    // Verificar uso de memória
    if (this.metrics.memory.percentage > 85) {
      this.createAlert('high', 'Uso de memória elevado', `Memória em ${this.metrics.memory.percentage.toFixed(1)}%`);
    }

    // Verificar latência de rede
    if (this.metrics.network.latency > 2000) {
      this.createAlert('medium', 'Latência alta', `Latência de rede: ${this.metrics.network.latency.toFixed(0)}ms`);
    }

    // Verificar qualidade da conexão
    if (this.metrics.network.connectionQuality === 'offline') {
      this.createAlert('critical', 'Sem conectividade', 'Conexão com a internet perdida');
    }
  }

  private createAlert(severity: 'low' | 'medium' | 'high' | 'critical', message: string, details: string) {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'info',
      message: `${message}: ${details}`,
      timestamp: new Date(),
      resolved: false,
      severity
    };

    this.alerts.unshift(alert);
    
    // Manter apenas os últimos 50 alertas
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }

    // Notificar listeners de alertas
    this.alertListeners.forEach(listener => listener(alert));
  }

  private handleError(event: ErrorEvent) {
    this.createAlert('high', 'Erro JavaScript', event.message);
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    this.createAlert('medium', 'Promise rejeitada', event.reason?.toString() || 'Erro desconhecido');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.metrics }));
  }

  public subscribe(listener: (metrics: SystemMetrics) => void) {
    this.listeners.push(listener);
    // Enviar métricas atuais imediatamente
    listener({ ...this.metrics });
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeToAlerts(listener: (alert: Alert) => void) {
    this.alertListeners.push(listener);
    
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== listener);
    };
  }

  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public getAlerts(): Alert[] {
    return [...this.alerts];
  }

  public resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  public clearResolvedAlerts() {
    this.alerts = this.alerts.filter(alert => !alert.resolved);
  }
}

export const systemMonitor = new SystemMonitor();
