
/**
 * @file LazyLoader.tsx
 * @description Componente para code splitting e carregamento lazy
 */

import { Suspense, ComponentType, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

const defaultFallback = (
  <div className="flex items-center justify-center p-8">
    <div className="space-y-3 w-full max-w-md">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  </div>
);

const LazyLoader = ({ component, fallback = defaultFallback, props = {} }: LazyLoaderProps) => {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LazyLoader;
