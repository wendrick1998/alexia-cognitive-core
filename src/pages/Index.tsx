
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import Chat from "@/components/Chat";
import Documents from "@/components/Documents";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "chat":
        return <Chat />;
      case "documents":
        return <Documents />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-black text-white flex w-full overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-lg font-semibold">Alexia</h1>
            <div className="w-10" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative flex-shrink-0'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out
        ${isMobile ? 'w-80' : 'w-64'}
        border-r border-white/10
      `}>
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - CORRIGIDO: Estrutura flex-scroll-layout */}
      <div className={`
        flex-1 min-w-0 flex-scroll-layout
        ${isMobile ? 'pt-16' : ''}
      `}>
        <div className="flex-scroll-content scroll-container premium-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
