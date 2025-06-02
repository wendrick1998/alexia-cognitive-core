
import { Suspense } from 'react';
import { SkeletonPremium } from '@/components/ui/skeleton-premium';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import UnifiedDashboard from '@/components/unified/UnifiedDashboard';

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
    <Suspense fallback={<LoadingFallback />}>
      <UnifiedDashboard />
    </Suspense>
  );
};

export default UnifiedDashboardPage;
