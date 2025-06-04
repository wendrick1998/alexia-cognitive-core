
import { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';
import AuthGuard from '@/components/auth/AuthGuard';
import AuthPage from '@/components/auth/AuthPage';
import PremiumAppLayout from '@/components/layout/PremiumAppLayout';

// Lazy load dos componentes principais
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));
const Chat = lazy(() => import('@/components/Chat'));

// QueryClient otimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Componente para gerenciar navegação das rotas protegidas
const ProtectedApp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extrair seção atual da URL
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path.startsWith("/chat")) return "chat";
    return "dashboard";
  };

  // Handler para mudança de seção
  const handleSectionChange = (section: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/',
      chat: '/chat',
    };

    const targetRoute = routeMap[section] || '/';
    
    if (location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  };

  return (
    <PremiumAppLayout 
      currentSection={getCurrentSection()} 
      onSectionChange={handleSectionChange}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </PremiumAppLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Suspense fallback={
                  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                    <SmartLoadingSpinner size="lg" message="Carregando aplicação..." />
                  </div>
                }>
                  <Routes>
                    {/* Rota pública - Login/Cadastro */}
                    <Route path="/auth" element={<AuthPage />} />
                    
                    {/* Rotas protegidas com layout */}
                    <Route
                      path="/*"
                      element={
                        <AuthGuard>
                          <ProtectedApp />
                        </AuthGuard>
                      }
                    />
                  </Routes>
                </Suspense>
              </div>
            </Router>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
