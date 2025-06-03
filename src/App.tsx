
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

// Log para verificar se App.tsx está sendo executado
console.log('🎯 App.tsx carregando - FASE 2 ISOLAMENTO DO CHAT');

// Lazy load apenas Chat para diagnóstico isolado
const Chat = lazy(() => {
  console.log('💬 Lazy loading Chat - tentando importar...');
  try {
    return import('@/components/Chat');
  } catch (error) {
    console.error('❌ ERRO no lazy loading do Chat:', error);
    throw error;
  }
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

console.log('⚙️ QueryClient criado com sucesso - FASE 2 ISOLAMENTO');

function App() {
  console.log('🎯 App component renderizando - FASE 2: APENAS CHAT ISOLADO');
  
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Suspense fallback={
                  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                    <SmartLoadingSpinner size="lg" message="Carregando Chat isolado para diagnóstico..." />
                  </div>
                }>
                  <Routes>
                    {/* FASE 2: Apenas Chat isolado para diagnóstico */}
                    <Route path="/" element={<Chat />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="*" element={<Chat />} />
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

console.log('📤 App.tsx configurado para FASE 2 ISOLAMENTO - exportando');
export default App;
