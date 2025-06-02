
import { useState } from "react";
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
        return <Dashboard />;
      case "chat":
        return <Chat />;
      case "memory":
        return <MemoryManager />;
      case "documents":
        return <DocumentsManager />;
      case "search":
        return <SemanticSearch />;
      case "actions":
        return <ProjectsManager />;
      case "autonomous":
        return <AutonomousProjectsManager />;
      case "preferences":
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Preferências do Usuário - Em desenvolvimento</div>;
      case "privacy":
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Configurações de IA - Em desenvolvimento</div>;
      case "subscription":
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Assinatura - Em desenvolvimento</div>;
      case "security":
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Privacidade - Em desenvolvimento</div>;
      default:
        console.log(`⚠️ Seção desconhecida: ${section}, retornando para Dashboard`);
        return <Dashboard />;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <PremiumAppLayout currentSection={currentSection} onSectionChange={handleSectionChange}>
          <div className="relative h-full overflow-hidden">
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
