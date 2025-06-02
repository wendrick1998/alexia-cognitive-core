
import { useEffect, useRef, useState } from 'react';

interface AnimationConfig {
  reducedMotion: boolean;
  frameRate: number;
  performanceMode: 'high' | 'balanced' | 'battery';
}

export function useOptimizedAnimation() {
  const [config, setConfig] = useState<AnimationConfig>({
    reducedMotion: false,
    frameRate: 60,
    performanceMode: 'balanced'
  });

  const frameRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);

  useEffect(() => {
    // Detectar preferência de movimento reduzido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setConfig(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setConfig(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Detectar performance do dispositivo
    const detectPerformance = () => {
      const connection = (navigator as any).connection;
      const memory = (performance as any).memory;

      let performanceMode: 'high' | 'balanced' | 'battery' = 'balanced';

      // Verificar conexão
      if (connection?.effectiveType === '4g' && connection?.downlink > 10) {
        performanceMode = 'high';
      } else if (connection?.effectiveType === '3g' || connection?.saveData) {
        performanceMode = 'battery';
      }

      // Verificar memória disponível
      if (memory?.usedJSHeapSize > memory?.jsHeapSizeLimit * 0.8) {
        performanceMode = 'battery';
      }

      setConfig(prev => ({ ...prev, performanceMode }));
    };

    detectPerformance();
  }, []);

  const requestOptimizedFrame = (callback: FrameRequestCallback) => {
    if (config.reducedMotion) {
      // Para usuários com movimento reduzido, executar imediatamente
      callback(performance.now());
      return;
    }

    const targetFrameTime = 1000 / config.frameRate;

    const wrappedCallback: FrameRequestCallback = (time) => {
      if (time - lastFrameTime.current >= targetFrameTime) {
        lastFrameTime.current = time;
        callback(time);
      } else {
        frameRef.current = requestAnimationFrame(wrappedCallback);
      }
    };

    frameRef.current = requestAnimationFrame(wrappedCallback);
  };

  const cancelOptimizedFrame = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  };

  const getAnimationDuration = (baseDuration: number): number => {
    if (config.reducedMotion) return 0;
    
    switch (config.performanceMode) {
      case 'battery':
        return baseDuration * 0.5;
      case 'high':
        return baseDuration * 1.2;
      default:
        return baseDuration;
    }
  };

  const shouldAnimate = !config.reducedMotion;

  return {
    config,
    requestOptimizedFrame,
    cancelOptimizedFrame,
    getAnimationDuration,
    shouldAnimate
  };
}
