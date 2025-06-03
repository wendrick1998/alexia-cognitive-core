
/**
 * @description Hook para otimizar animações baseado na preferência do usuário
 * @created_by Performance Optimization Sprint
 */

import { useEffect, useState } from 'react';

export function useOptimizedAnimation() {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    // Verificar preferência do usuário para movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!prefersReducedMotion.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAnimate(!e.matches);
    };

    prefersReducedMotion.addEventListener('change', handleChange);
    return () => prefersReducedMotion.removeEventListener('change', handleChange);
  }, []);

  const getAnimationDuration = (baseDuration: number) => {
    return shouldAnimate ? baseDuration : 0.1;
  };

  const getAnimationDelay = (baseDelay: number) => {
    return shouldAnimate ? baseDelay : 0;
  };

  return {
    shouldAnimate,
    getAnimationDuration,
    getAnimationDelay
  };
}
