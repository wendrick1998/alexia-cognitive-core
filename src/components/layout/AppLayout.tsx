
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import AppSidebar from '../AppSidebar';
import PremiumNavigationBar from '../premium/PremiumNavigationBar';
import DarkModeToggle from '../premium/DarkModeToggle';
import DesktopSidebar from '../premium/DesktopSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const AppLayout = ({ children, currentSection, onSectionChange }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Close sidebar automatically on mobile after navigation
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [currentSection, isMobile]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            onSectionChange('dashboard');
            toast({
              title: "Dashboard ativado",
              description: "Cmd/Ctrl + D para dashboard",
            });
            break;
          case 'k':
            e.preventDefault();
            onSectionChange('search');
            toast({
              title: "Command Palette ativado",
              description: "Cmd/Ctrl + K para buscar",
            });
            break;
          case 'n':
            e.preventDefault();
            if (currentSection === 'chat') {
              // Trigger new conversation
              window.dispatchEvent(new CustomEvent('new-conversation'));
            }
            toast({
              title: "Nova conversa",
              description: "Cmd/Ctrl + N para novo chat",
            });
            break;
          case 'f':
            e.preventDefault();
            // Activate focus mode
            window.dispatchEvent(new CustomEvent('activate-focus-mode'));
            break;
          default:
            break;
        }
      }
      
      if (e.key === 'Escape') {
        // Close any open modals or return to main view
        window.dispatchEvent(new CustomEvent('escape-pressed'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSectionChange, currentSection, toast]);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'dashboard':
        return 'Dashboard';
      case 'chat':
        return 'Chat';
      case 'memory':
        return 'Memórias';
      case 'documents':
        return 'Documentos';
      case 'search':
        return 'Busca';
      case 'actions':
        return 'Projetos';
      default:
        return 'AlexIA';
    }
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full transition-colors duration-300" style={{ background: '#000000' }}>
        {/* Desktop Sidebar */}
        {!isMobile ? (
          <DesktopSidebar 
            currentSection={currentSection} 
            onSectionChange={onSectionChange} 
          />
        ) : (
          <AppSidebar 
            currentSection={currentSection} 
            onSectionChange={onSectionChange} 
          />
        )}

        {/* Main Content - FIXED: Removed overflow-auto that was causing scroll issues */}
        <main className={`flex-1 flex flex-col h-screen ${!isMobile ? 'ml-20' : ''}`}>
          {/* Header for mobile */}
          {isMobile && (
            <header className="premium-card-dark backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between transition-colors duration-300 flex-shrink-0">
              <SidebarTrigger>
                <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-white/10 text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SidebarTrigger>
              
              <h1 className="font-semibold text-white capitalize">
                {getSectionTitle(currentSection)}
              </h1>
              
              <DarkModeToggle />
            </header>
          )}

          {/* Desktop Header with shortcuts */}
          {!isMobile && (
            <header className="premium-card-dark backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between transition-colors duration-300 flex-shrink-0">
              <h1 className="font-semibold text-white capitalize text-xl">
                {getSectionTitle(currentSection)}
              </h1>
              
              <div className="flex items-center space-x-4">
                <div className="hidden lg:flex items-center space-x-2 text-sm text-white/60">
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘D</kbd>
                  <span>Dashboard</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘K</kbd>
                  <span>Search</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘N</kbd>
                  <span>New</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⌘F</kbd>
                  <span>Focus</span>
                </div>
                <DarkModeToggle />
              </div>
            </header>
          )}

          {/* Content Area - FIXED: Removed overflow-auto, added proper flex layout */}
          <div className="flex-1 min-h-0">
            {children}
          </div>

          {/* Premium Bottom Navigation (Mobile only) */}
          {isMobile && (
            <PremiumNavigationBar 
              currentSection={currentSection} 
              onSectionChange={onSectionChange}
              onMenuToggle={handleMenuToggle}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
