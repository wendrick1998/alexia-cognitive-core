
import { useCallback } from 'react';
import type { SecurityMetrics } from './types';

export function useSecurityReporting() {
  // Generate security recommendations
  const generateSecurityRecommendations = useCallback((
    anomalies: any[],
    currentMetrics: SecurityMetrics
  ): string[] => {
    const recommendations = [];

    if (currentMetrics.failedAttempts > currentMetrics.totalAccesses * 0.1) {
      recommendations.push('Consider implementing additional authentication factors');
    }

    if (currentMetrics.encryptionCoverage < 0.8) {
      recommendations.push('Increase encryption coverage for sensitive data');
    }

    if (anomalies.some(a => a.severity === 'critical')) {
      recommendations.push('Review and investigate critical security anomalies immediately');
    }

    if (currentMetrics.avgRiskScore > 0.6) {
      recommendations.push('Review access patterns and consider tightening security policies');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security posture is good - maintain current practices');
    }

    return recommendations;
  }, []);

  // Generate security report
  const generateSecurityReport = useCallback((
    metrics: SecurityMetrics,
    anomalies: any[],
    securityContextsCount: number
  ) => {
    const now = Date.now();
    
    return {
      timestamp: new Date(),
      period: '24 hours',
      metrics: {
        ...metrics,
        encryptionCoverage: securityContextsCount > 0 ? 
          metrics.encryptionCoverage : 0,
        complianceScore: Math.max(0, 1 - (metrics.failedAttempts / Math.max(1, metrics.totalAccesses)))
      },
      anomalies,
      recommendations: generateSecurityRecommendations(anomalies, metrics)
    };
  }, [generateSecurityRecommendations]);

  return {
    generateSecurityRecommendations,
    generateSecurityReport
  };
}
