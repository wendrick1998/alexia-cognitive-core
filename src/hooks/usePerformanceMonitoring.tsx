
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  // Core Web Vitals
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
  
  // Custom metrics
  memoryUsage: number;
  jsHeapSize: number;
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  userSatisfaction: number;
}

interface PerformanceAlert {
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

export function usePerformanceMonitoring() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
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
    userSatisfaction: 0
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const apiCallTimes = useRef<number[]>([]);
  const errorCount = useRef(0);
  const totalRequests = useRef(0);

  // Thresholds for performance alerts
  const thresholds = {
    LCP: { warning: 2500, critical: 4000 },
    FID: { warning: 100, critical: 300 },
    CLS: { warning: 0.1, critical: 0.25 },
    FCP: { warning: 1800, critical: 3000 },
    TTFB: { warning: 800, critical: 1800 },
    memoryUsage: { warning: 50, critical: 80 }, // MB
    apiResponseTime: { warning: 1000, critical: 3000 }
  };

  // Initialize performance observers
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    // Core Web Vitals observer
    performanceObserver.current = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            updateMetric('LCP', entry.startTime);
            break;
          case 'first-input':
            updateMetric('FID', (entry as any).processingStart - entry.startTime);
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({
                ...prev,
                CLS: (prev.CLS || 0) + (entry as any).value
              }));
            }
            break;
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              updateMetric('FCP', entry.startTime);
            }
            break;
          case 'navigation':
            updateMetric('TTFB', (entry as any).responseStart);
            break;
        }
      });
    });

    // Observe all available performance metrics
    try {
      performanceObserver.current.observe({ 
        entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint', 'navigation'] 
      });
    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsageMB = memory.usedJSHeapSize / (1024 * 1024);
        const jsHeapSizeMB = memory.totalJSHeapSize / (1024 * 1024);
        
        updateMetric('memoryUsage', memoryUsageMB);
        updateMetric('jsHeapSize', jsHeapSizeMB);
      }
    };

    const interval = setInterval(updateMemoryMetrics, 5000);
    updateMemoryMetrics();

    return () => clearInterval(interval);
  }, []);

  // Update metric and check thresholds
  const updateMetric = useCallback((metricName: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [metricName]: value
    }));

    // Check thresholds
    const threshold = thresholds[metricName as keyof typeof thresholds];
    if (threshold) {
      let alertType: 'warning' | 'critical' | null = null;
      
      if (value >= threshold.critical) {
        alertType = 'critical';
      } else if (value >= threshold.warning) {
        alertType = 'warning';
      }

      if (alertType) {
        const alert: PerformanceAlert = {
          type: alertType,
          metric: metricName,
          value,
          threshold: threshold[alertType],
          message: `${metricName} (${value.toFixed(2)}) exceeded ${alertType} threshold (${threshold[alertType]})`,
          timestamp: new Date()
        };

        setAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts

        if (alertType === 'critical') {
          toast({
            title: "🚨 Performance Critical",
            description: alert.message,
            variant: "destructive",
          });
        }
      }
    }
  }, [toast]);

  // Track API response times
  const trackAPICall = useCallback((startTime: number, endTime: number, success: boolean) => {
    const responseTime = endTime - startTime;
    
    apiCallTimes.current.push(responseTime);
    if (apiCallTimes.current.length > 100) {
      apiCallTimes.current.shift(); // Keep last 100 calls
    }

    totalRequests.current++;
    if (!success) {
      errorCount.current++;
    }

    // Update metrics
    const avgResponseTime = apiCallTimes.current.reduce((a, b) => a + b, 0) / apiCallTimes.current.length;
    const errorRate = (errorCount.current / totalRequests.current) * 100;

    updateMetric('apiResponseTime', avgResponseTime);
    updateMetric('errorRate', errorRate);
  }, [updateMetric]);

  // Calculate user satisfaction score (Apdex-like)
  const calculateUserSatisfaction = useCallback(() => {
    const { LCP, FID, CLS } = metrics;
    
    if (LCP === null || FID === null || CLS === null) return 0;

    // Scoring based on Core Web Vitals
    let score = 0;
    
    // LCP scoring
    if (LCP <= 2500) score += 40;
    else if (LCP <= 4000) score += 20;
    
    // FID scoring
    if (FID <= 100) score += 30;
    else if (FID <= 300) score += 15;
    
    // CLS scoring
    if (CLS <= 0.1) score += 30;
    else if (CLS <= 0.25) score += 15;

    return score;
  }, [metrics]);

  // Update user satisfaction periodically
  useEffect(() => {
    const satisfaction = calculateUserSatisfaction();
    if (satisfaction > 0) {
      updateMetric('userSatisfaction', satisfaction);
    }
  }, [metrics.LCP, metrics.FID, metrics.CLS, calculateUserSatisfaction, updateMetric]);

  // Get performance score
  const getPerformanceScore = useCallback(() => {
    const { LCP, FID, CLS, FCP, TTFB } = metrics;
    
    if (!LCP || !FID || !CLS) return 0;

    let score = 100;
    
    // Deduct points for poor metrics
    if (LCP > 4000) score -= 30;
    else if (LCP > 2500) score -= 15;
    
    if (FID > 300) score -= 25;
    else if (FID > 100) score -= 10;
    
    if (CLS > 0.25) score -= 25;
    else if (CLS > 0.1) score -= 10;
    
    if (FCP && FCP > 3000) score -= 10;
    if (TTFB && TTFB > 1800) score -= 10;

    return Math.max(0, score);
  }, [metrics]);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    const analyticsData = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
      alerts: alerts,
      score: getPerformanceScore(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    };

    // Send to analytics service or download
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alex-ia-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "📊 Analytics Exportadas",
      description: "Dados de performance salvos com sucesso",
    });
  }, [metrics, alerts, getPerformanceScore, toast]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    metrics,
    alerts,
    performanceScore: getPerformanceScore(),
    trackAPICall,
    exportAnalytics,
    clearAlerts
  };
}
