
import { useState, Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import PremiumAppLayout from '@/components/layout/PremiumAppLayout';
import DarkModeToggle from '@/components/premium/DarkModeToggle';

// Lazy load sections for better performance
const Chat = lazy(() => import('@/components/Chat'));
const SemanticSearch = lazy(() => import('@/components/SemanticSearch'));
const MemoryManager = lazy(() => import('@/components/MemoryManager'));
const Dashboard = lazy(() => import('@/components/dashboard/Dashboard'));

// Import DocumentsList directly to access its props type
import DocumentsList from '@/components/documents/DocumentsList';

interface IndexProps {}

const Index: React.FC<IndexProps> = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const handleSectionChange = (section: string, id?: string) => {
    console.log('Changing section to:', section, id ? `with ID: ${id}` : '');
    setCurrentSection(section);
  };

  const renderSection = () => {
    const sectionProps = { key: currentSection };
    
    switch (currentSection) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Carregando dashboard..." />}>
            <Dashboard {...sectionProps} />
          </Suspense>
        );
      case 'chat':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Carregando chat..." />}>
            <Chat {...sectionProps} />
          </Suspense>
        );
      case 'search':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Carregando busca..." />}>
            <SemanticSearch {...sectionProps} />
          </Suspense>
        );
      case 'memory':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Carregando memórias..." />}>
            <MemoryManager {...sectionProps} />
          </Suspense>
        );
      case 'documents':
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Carregando documentos..." />}>
            <DocumentsList 
              documents={[]}
              reprocessingIds={new Set()}
              onReprocess={() => {}}
              onDelete={() => {}}
              {...sectionProps} 
            />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner size="lg" text="Carregando dashboard..." />}>
            <Dashboard {...sectionProps} />
          </Suspense>
        );
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para conteúdo principal
      </a>
      
      <ErrorBoundary>
        <PremiumAppLayout
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        >
          <div className="absolute top-4 right-4 z-10">
            <DarkModeToggle />
          </div>
          
          <main id="main-content" className="h-full w-full">
            <ErrorBoundary>
              {renderSection()}
            </ErrorBoundary>
          </main>
        </PremiumAppLayout>
      </ErrorBoundary>
    </>
  );
};

export default Index;
