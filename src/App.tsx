
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

// Log para verificar se App.tsx está sendo executado
console.log('🎯 App.tsx carregando - versão corrigida');

// Lazy load da página principal
const IndexPage = lazy(() => import('@/pages/Index'));

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

function App() {
  console.log('🎯 App component renderizando - versão corrigida');
  
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Suspense fallback={
                  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                    <SmartLoadingSpinner size="large" message="Carregando Alex iA..." />
                  </div>
                }>
                  <Routes>
                    <Route path="/*" element={<IndexPage />} />
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
