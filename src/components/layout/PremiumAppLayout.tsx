
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '../navigation/BottomNavigation';
import SlideOutSidebar from '../navigation/SlideOutSidebar';
import DesktopSidebar from '../premium/DesktopSidebar';
import DarkModeToggle from '../premium/DarkModeToggle';
import { cn } from '@/lib/utils';

interface PremiumAppLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const PremiumAppLayout = ({ children, currentSection, onSectionChange }: PremiumAppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    onSectionChange(section);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [onSectionChange, isMobile]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            handleSectionChange('dashboard');
            toast({
              title: "Dashboard ativado",
              description: "Cmd/Ctrl + D para dashboard",
            });
            break;
          case 'k':
            e.preventDefault();
            handleSectionChange('search');
            toast({
              title: "Command Palette ativado",
              description: "Cmd/Ctrl + K para buscar",
            });
            break;
          case 'n':
            e.preventDefault();
            if (currentSection === 'chat') {
              window.dispatchEvent(new CustomEvent('new-conversation'));
            }
            toast({
              title: "Nova conversa",
              description: "Cmd/Ctrl + N para novo chat",
            });
            break;
          case 'f':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('activate-focus-mode'));
            break;
          default:
            break;
        }
      }
      
      if (e.key === 'Escape') {
        if (sidebarOpen) {
          handleSidebarClose();
        } else {
          window.dispatchEvent(new CustomEvent('escape-pressed'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSectionChange, currentSection, toast, sidebarOpen, handleSidebarClose]);

  const getSectionTitle = useCallback((section: string) => {
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
      case 'cognitive-graph':
        return 'Rede Cognitiva';
      case 'insights':
        return 'Insights';
      case 'cortex-dashboard':
        return 'Córtex Dashboard';
      case 'integrations-status':
        return 'Status Integrações';
      case 'integrations-manager':
        return 'Gerenciar APIs';
      case 'preferences':
        return 'Preferências';
      case 'privacy':
        return 'Privacidade';
      case 'subscription':
        return 'Assinatura';
      case 'security':
        return 'Segurança';
      default:
        return 'Alex IA';
    }
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DesktopSidebar 
          currentSection={currentSection} 
          onSectionChange={handleSectionChange} 
        />
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen relative",
        !isMobile && "ml-20",
        currentSection === 'chat' ? "overflow-hidden" : "overflow-auto"
      )}>
        {/* Header */}
        <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center justify-between transition-colors duration-300 flex-shrink-0 relative z-30">
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 capitalize text-xl">
            {getSectionTitle(currentSection)}
          </h1>
          
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘D</kbd>
                <span>Dashboard</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘K</kbd>
                <span>Search</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘N</kbd>
                <span>New</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘F</kbd>
                <span>Focus</span>
              </div>
            )}
            <DarkModeToggle />
          </div>
        </header>

        {/* Content Area - Aplicar overflow controlado apenas para chat */}
        <div className={cn(
          "flex-1 relative z-10",
          currentSection === 'chat' ? "overflow-hidden" : "overflow-y-auto",
          isMobile && currentSection !== 'chat' && "pb-20"
        )} style={{
          paddingBottom: isMobile && currentSection !== 'chat' ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : undefined
        }}>
          <div className={cn(
            "w-full",
            currentSection === 'chat' ? "h-full overflow-hidden" : "h-auto"
          )}>
            {children}
          </div>
        </div>

        {/* Bottom Navigation (Mobile only) */}
        <BottomNavigation 
          currentSection={currentSection} 
          onSectionChange={handleSectionChange}
          onMenuToggle={handleMenuToggle}
        />

        {/* Slide Out Sidebar (Mobile only) */}
        <SlideOutSidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />
      </main>
    </div>
  );
};

export default PremiumAppLayout;
