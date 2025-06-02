
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();

  return useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [];

    // Mapear rotas para labels
    const routeLabels: Record<string, string> = {
      'settings': 'Configurações',
      'integrations-manager': 'Gerenciar Integrações',
      'security': 'Segurança & Privacidade',
      'chat': 'Chat',
      'memory': 'Memória',
      'documents': 'Documentos',
      'search': 'Busca Semântica',
      'actions': 'Projetos',
      'auth': 'Autenticação'
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      
      breadcrumbs.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : href,
        current: isLast
      });
    });

    return breadcrumbs;
  }, [location.pathname]);
};
