
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Preload estratégico de rotas mais usadas
const routePriority = {
  '/': ['chat', 'dashboard'],
  '/chat': ['search', 'memory'],
  '/dashboard': ['chat', 'documents'],
  '/search': ['chat', 'memory'],
  '/memory': ['chat', 'search'],
  '/documents': ['chat', 'search']
};

export const RoutePrefetcher = () => {
  const location = useLocation();
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentPath = location.pathname;
    const routesToPrefetch = routePriority[currentPath as keyof typeof routePriority] || [];

    routesToPrefetch.forEach(route => {
      if (!prefetchedRoutes.has(route)) {
        // Prefetch com delay para não interferir no carregamento atual
        setTimeout(() => {
          import(`../pages/${route.charAt(0).toUpperCase() + route.slice(1)}`).catch(() => {
            // Silently fail - component may not exist yet
          });
          setPrefetchedRoutes(prev => new Set([...prev, route]));
        }, 1000);
      }
    });
  }, [location.pathname, prefetchedRoutes]);

  return null;
};
