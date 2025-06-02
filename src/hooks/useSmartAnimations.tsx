
import { useState, useEffect, useCallback } from 'react';

export interface AnimationConfig {
  duration: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  delay?: number;
  reducedMotion?: boolean;
}

export function useSmartAnimations() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check user's motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection Observer for scroll-triggered animations
  const createIntersectionObserver = useCallback((
    callback: (isIntersecting: boolean) => void,
    options?: IntersectionObserverInit
  ) => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          callback(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );
  }, []);

  // Smart animation class generator
  const getAnimationClass = useCallback((
    baseAnimation: string,
    config?: Partial<AnimationConfig>
  ): string => {
    if (prefersReducedMotion) {
      return 'transition-opacity duration-200'; // Minimal animation for accessibility
    }

    const {
      duration = 300,
      easing = 'ease-out',
      delay = 0
    } = config || {};

    // Convert to Tailwind classes
    const durationClass = {
      150: 'duration-150',
      200: 'duration-200',
      300: 'duration-300',
      500: 'duration-500',
      700: 'duration-700',
      1000: 'duration-1000'
    }[duration] || 'duration-300';

    const easingClass = {
      'ease': 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'linear': 'linear'
    }[easing] || 'ease-out';

    const delayClass = delay > 0 ? `delay-${delay}` : '';

    return `${baseAnimation} transition-all ${durationClass} ${easingClass} ${delayClass}`.trim();
  }, [prefersReducedMotion]);

  // Predefined animation sets
  const animations = {
    fadeIn: getAnimationClass('animate-fade-in'),
    slideUp: getAnimationClass('animate-slide-up'),
    scaleIn: getAnimationClass('animate-scale-in'),
    bounceIn: prefersReducedMotion ? getAnimationClass('animate-fade-in') : 'animate-bounce-in',
    
    // Hover animations
    hoverScale: getAnimationClass('hover:scale-105 transform'),
    hoverLift: getAnimationClass('hover:-translate-y-1 hover:shadow-lg transform'),
    hoverGlow: getAnimationClass('hover:shadow-glow transition-shadow'),
    
    // Loading animations
    pulse: prefersReducedMotion ? 'opacity-75' : 'animate-pulse',
    spin: prefersReducedMotion ? '' : 'animate-spin',
    
    // Page transitions
    pageEnter: getAnimationClass('animate-fade-in'),
    pageExit: getAnimationClass('animate-fade-out')
  };

  // Performance-optimized animation triggers
  const triggerAnimation = useCallback((
    element: HTMLElement,
    animationType: keyof typeof animations,
    options?: {
      cleanup?: boolean;
      onComplete?: () => void;
    }
  ) => {
    if (!element) return;

    const animationClass = animations[animationType];
    element.classList.add(...animationClass.split(' '));

    if (options?.onComplete) {
      const handleAnimationEnd = () => {
        options.onComplete?.();
        element.removeEventListener('animationend', handleAnimationEnd);
        element.removeEventListener('transitionend', handleAnimationEnd);
      };

      element.addEventListener('animationend', handleAnimationEnd);
      element.addEventListener('transitionend', handleAnimationEnd);
    }

    if (options?.cleanup) {
      setTimeout(() => {
        element.classList.remove(...animationClass.split(' '));
      }, 1000); // Cleanup after animation likely completed
    }
  }, [animations]);

  // Staggered animations for lists
  const staggerChildren = useCallback((
    container: HTMLElement,
    animationType: keyof typeof animations,
    staggerDelay: number = 100
  ) => {
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    
    children.forEach((child, index) => {
      setTimeout(() => {
        triggerAnimation(child, animationType);
      }, index * staggerDelay);
    });
  }, [triggerAnimation]);

  return {
    prefersReducedMotion,
    animations,
    getAnimationClass,
    triggerAnimation,
    staggerChildren,
    createIntersectionObserver,
    isVisible,
    setIsVisible
  };
}
