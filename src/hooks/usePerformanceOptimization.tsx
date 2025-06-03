
/**
 * @description Hook para otimização automática de performance
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';

interface PerformanceSettings {
  enableAutoOptimization: boolean;
  memoryThreshold: number;
  responseTimeThreshold: number;
  autoCleanupInterval: number;
}

const DEFAULT_SETTINGS: PerformanceSettings = {
  enableAutoOptimization: true,
  memoryThreshold: 85,
  responseTimeThreshold: 2000,
  autoCleanupInterval: 30000 // 30 segundos
};

export function usePerformanceOptimization(customSettings?: Partial<PerformanceSettings>) {
  const settings = { ...DEFAULT_SETTINGS, ...customSettings };
  const { metrics, getHealthScore } = useSystemMonitor();
  const [optimizationLevel, setOptimizationLevel] = useState<'none' | 'light' | 'aggressive'>('none');
  const cleanupTimerRef = useRef<number>();

  // Calcular nível de otimização baseado nas métricas
  const calculateOptimizationLevel = useCallback(() => {
    const healthScore = getHealthScore();
    const memoryUsage = metrics.memory.percentage;
    const networkLatency = metrics.network.latency;

    if (memoryUsage > settings.memoryThreshold || networkLatency > settings.responseTimeThreshold) {
      return 'aggressive';
    } else if (healthScore < 70) {
      return 'light';
    }
    
    return 'none';
  }, [metrics, getHealthScore, settings]);

  // Limpeza automática de recursos
  const performCleanup = useCallback(() => {
    // Limpar cache antigo
    const cacheKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('cache_') && 
      Date.now() - parseInt(localStorage.getItem(key + '_timestamp') || '0') > 300000
    );
    
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(key + '_timestamp');
    });

    // Forçar garbage collection se disponível
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }

    console.log('🧹 Performance: Limpeza automática executada');
  }, []);

  // Otimizações específicas por nível
  const applyOptimizations = useCallback((level: 'none' | 'light' | 'aggressive') => {
    switch (level) {
      case 'light':
        // Reduzir frequência de atualizações
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
        break;
        
      case 'aggressive':
        // Desabilitar animações e reduzir qualidade visual
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        document.documentElement.classList.add('reduce-motion');
        performCleanup();
        break;
        
      case 'none':
      default:
        // Restaurar configurações normais
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.classList.remove('reduce-motion');
        break;
    }
  }, [performCleanup]);

  // Efeito para monitoramento contínuo
  useEffect(() => {
    if (!settings.enableAutoOptimization) return;

    const newLevel = calculateOptimizationLevel();
    
    if (newLevel !== optimizationLevel) {
      setOptimizationLevel(newLevel);
      applyOptimizations(newLevel);
      
      console.log(`🎯 Performance: Nível de otimização alterado para ${newLevel}`);
    }
  }, [metrics, optimizationLevel, calculateOptimizationLevel, applyOptimizations, settings.enableAutoOptimization]);

  // Limpeza automática periódica
  useEffect(() => {
    if (settings.enableAutoOptimization) {
      cleanupTimerRef.current = window.setInterval(performCleanup, settings.autoCleanupInterval);
    }

    return () => {
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, [settings.enableAutoOptimization, settings.autoCleanupInterval, performCleanup]);

  // Função para otimização manual
  const forceOptimization = useCallback(() => {
    performCleanup();
    applyOptimizations('aggressive');
    
    setTimeout(() => {
      const newLevel = calculateOptimizationLevel();
      applyOptimizations(newLevel);
      setOptimizationLevel(newLevel);
    }, 5000);
  }, [performCleanup, applyOptimizations, calculateOptimizationLevel]);

  // Métricas de performance otimizada
  const getPerformanceInsights = useCallback(() => {
    const healthScore = getHealthScore();
    
    return {
      currentLevel: optimizationLevel,
      healthScore,
      memoryUsage: metrics.memory.percentage,
      networkLatency: metrics.network.latency,
      recommendations: [
        ...(metrics.memory.percentage > 80 ? ['Considere fechar abas desnecessárias'] : []),
        ...(metrics.network.latency > 1000 ? ['Conexão lenta detectada'] : []),
        ...(healthScore < 60 ? ['Sistema sob stress - otimizações ativas'] : [])
      ]
    };
  }, [optimizationLevel, getHealthScore, metrics]);

  return {
    optimizationLevel,
    forceOptimization,
    getPerformanceInsights,
    isOptimizing: optimizationLevel !== 'none'
  };
}

export default usePerformanceOptimization;
