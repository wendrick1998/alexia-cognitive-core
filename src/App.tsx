
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';

// Debug: Log para verificar se App.tsx está sendo executado
console.log('🚀 App.tsx carregando - versão de teste');

// TESTE SIMPLES - Componente direto para debug
const TestComponent = () => {
  console.log('🧪 TestComponent renderizando');
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ef4444', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1>🧪 TESTE SIMPLES FUNCIONANDO!</h1>
        <p style={{ fontSize: '16px', marginTop: '20px' }}>
          Se você vê esta mensagem, o React está funcionando.
        </p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          Caminho: {window.location.pathname}
        </p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          UserAgent: {navigator.userAgent.includes('Safari') ? 'Safari' : 'Outro'}
        </p>
      </div>
    </div>
  );
};

// Lazy load da página principal - TEMPORARIAMENTE DESABILITADO
// const IndexPage = lazy(() => import('@/pages/Index'));

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
  console.log('🎯 App component renderizando - MODO TESTE');
  
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                {/* TESTE SIMPLES - SEM SUSPENSE */}
                <Routes>
                  <Route path="/*" element={<TestComponent />} />
                </Routes>
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
