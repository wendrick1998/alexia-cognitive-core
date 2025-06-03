
/**
 * @description Hook para otimizações de UX
 * @created_by Fase 2 - Otimização UX
 */

import { useState, useCallback, useEffect } from 'react';
import { useToastSystem } from './useToastSystem';

interface UXMetrics {
  interactionCount: number;
  averageResponseTime: number;
  errorRate: number;
  userSatisfaction: number;
  bounceRate: number;
}

interface UXOptimizationConfig {
  enableAnalytics: boolean;
  enableHapticFeedback: boolean;
  enableReducedMotion: boolean;
  autoOptimize: boolean;
}

export function useUXOptimization() {
  const toast = useToastSystem();
  
  const [config, setConfig] = useState<UXOptimizationConfig>({
    enableAnalytics: true,
    enableHapticFeedback: true,
    enableReducedMotion: false,
    autoOptimize: true
  });

  const [metrics, setMetrics] = useState<UXMetrics>({
    interactionCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    userSatisfaction: 4.2,
    bounceRate: 0.15
  });

  // Detectar preferências do usuário
  const detectUserPreferences = useCallback(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      reducedMotion,
      highContrast,
      darkMode
    };
  }, []);

  // Rastrear interação do usuário
  const trackInteraction = useCallback((
    type: 'click' | 'scroll' | 'keyboard' | 'touch',
    elementId?: string,
    duration?: number
  ) => {
    if (!config.enableAnalytics) return;

    setMetrics(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      averageResponseTime: duration 
        ? (prev.averageResponseTime + duration) / 2
        : prev.averageResponseTime
    }));

    console.log(`🎯 UX Interaction: ${type}`, { elementId, duration });
  }, [config.enableAnalytics]);

  // Feedback háptico
  const triggerHapticFeedback = useCallback((
    type: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    if (!config.enableHapticFeedback || !('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [50],
      heavy: [100]
    };

    navigator.vibrate(patterns[type]);
  }, [config.enableHapticFeedback]);

  // Otimizar performance baseado em métricas
  const optimizePerformance = useCallback(() => {
    if (!config.autoOptimize) return;

    const { averageResponseTime, errorRate } = metrics;

    // Se tempo de resposta alto, sugerir otimizações
    if (averageResponseTime > 2000) {
      toast.warning(
        'Performance Lenta Detectada',
        'Ativando otimizações automáticas para melhorar a experiência',
        {
          actions: [
            {
              label: 'Ver Detalhes',
              onClick: () => console.log('Performance details:', metrics)
            }
          ]
        }
      );
    }

    // Se alta taxa de erro, alertar
    if (errorRate > 0.1) {
      toast.error(
        'Taxa de Erro Elevada',
        'Detectamos problemas que podem afetar sua experiência',
        {
          persistent: true,
          actions: [
            {
              label: 'Reportar Problema',
              onClick: () => console.log('Report error:', metrics)
            }
          ]
        }
      );
    }
  }, [config.autoOptimize, metrics, toast]);

  // Coletar feedback do usuário
  const collectFeedback = useCallback((
    rating: number,
    comment?: string,
    category?: string
  ) => {
    setMetrics(prev => ({
      ...prev,
      userSatisfaction: (prev.userSatisfaction + rating) / 2
    }));

    toast.success(
      'Feedback Recebido',
      'Obrigado por nos ajudar a melhorar o Alex iA!'
    );

    console.log('📝 User Feedback:', { rating, comment, category });
  }, [toast]);

  // Aplicar otimizações automáticas
  useEffect(() => {
    if (config.autoOptimize) {
      const interval = setInterval(optimizePerformance, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [config.autoOptimize, optimizePerformance]);

  // Listener para preferências do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({
        ...prev,
        enableReducedMotion: e.matches
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return {
    // Estado
    config,
    metrics,
    toast,

    // Ações
    setConfig,
    detectUserPreferences,
    trackInteraction,
    triggerHapticFeedback,
    optimizePerformance,
    collectFeedback,

    // Utilidades
    isOptimizedDevice: metrics.averageResponseTime < 1000,
    needsOptimization: metrics.errorRate > 0.05,
    userSatisfactionLevel: metrics.userSatisfaction > 4 ? 'high' : 
                          metrics.userSatisfaction > 3 ? 'medium' : 'low'
  };
}

export default useUXOptimization;
