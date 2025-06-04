
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import DesktopSidebar from "@/components/premium/DesktopSidebar";
import ConversationSidebar from "@/components/ConversationSidebar";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import { PWALayout } from "@/components/layout/PWALayout";
import { useIsMobile } from "@/hooks/use-mobile";

interface PremiumAppLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string, id?: string) => void;
}

const PremiumAppLayout = ({ children, currentSection, onSectionChange }: PremiumAppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConversationSidebarOpen, setIsConversationSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

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

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const handleSectionChange = useCallback((section: string) => {
    if (section !== currentSection) {
      onSectionChange(section);
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  }, [currentSection, onSectionChange, isMobile]);

  if (!isAuthenticated) {
    return (
      <PWALayout className="flex items-center justify-center bg-background">
        {children}
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <div className="flex h-screen bg-background overflow-hidden overscroll-contain">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 border-r border-border">
          <DesktopSidebar 
            currentSection={currentSection} 
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          <main className={cn(
            "flex-1 overflow-y-auto premium-scrollbar overscroll-contain scroll-smooth",
            isMobile ? "pb-[88px]" : "pb-4"
          )}
          style={{
            paddingBottom: isMobile ? 'calc(88px + env(safe-area-inset-bottom))' : '1rem'
          }}>
            <div className="h-full min-h-0">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-background/95 backdrop-blur-xl shadow-2xl border-r border-border transform transition-transform duration-300">
              <DesktopSidebar 
                currentSection={currentSection} 
                onSectionChange={(section) => {
                  handleSectionChange(section);
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && (
          <BottomNavigation 
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
            onMenuToggle={handleMenuToggle}
          />
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
