
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Suspense, lazy } from 'react';
import { SmartLoadingSpinner } from '@/components/ui/SmartLoadingSpinner';
import { BundleAnalyzer } from '@/components/performance/BundleAnalyzer';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy imports para reduzir bundle inicial
const AppLayout = lazy(() => import('@/components/AppLayout'));
const Chat = lazy(() => import('@/components/Chat'));
const Documents = lazy(() => import('@/components/Documents'));
const MemoryManager = lazy(() => import('@/components/MemoryManager'));
const SemanticSearch = lazy(() => import('@/components/SemanticSearch'));
const ProjectsManager = lazy(() => import('@/components/ProjectsManager'));

function App() {
  const [currentSection, setCurrentSection] = useState('chat');
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      },
    },
  }));

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const renderSection = () => {
    const LoadingFallback = ({ type }: { type: 'chat' | 'cognitive' | 'database' | 'general' }) => (
      <div className="flex items-center justify-center min-h-[400px]">
        <SmartLoadingSpinner type={type} message="Carregando..." />
      </div>
    );

    switch (currentSection) {
      case 'chat':
        return (
          <Suspense fallback={<LoadingFallback type="chat" />}>
            <Chat />
          </Suspense>
        );
      case 'documents':
        return (
          <Suspense fallback={<LoadingFallback type="database" />}>
            <Documents />
          </Suspense>
        );
      case 'memory':
        return (
          <Suspense fallback={<LoadingFallback type="cognitive" />}>
            <MemoryManager />
          </Suspense>
        );
      case 'search':
        return (
          <Suspense fallback={<LoadingFallback type="general" />}>
            <SemanticSearch />
          </Suspense>
        );
      case 'actions':
        return (
          <Suspense fallback={<LoadingFallback type="general" />}>
            <ProjectsManager />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingFallback type="chat" />}>
            <Chat />
          </Suspense>
        );
    }
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <SmartLoadingSpinner type="general" message="Iniciando Alex iA..." />
              </div>
            }>
              <AppLayout>
                {renderSection()}
              </AppLayout>
            </Suspense>
            
            <Toaster />
            <BundleAnalyzer />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
