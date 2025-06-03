
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';
import AuthGuard from '@/components/auth/AuthGuard';
import AuthPage from '@/components/auth/AuthPage';

// Log para verificar se App.tsx está sendo executado
console.log('🎯 APP.TSX EXECUTANDO - FASE 3: ATIVANDO AUTHGUARD COM ROTA /AUTH');

// Lazy load dos componentes principais
const Dashboard = lazy(() => {
  console.log('📊 Lazy loading Dashboard...');
  return import('@/components/dashboard/Dashboard');
});

const Chat = lazy(() => {
  console.log('💬 Lazy loading Chat...');
  return import('@/components/Chat');
});

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

console.log('⚙️ QueryClient criado com sucesso - FASE 3');

function App() {
  console.log('🎯 App component renderizando - FASE 3: ROTAS COM AUTHGUARD + /AUTH');
  
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
                    {/* ROTA PÚBLICA - LOGIN/CADASTRO */}
                    <Route path="/auth" element={<AuthPage />} />
                    
                    {/* ROTAS PROTEGIDAS - DENTRO DO AUTHGUARD */}
                    <Route path="/*" element={
                      <AuthGuard>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/chat" element={<Chat />} />
                          <Route path="*" element={<Dashboard />} />
                        </Routes>
                      </AuthGuard>
                    } />
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

console.log('📤 App.tsx configurado para FASE 3 COM AUTHGUARD E ROTA /AUTH - exportando');
export default App;
