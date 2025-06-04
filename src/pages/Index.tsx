
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import PremiumAppLayout from "../components/layout/PremiumAppLayout";
import Chat from "../components/Chat";
import Dashboard from "../components/dashboard/Dashboard";
import ProjectsManager from "../components/ProjectsManager";
import AutonomousProjectsManager from "../components/autonomous/AutonomousProjectsManager";
import MemoryManager from "../components/MemoryManager";
import DocumentsManager from "../components/DocumentsManager";
import SemanticSearch from "../components/SemanticSearch";
import AuthGuard from "../components/auth/AuthGuard";
import { ConnectionStatus } from "../components/ui/connection-status";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/ui/transitions";
import { PerformanceDashboard } from "@/components/performance/PerformanceDashboard";
import LLMConfigPage from "@/pages/LLMConfigPage";

// Debug logs
console.log('📱 Index.tsx carregando...');

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();

  // Debug: Estado da autenticação
  console.log('🔐 Estado Auth Index:', { 
    isAuthenticated, 
    loading, 
    user: !!user, 
    path: location.pathname 
  });

  // Função para navegar entre seções usando React Router
  const handleSectionChange = (section: string, id?: string) => {
    console.log(`🔗 Navegando para seção: ${section}`, id ? `com ID: ${id}` : '');
    
    // Mapear seção para rota
    const routeMap: Record<string, string> = {
      dashboard: '/',
      chat: '/chat',
      memory: '/memory',
      documents: '/documents',
      search: '/search',
      actions: '/actions',
      autonomous: '/autonomous',
      performance: '/performance',
      'llm-config': '/llm-config',
      preferences: '/preferences',
      privacy: '/privacy',
      subscription: '/subscription',
      security: '/security'
    };

    const targetRoute = routeMap[section] || '/';
    
    // Only navigate if we're not already on the target route
    if (location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  };

  // Extrair a seção atual da URL
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
    if (path.startsWith("/llm-config")) return "llm-config";
    if (path.startsWith("/preferences")) return "preferences";
    if (path.startsWith("/privacy")) return "privacy";
    if (path.startsWith("/subscription")) return "subscription";
    if (path.startsWith("/security")) return "security";
    return "dashboard";
  };

  console.log('✅ Index renderizando normalmente');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <PremiumAppLayout 
          currentSection={getCurrentSection()} 
          onSectionChange={handleSectionChange}
        >
          <div className="relative h-full overflow-hidden">
            <PageTransition>
              <Routes>
                {/* Rota principal - Dashboard */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                
                {/* Funcionalidades principais */}
                <Route path="/chat" element={<Chat />} />
                <Route path="/memory" element={<MemoryManager />} />
                <Route path="/documents" element={<DocumentsManager />} />
                <Route path="/search" element={<SemanticSearch />} />
                <Route path="/actions" element={<ProjectsManager />} />
                <Route path="/autonomous" element={<AutonomousProjectsManager />} />
                <Route path="/performance" element={<PerformanceDashboard />} />
                <Route path="/llm-config" element={<LLMConfigPage />} />
                
                {/* Páginas em desenvolvimento - Placeholders */}
                <Route path="/preferences" element={
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                      <span className="text-white text-2xl">⚙️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Preferências do Usuário
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                      Esta seção está sendo desenvolvida e incluirá configurações personalizadas do Alex iA.
                    </p>
                    <div className="px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                      Em desenvolvimento
                    </div>
                  </div>
                } />
                
                <Route path="/privacy" element={
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Configurações de IA - Em desenvolvimento
                  </div>
                } />
                
                <Route path="/subscription" element={
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Assinatura - Em desenvolvimento
                  </div>
                } />
                
                <Route path="/security" element={
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    Privacidade - Em desenvolvimento
                  </div>
                } />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </div>
        </PremiumAppLayout>
        
        <ConnectionStatus />
      </div>
    </AuthGuard>
  );
};

console.log('📤 Index.tsx exportando componente');
export default Index;
