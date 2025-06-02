
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SkeletonPremium } from '@/components/ui/skeleton-premium';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import UnifiedDashboard from '@/components/unified/UnifiedDashboard';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado</h2>
      <p className="text-white/60 mb-4">
        Encontramos um erro inesperado. Tente recarregar a página.
      </p>
      <div className="space-y-2">
        <Button onClick={resetErrorBoundary} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
        <details className="text-left">
          <summary className="text-sm text-white/40 cursor-pointer">Detalhes do erro</summary>
          <pre className="text-xs text-red-300 mt-2 p-2 bg-black/20 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
    <div className="space-y-6">
      <SkeletonPremium className="h-20 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPremium key={i} className="h-32" />
        ))}
      </div>
      <SkeletonPremium className="h-96 w-full" />
    </div>
  </div>
);

const UnifiedDashboardPage = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <UnifiedDashboard />
      </Suspense>
    </ErrorBoundary>
  );
};

export default UnifiedDashboardPage;
