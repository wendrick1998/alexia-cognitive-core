
/**
 * @description Analisador visual de bundle para desenvolvimento
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Package, Zap, BarChart3 } from 'lucide-react';
import { useBundlePerformance } from '@/hooks/useBundlePerformance';

export function BundleAnalyzer() {
  const { 
    metrics, 
    resourceEntries, 
    isAnalyzing, 
    analyzeResources, 
    getCoreWebVitals,
    getBundleHealth 
  } = useBundlePerformance();

  const coreWebVitals = getCoreWebVitals();
  const bundleHealth = getBundleHealth();

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <Zap className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-gray-900/95 backdrop-blur-sm border-white/10 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Package className="w-4 h-4" />
            Bundle Analyzer
            <Button
              variant="ghost"
              size="sm"
              onClick={analyzeResources}
              disabled={isAnalyzing}
              className="ml-auto h-6 px-2"
            >
              {isAnalyzing ? 'Analisando...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {/* Health Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Health Score</span>
              <div className={`flex items-center gap-1 ${getHealthColor(bundleHealth.status)}`}>
                {getHealthIcon(bundleHealth.status)}
                <span className="font-medium">{bundleHealth.score}/100</span>
              </div>
            </div>
            <Progress value={bundleHealth.score} className="h-1" />
          </div>

          {/* Bundle Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-white/70">Chunks</div>
              <div className="font-medium">{metrics.chunkCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-white/70">Total Size</div>
              <div className="font-medium">{metrics.totalSize} KB</div>
            </div>
            <div className="space-y-1">
              <div className="text-white/70">Load Time</div>
              <div className="font-medium">{metrics.loadTime} ms</div>
            </div>
            <div className="space-y-1">
              <div className="text-white/70">Cache Hit</div>
              <div className="font-medium">{metrics.cacheHitRate}%</div>
            </div>
          </div>

          {/* Core Web Vitals */}
          {coreWebVitals && (
            <div className="space-y-2">
              <div className="text-white/70 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Core Web Vitals
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>LCP: {Math.round(coreWebVitals.lcp)}ms</div>
                <div>FID: {Math.round(coreWebVitals.fid)}ms</div>
                <div>FCP: {Math.round(coreWebVitals.fcp)}ms</div>
                <div>TTI: {Math.round(coreWebVitals.tti)}ms</div>
              </div>
            </div>
          )}

          {/* Issues */}
          {bundleHealth.issues.length > 0 && (
            <div className="space-y-2">
              <div className="text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Issues ({bundleHealth.issues.length})
              </div>
              <div className="space-y-1">
                {bundleHealth.issues.slice(0, 2).map((issue, index) => (
                  <div key={index} className="text-xs text-white/60 bg-yellow-500/10 rounded px-2 py-1">
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Largest Chunks */}
          {resourceEntries.length > 0 && (
            <div className="space-y-2">
              <div className="text-white/70">Largest Chunks</div>
              <div className="space-y-1">
                {resourceEntries
                  .sort((a, b) => b.size - a.size)
                  .slice(0, 3)
                  .map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="truncate text-white/60 max-w-[120px]">
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {entry.cached && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            cached
                          </Badge>
                        )}
                        <span className="font-medium">
                          {Math.round(entry.size / 1024)}KB
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Critical Resources Status */}
          <div className="flex items-center justify-between">
            <span className="text-white/70">Critical Resources</span>
            <div className={`flex items-center gap-1 ${
              metrics.criticalResourcesLoaded ? 'text-green-400' : 'text-red-400'
            }`}>
              {metrics.criticalResourcesLoaded ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertTriangle className="w-3 h-3" />
              )}
              <span className="text-xs">
                {metrics.criticalResourcesLoaded ? 'Loaded' : 'Missing'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BundleAnalyzer;
