
import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AuthGuard from '@/components/auth/AuthGuard';
import AuthPage from '@/components/auth/AuthPage';
import PremiumAppLayout from '@/components/layout/PremiumAppLayout';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

// Lazy load dos componentes principais que existem
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const Chat = lazy(() => import('@/components/Chat'));

// Lazy load dos componentes funcionais existentes
const SemanticSearch = lazy(() => import('@/components/SemanticSearch'));
const MemoryManager = lazy(() => import('@/components/MemoryManager'));
const DocumentsManager = lazy(() => import('@/components/DocumentsManager'));
const ProjectsManager = lazy(() => import('@/components/ProjectsManager'));

// Lazy load dos componentes que existem
const PerformanceDashboard = lazy(() => import('@/components/PerformanceDashboard'));

// Componente placeholder para páginas em desenvolvimento
const DevelopmentPage = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
      <span className="text-white text-2xl">🚧</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      {title}
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
      {description}
    </p>
    <div className="px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
      Em desenvolvimento
    </div>
  </div>
);

// Componente para gerenciar navegação das rotas protegidas
const ProtectedApp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extrair seção atual da URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path.startsWith("/chat")) return "chat";
    if (path.startsWith("/memory")) return "memory";
    if (path.startsWith("/documents")) return "documents";
    if (path.startsWith("/search")) return "search";
    if (path.startsWith("/actions")) return "actions";
    if (path.startsWith("/autonomous")) return "autonomous";
    if (path.startsWith("/performance")) return "performance";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard";
  };

  // Handler para mudança de seção
  const handleSectionChange = (section: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/',
      chat: '/chat',
      memory: '/memory',
      documents: '/documents',
      search: '/search',
      actions: '/actions',
      autonomous: '/autonomous',
      performance: '/performance',
      settings: '/settings'
    };

    const targetRoute = routeMap[section] || '/';
    
    if (location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  };
  
  return (
    <PremiumAppLayout 
      currentSection={getCurrentSection()} 
      onSectionChange={handleSectionChange}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <SmartLoadingSpinner size="lg" message="Carregando página..." />
        </div>
      }>
        <Routes>
          {/* Rotas principais funcionais */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          
          {/* Funcionalidades existentes */}
          <Route path="/memory" element={<MemoryManager />} />
          <Route path="/documents" element={<DocumentsManager />} />
          <Route path="/search" element={<SemanticSearch />} />
          <Route path="/actions" element={<ProjectsManager />} />
          
          {/* Componentes reais */}
          <Route path="/performance" element={<PerformanceDashboard />} />
          
          {/* Páginas em desenvolvimento */}
          <Route path="/autonomous" element={
            <DevelopmentPage 
              title="Projetos Autônomos" 
              description="Sistema de gerenciamento de projetos autônomos está sendo desenvolvido." 
            />
          } />
          
          <Route path="/settings" element={
            <DevelopmentPage 
              title="Configurações" 
              description="Página de configurações está sendo desenvolvida." 
            />
          } />
          
          {/* Fallback para rotas não encontradas */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </PremiumAppLayout>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <SmartLoadingSpinner size="lg" message="Carregando aplicação..." />
      </div>
    }>
      <Routes>
        {/* Rota pública - Login/Cadastro */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Rotas protegidas com layout */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <ProtectedApp />
            </AuthGuard>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
