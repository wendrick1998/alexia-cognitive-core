
import { useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import PremiumAppLayout from "@/components/layout/PremiumAppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { PageTransition } from "@/components/ui/transitions";
import { PageLoader } from "@/components/ui/page-loader";
import Chat from "@/components/Chat";
import { 
  Dashboard, 
  SemanticSearch, 
  MemoryManager, 
  DocumentsManager, 
  ProjectsManager,
  CognitiveGraphPage,
  InsightsPage,
  CortexDashboard,
  IntegrationsStatusPage,
  IntegrationsManagerPage,
  SettingsScreen
} from "./LazyPages";
import PrivacyPage from "./PrivacyPage";
import SubscriptionPage from "./SubscriptionPage";
import SecurityPage from "./SecurityPage";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("dashboard");
  const { isAuthenticated } = useAuth();

  const handleSectionChange = (section: string, id?: string) => {
    console.log(`🔗 Navegando para seção: ${section}`, id ? `com ID: ${id}` : '');
    
    if (section !== currentSection) {
      setCurrentSection(section);
      
      if (id) {
        console.log(`Navegando para ${section} com ID: ${id}`);
      }
    }
  };

  const renderContent = (section: string) => {
    console.log(`🎨 Renderizando conteúdo para seção: ${section}`);
    
    switch (section) {
      case "dashboard":
        return (
          <Suspense fallback={<PageLoader text="Carregando Dashboard..." />}>
            <Dashboard />
          </Suspense>
        );
      case "chat":
        return <Chat />;
      case "memory":
        return (
          <Suspense fallback={<PageLoader text="Carregando Memórias..." />}>
            <MemoryManager />
          </Suspense>
        );
      case "documents":
        return (
          <Suspense fallback={<PageLoader text="Carregando Documentos..." />}>
            <DocumentsManager />
          </Suspense>
        );
      case "search":
        return (
          <Suspense fallback={<PageLoader text="Carregando Busca..." />}>
            <SemanticSearch />
          </Suspense>
        );
      case "actions":
        return (
          <Suspense fallback={<PageLoader text="Carregando Projetos..." />}>
            <ProjectsManager />
          </Suspense>
        );
      case "cognitive-graph":
        return (
          <Suspense fallback={<PageLoader text="Carregando Rede Cognitiva..." />}>
            <CognitiveGraphPage />
          </Suspense>
        );
      case "insights":
        return (
          <Suspense fallback={<PageLoader text="Carregando Insights..." />}>
            <InsightsPage />
          </Suspense>
        );
      case "cortex-dashboard":
        return (
          <Suspense fallback={<PageLoader text="Carregando Córtex..." />}>
            <CortexDashboard />
          </Suspense>
        );
      case "integrations-status":
        return (
          <Suspense fallback={<PageLoader text="Carregando Integrações..." />}>
            <IntegrationsStatusPage />
          </Suspense>
        );
      case "integrations-manager":
        return (
          <Suspense fallback={<PageLoader text="Carregando Gerenciador..." />}>
            <IntegrationsManagerPage />
          </Suspense>
        );
      case "preferences":
        return (
          <Suspense fallback={<PageLoader text="Carregando Configurações..." />}>
            <SettingsScreen isOpen={true} onClose={() => setCurrentSection("dashboard")} />
          </Suspense>
        );
      case "privacy":
        return <PrivacyPage />;
      case "subscription":
        return <SubscriptionPage />;
      case "security":
        return <SecurityPage />;
      default:
        console.log(`⚠️ Seção desconhecida: ${section}, retornando para Dashboard`);
        return (
          <Suspense fallback={<PageLoader text="Carregando Dashboard..." />}>
            <Dashboard />
          </Suspense>
        );
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-gray-950 w-full">
        <PremiumAppLayout currentSection={currentSection} onSectionChange={handleSectionChange}>
          <div className="relative h-full w-full">
            <PageTransition>
              {renderContent(currentSection)}
            </PageTransition>
          </div>
        </PremiumAppLayout>
        
        <ConnectionStatus />
      </div>
    </AuthGuard>
  );
};

export default Index;
