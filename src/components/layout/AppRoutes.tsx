
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/auth/AuthGuard';
import AuthPage from '@/components/auth/AuthPage';
import PremiumAppLayout from '@/components/layout/PremiumAppLayout';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

// Lazy load components
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const Chat = lazy(() => import('@/components/Chat'));
const SemanticSearch = lazy(() => import('@/components/SemanticSearch'));
const MemoryManager = lazy(() => import('@/components/MemoryManager'));
const DocumentsManager = lazy(() => import('@/components/DocumentsManager'));
const ProjectsManager = lazy(() => import('@/components/ProjectsManager'));
const PerformanceDashboard = lazy(() => import('@/components/PerformanceDashboard'));
const DevelopmentPage = lazy(() => import('@/pages/DevelopmentPage'));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public route - Login */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Protected routes with layout */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <PremiumAppLayout>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <SmartLoadingSpinner size="lg" message="Carregando página..." />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/memory" element={<MemoryManager />} />
                  <Route path="/documents" element={<DocumentsManager />} />
                  <Route path="/search" element={<SemanticSearch />} />
                  <Route path="/actions" element={<ProjectsManager />} />
                  <Route path="/performance" element={<PerformanceDashboard />} />
                  
                  {/* Development/placeholder pages */}
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
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </PremiumAppLayout>
          </AuthGuard>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
