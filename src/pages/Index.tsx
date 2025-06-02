import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useAlexChatSessions } from '@/hooks/useAlexChatSessions';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import Dashboard from '@/components/layout/Dashboard';
import Chat from '@/components/Chat';
import SemanticSearch from '@/components/search/SemanticSearch';
import MemoryManager from '@/components/memory/MemoryManager';
import DocumentsManager from '@/components/documents/DocumentsManager';
import ProjectsManager from '@/components/projects/ProjectsManager';
import SettingsScreen from '@/components/settings/SettingsScreen';
import SecuritySettings from '@/components/settings/SecuritySettings';
import SubscriptionManagement from '@/components/settings/SubscriptionManagement';
import SystemLogs from '@/components/settings/SystemLogs';
import Sidebar from '@/components/layout/Sidebar';
import MobileBar from '@/components/layout/MobileBar';
import CognitiveGraphPage from '@/components/cognitive/CognitiveGraphPage';
import InsightsPage from '@/components/cognitive/InsightsPage';
import CortexDashboard from '@/components/cognitive/CortexDashboard';
import IntegrationsStatusPage from '@/components/integrations/IntegrationsStatusPage';
import IntegrationsManagerPage from '@/components/integrations/IntegrationsManagerPage';

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { subscription } = useSubscription();
  const { preferences, updatePreferences } = useUserPreferences();
  const { sessions } = useAlexChatSessions();
  const { documents } = useDocuments();
  const { projects } = useProjects();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

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
        return <SettingsScreen />;
      case "ai-config":
        return <SettingsScreen />;
      case "security":
        return <SecuritySettings />;
      case "subscription":
        return <SubscriptionManagement />;
      case "logs":
        return <SystemLogs />;
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
        <MobileBar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
