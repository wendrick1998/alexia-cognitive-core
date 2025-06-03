
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

// Log para verificar se App.tsx está sendo executado
console.log('🎯 App.tsx carregando - diagnóstico progressivo FASE 2 INICIADO');

// Lazy load Dashboard e Chat para teste progressivo
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

console.log('⚙️ QueryClient criado com sucesso');

function App() {
  console.log('🎯 App component renderizando - FASE 2: Dashboard + Chat');
  
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Suspense fallback={
                  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                    <SmartLoadingSpinner size="lg" message="Carregando componentes FASE 2..." />
                  </div>
                }>
                  <Routes>
                    {/* FASE 2: Dashboard e Chat sem guards */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="*" element={<Dashboard />} />
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

console.log('📤 App.tsx configurado para FASE 2 - exportando');
export default App;
