
/**
 * @description Carregador lazy para componentes com fallback otimizado
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import React, { Suspense, ComponentType } from 'react';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

interface LazyComponentLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingType?: 'general' | 'chat' | 'search' | 'database' | 'document' | 'brain';
  minLoadTime?: number; // Tempo mínimo de loading para evitar flash
}

export function LazyComponentLoader({ 
  children, 
  fallback,
  loadingType = 'general',
  minLoadTime = 300 
}: LazyComponentLoaderProps) {
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <SmartLoadingSpinner 
        type={loadingType}
        message="Carregando componente..."
      />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// Higher-order component para lazy loading
export function withLazyLoading<P extends Record<string, any>>(
  Component: ComponentType<P>,
  loadingType?: 'general' | 'chat' | 'search' | 'database' | 'document' | 'brain'
) {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return function WrappedComponent(props: P) {
    return (
      <LazyComponentLoader loadingType={loadingType}>
        <LazyComponent {...(props as any)} />
      </LazyComponentLoader>
    );
  };
}

// Função utilitária para criar imports dinâmicos otimizados
export function createLazyImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingType?: 'general' | 'chat' | 'search' | 'database' | 'document' | 'brain'
) {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyComponentLoader loadingType={loadingType}>
        <LazyComponent {...(props as any)} />
      </LazyComponentLoader>
    );
  };
}

export default LazyComponentLoader;
