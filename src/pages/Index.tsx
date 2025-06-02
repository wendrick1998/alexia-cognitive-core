
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAlexChatSessions } from '@/hooks/useAlexChatSessions';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import Dashboard from '@/components/dashboard/Dashboard';
import Chat from '@/components/Chat';
import SemanticSearch from '@/components/SemanticSearch';
import MemoryManager from '@/components/MemoryManager';
import DocumentsManager from '@/components/DocumentsManager';
import ProjectsManager from '@/components/ProjectsManager';
import SettingsScreen from '@/components/settings/SettingsScreen';
import Sidebar from '@/components/layout/Sidebar';
import CognitiveGraphPage from '@/components/cognitive/CognitiveGraphPage';
import InsightsPage from '@/components/cognitive/InsightsPage';
import CortexDashboard from '@/components/cognitive/CortexDashboard';
import IntegrationsStatusPage from '@/components/integrations/IntegrationsStatusPage';
import IntegrationsManagerPage from '@/components/integrations/IntegrationsManagerPage';

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { sessions } = useAlexChatSessions();
  const { documents } = useDocuments();
  const { projects } = useProjects();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to auth page logic would go here
      console.log('User not authenticated');
    }
  }, [user, loading]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "chat":
        return <Chat />;
      case "search":
        return <SemanticSearch />;
      case "memory":
        return <MemoryManager />;
      case "documents":
        return <DocumentsManager />;
      case "projects":
        return <ProjectsManager />;
      case "cognitive-graph":
        return <CognitiveGraphPage />;
      case "insights":
        return <InsightsPage />;
      case "cortex-dashboard":
        return <CortexDashboard />;
      case "integrations-status":
        return <IntegrationsStatusPage />;
      case "integrations-manager":
        return <IntegrationsManagerPage />;
      case "preferences":
        return <SettingsScreen isOpen={true} onClose={() => setActiveSection("dashboard")} />;
      case "ai-config":
        return <SettingsScreen isOpen={true} onClose={() => setActiveSection("dashboard")} />;
      case "security":
        return <div className="p-6"><h1 className="text-2xl text-white">Configurações de Segurança</h1><p className="text-white/60">Em desenvolvimento...</p></div>;
      case "subscription":
        return <div className="p-6"><h1 className="text-2xl text-white">Gerenciamento de Assinatura</h1><p className="text-white/60">Em desenvolvimento...</p></div>;
      case "logs":
        return <div className="p-6"><h1 className="text-2xl text-white">Logs do Sistema</h1><p className="text-white/60">Em desenvolvimento...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      {/* Sidebar */}
      {!isMobile && (
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold">Alex IA</h1>
            <button 
              onClick={() => {/* Mobile menu logic */}}
              className="text-white"
            >
              ☰
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
