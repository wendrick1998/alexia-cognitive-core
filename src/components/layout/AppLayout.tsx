import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Menu, X } from 'lucide-react';
import AppSidebar from '../AppSidebar';
import BottomNavigationBar from '../BottomNavigationBar';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const AppLayout = ({ children, currentSection, onSectionChange }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fechar sidebar automaticamente no mobile após navegar
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [currentSection, isMobile]);

  // Escutar atalho de teclado Cmd+K para busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSectionChange('search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSectionChange]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-slate-50/50">
        {/* Sidebar */}
        <AppSidebar 
          currentSection={currentSection} 
          onSectionChange={onSectionChange} 
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header com trigger do sidebar */}
          <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/50 p-4 flex items-center justify-between lg:hidden">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SidebarTrigger>
            <h1 className="font-semibold text-slate-900 capitalize">
              {currentSection === 'chat' ? 'Chat' : 
               currentSection === 'memory' ? 'Memórias' :
               currentSection === 'documents' ? 'Documentos' :
               currentSection === 'search' ? 'Busca' :
               currentSection === 'actions' ? 'Projetos' : 'AlexIA'}
            </h1>
            <div className="w-8" /> {/* Spacer para centralizar o título */}
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>

          {/* Bottom Navigation (Mobile only) */}
          {isMobile && (
            <BottomNavigationBar 
              currentSection={currentSection} 
              onSectionChange={onSectionChange} 
            />
          )}
        </main>

        {/* Floating Menu Button (Desktop only) */}
        {!isMobile && (
          <div className="fixed bottom-6 right-6 z-50">
            <SidebarTrigger asChild>
              <Button
                size="lg"
                className="w-14 h-14 rounded-full shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-0 transition-all duration-300 hover:scale-110"
              >
                <Menu className="w-6 h-6 text-white" />
              </Button>
            </SidebarTrigger>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
