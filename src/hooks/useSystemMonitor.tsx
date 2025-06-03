
/**
 * @description Hook para monitoramento do sistema
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import { useState, useEffect } from 'react';
import { systemMonitor, SystemMetrics, Alert } from '@/services/SystemMonitor';

export function useSystemMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>(systemMonitor.getMetrics());
  const [alerts, setAlerts] = useState<Alert[]>(systemMonitor.getAlerts());
  const [isConnected, setIsConnected] = useState(navigator.onLine);

  useEffect(() => {
    // Subscrever às métricas
    const unsubscribeMetrics = systemMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    // Subscrever aos alertas
    const unsubscribeAlerts = systemMonitor.subscribeToAlerts((newAlert) => {
      setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
    });

    // Monitorar conexão
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resolveAlert = (alertId: string) => {
    systemMonitor.resolveAlert(alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const clearResolvedAlerts = () => {
    systemMonitor.clearResolvedAlerts();
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  };

  const getHealthScore = () => {
    let score = 100;
    
    // Deduzir pontos baseado nas métricas
    if (metrics.memory.percentage > 80) score -= 20;
    if (metrics.network.latency > 1000) score -= 15;
    if (metrics.network.connectionQuality === 'poor') score -= 10;
    if (metrics.network.connectionQuality === 'offline') score -= 30;
    
    // Deduzir pontos por alertas não resolvidos
    const unresolvedAlerts = alerts.filter(a => !a.resolved);
    score -= unresolvedAlerts.length * 5;
    
    return Math.max(0, score);
  };

  const getSystemStatus = () => {
    const healthScore = getHealthScore();
    
    if (healthScore >= 80) return 'healthy';
    if (healthScore >= 60) return 'warning';
    return 'critical';
  };

  return {
    metrics,
    alerts,
    isConnected,
    resolveAlert,
    clearResolvedAlerts,
    getHealthScore,
    getSystemStatus,
    unresolvedAlerts: alerts.filter(a => !a.resolved)
  };
}

export default useSystemMonitor;
