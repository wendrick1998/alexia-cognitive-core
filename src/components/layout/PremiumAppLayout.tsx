
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import DesktopSidebar from "@/components/premium/DesktopSidebar";
import ConversationSidebar from "@/components/ConversationSidebar";
import { PWALayout } from "@/components/layout/PWALayout";

interface PremiumAppLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string, id?: string) => void;
}

const PremiumAppLayout = ({ children, currentSection, onSectionChange }: PremiumAppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConversationSidebarOpen, setIsConversationSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
        setIsConversationSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return (
      <PWALayout className="flex items-center justify-center">
        {children}
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <DesktopSidebar 
            currentSection={currentSection} 
            onSectionChange={(section) => onSectionChange(section)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Main Content with Proper Scroll */}
          <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-950 premium-scrollbar momentum-scroll">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl">
              <DesktopSidebar 
                currentSection={currentSection} 
                onSectionChange={(section) => {
                  onSectionChange(section);
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Conversation Sidebar */}
        <ConversationSidebar
          isOpen={isConversationSidebarOpen}
          onToggle={() => setIsConversationSidebarOpen(!isConversationSidebarOpen)}
        />
      </div>
    </PWALayout>
  );
};

export default PremiumAppLayout;
