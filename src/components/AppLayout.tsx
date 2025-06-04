
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import PremiumSidebar from '@/components/premium/PremiumSidebar';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SkipNavigation from '@/components/accessibility/SkipNavigation';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isPremiumSidebarOpen, setIsPremiumSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('chat');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Skeleton className="w-48 h-12 rounded-full" />
      </div>
    );
  }

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    console.log(`Navigating to section: ${section}`);
  };

  const togglePremiumSidebar = () => {
    setIsPremiumSidebarOpen(!isPremiumSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Skip Navigation Links */}
      <SkipNavigation />
      
      {/* Live region for screen reader announcements */}
      <div
        id="live-announcements"
        className="live-region"
        aria-live="polite"
        aria-atomic="true"
      />

      <div className="flex h-screen mobile-optimized">
        {/* Navigation Sidebar */}
        <nav 
          id="navigation"
          className="hidden lg:flex w-64 bg-gray-900/50 backdrop-blur-xl border-r border-white/10"
          aria-label="Navegação principal"
        >
          <PremiumSidebar />
        </nav>

        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 flex flex-col min-w-0"
          role="main"
          aria-label="Conteúdo principal"
        >
          {/* Header */}
          <header 
            className="flex-shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-xl mobile-chat-header"
            role="banner"
            aria-label="Cabeçalho da aplicação"
          >
            <div className="h-16 flex items-center justify-between px-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Alex iA
              </h1>
              <button
                onClick={togglePremiumSidebar}
                className="lg:hidden text-white hover:text-gray-300 focus:outline-none"
                aria-label="Abrir menu"
              >
                {isPremiumSidebarOpen ? 'Fechar' : 'Menu'}
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {children}
          </div>

          {/* Chat Input - with proper landmark */}
          <section 
            id="chat-input"
            className="flex-shrink-0"
            role="region"
            aria-label="Área de entrada de mensagem"
          >
            <BottomNavigation />
          </section>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
