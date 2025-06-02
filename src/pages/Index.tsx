
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import PremiumAppLayout from '@/components/layout/PremiumAppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import Chat from '@/components/Chat';
import SemanticSearch from '@/components/SemanticSearch';
import MemoryManager from '@/components/MemoryManager';
import DocumentsManager from '@/components/DocumentsManager';
import ProjectsManager from '@/components/ProjectsManager';
import SettingsScreen from '@/components/settings/SettingsScreen';
import CognitiveGraphPage from '@/components/cognitive/CognitiveGraphPage';
import InsightsPage from '@/components/cognitive/InsightsPage';
import CortexDashboard from '@/components/cognitive/CortexDashboard';
import IntegrationsStatusPage from '@/components/integrations/IntegrationsStatusPage';
import IntegrationsManagerPage from '@/components/integrations/IntegrationsManagerPage';

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
      case "actions":
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
      case "privacy":
        return <div className="p-6"><h1 className="text-2xl text-white">Configurações de Privacidade</h1><p className="text-white/60">Em desenvolvimento...</p></div>;
      case "subscription":
        return <div className="p-6"><h1 className="text-2xl text-white">Gerenciamento de Assinatura</h1><p className="text-white/60">Em desenvolvimento...</p></div>;
      case "security":
        return <div className="p-6"><h1 className="text-2xl text-white">Configurações de Segurança</h1><p className="text-white/60">Em desenvolvimento...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <PremiumAppLayout currentSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </PremiumAppLayout>
  );
};

export default Index;
