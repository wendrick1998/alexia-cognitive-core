
import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import MultiPaneLayout from "../components/layout/MultiPaneLayout";
import Chat from "../components/Chat";
import Dashboard from "../components/dashboard/Dashboard";
import ProjectsManager from "../components/ProjectsManager";
import MemoryManager from "../components/MemoryManager";
import DocumentsManager from "../components/DocumentsManager";
import SemanticSearch from "../components/SemanticSearch";
import AuthGuard from "../components/auth/AuthGuard";
import { ConnectionStatus } from "../components/ui/connection-status";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { SplitSquareHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageTransition } from "@/components/ui/transitions";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitSections, setSplitSections] = useState({ left: "dashboard", right: "chat" });
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  const handleSectionChange = (section: string, id?: string) => {
    console.log(`🔗 Navigating to section: ${section}`, id ? `with ID: ${id}` : '');
    setCurrentSection(section);
    // Handle navigation with optional ID for specific items
    if (id) {
      console.log(`Navigating to ${section} with ID: ${id}`);
    }
  };

  const renderContent = (section: string) => {
    console.log(`🎨 Rendering content for section: ${section}`);
    const content = (() => {
      switch (section) {
        case "dashboard":
          return <Dashboard />;
        case "chat":
          console.log('🗨️ Rendering Chat component');
          return <Chat />;
        case "memory":
          return <MemoryManager />;
        case "documents":
          return <DocumentsManager />;
        case "search":
          return <SemanticSearch />;
        case "actions":
          return <ProjectsManager />;
        default:
          console.log(`⚠️ Unknown section: ${section}, defaulting to Dashboard`);
          return <Dashboard />;
      }
    })();

    return <PageTransition>{content}</PageTransition>;
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "dashboard":
        return "Dashboard";
      case "chat":
        return "Chat";
      case "memory":
        return "Memórias";
      case "documents":
        return "Documentos";
      case "search":
        return "Busca";
      case "actions":
        return "Projetos";
      default:
        return "Dashboard";
    }
  };

  const enableSplitView = () => {
    if (!isMobile) {
      setIsSplitView(true);
      setSplitSections({ left: currentSection, right: currentSection === "chat" ? "documents" : "chat" });
    }
  };

  const closeSplitView = () => {
    setIsSplitView(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ background: '#000000' }}>
        <AppLayout currentSection={currentSection} onSectionChange={handleSectionChange}>
          {isSplitView && !isMobile ? (
            <MultiPaneLayout
              leftPane={renderContent(splitSections.left)}
              rightPane={renderContent(splitSections.right)}
              leftTitle={getSectionTitle(splitSections.left)}
              rightTitle={getSectionTitle(splitSections.right)}
              onClose={closeSplitView}
              defaultLayout={[60, 40]}
            />
          ) : (
            <div className="relative h-full">
              {/* Split View Toggle - Desktop Only */}
              {!isMobile && !isSplitView && currentSection !== "dashboard" && isAuthenticated && (
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    onClick={enableSplitView}
                    variant="outline"
                    size="sm"
                    className="premium-card-dark text-white hover:bg-white/10 hover:border-white/30 shadow-sm backdrop-blur-sm"
                  >
                    <SplitSquareHorizontal className="w-4 h-4 mr-2" />
                    Split View
                  </Button>
                </div>
              )}
              
              {renderContent(currentSection)}
            </div>
          )}
        </AppLayout>
        
        {/* Connection Status Indicator */}
        <ConnectionStatus />
      </div>
    </AuthGuard>
  );
};

export default Index;
