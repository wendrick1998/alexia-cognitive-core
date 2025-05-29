
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '../navigation/BottomNavigation';
import SlideOutSidebar from '../navigation/SlideOutSidebar';
import DesktopSidebar from '../premium/DesktopSidebar';
import DarkModeToggle from '../premium/DarkModeToggle';

interface PremiumAppLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const PremiumAppLayout = ({ children, currentSection, onSectionChange }: PremiumAppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

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
          setSidebarOpen(false);
        } else {
          window.dispatchEvent(new CustomEvent('escape-pressed'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSectionChange, currentSection, toast, sidebarOpen]);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
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
    <div className="min-h-screen flex w-full bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <DesktopSidebar 
          currentSection={currentSection} 
          onSectionChange={onSectionChange} 
        />
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden",
        !isMobile && "ml-20"
      )}>
        {/* Header */}
        <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center justify-between transition-colors duration-300 flex-shrink-0">
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
              </div>
            )}
            <DarkModeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-hidden",
          isMobile && "pb-20" // Space for bottom navigation
        )}>
          {children}
        </div>

        {/* Bottom Navigation (Mobile only) */}
        <BottomNavigation 
          currentSection={currentSection} 
          onSectionChange={onSectionChange}
          onMenuToggle={handleMenuToggle}
        />

        {/* Slide Out Sidebar (Mobile only) */}
        <SlideOutSidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          currentSection={currentSection}
          onSectionChange={onSectionChange}
        />
      </main>
    </div>
  );
};

export default PremiumAppLayout;
