
import { useCallback, useRef } from 'react';
import type { AccessLog, RiskThresholds } from './types';

export function useRiskAssessment() {
  const auditBuffer = useRef<AccessLog[]>([]);
  const riskThresholds = useRef<RiskThresholds>({
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    critical: 0.95
  });

  // Calculate risk score for an action
  const calculateRiskScore = useCallback((
    action: string,
    resource: string,
    context: any = {}
  ): number => {
    let riskScore = 0;

    // Base risk by action type
    const actionRisks: Record<string, number> = {
      'read': 0.1,
      'write': 0.3,
      'delete': 0.8,
      'export': 0.7,
      'share': 0.6,
      'admin': 0.9
    };
    riskScore += actionRisks[action] || 0.5;

    // Resource sensitivity
    if (resource.includes('cognitive') || resource.includes('memory')) {
      riskScore += 0.2;
    }
    if (resource.includes('personal') || resource.includes('private')) {
      riskScore += 0.3;
    }

    // Time-based risk (unusual hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 0.2;
    }

    // Frequency risk (too many actions in short time)
    const recentLogs = auditBuffer.current.filter(
      log => Date.now() - log.timestamp.getTime() < 300000 // Last 5 minutes
    );
    if (recentLogs.length > 10) {
      riskScore += 0.3;
    }

    // Context-based risk
    if (context.location && context.location !== 'known') {
      riskScore += 0.2;
    }
    if (context.device && context.device !== 'trusted') {
      riskScore += 0.1;
    }

    return Math.min(1.0, riskScore);
  }, []);

  // Detect anomalous behavior
  const detectAnomalies = useCallback((): any[] => {
    const anomalies = [];
    const now = Date.now();
    const hourAgo = now - 3600000;
    
    const recentLogs = auditBuffer.current.filter(
      log => log.timestamp.getTime() > hourAgo
    );

    // Check for unusual patterns
    const actionCounts = recentLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Detect excessive failed attempts
    const failedAttempts = recentLogs.filter(log => !log.success);
    if (failedAttempts.length > 10) {
      anomalies.push({
        type: 'excessive_failed_attempts',
        count: failedAttempts.length,
        timeframe: '1 hour',
        severity: 'high'
      });
    }

    // Detect unusual action frequency
    Object.entries(actionCounts).forEach(([action, count]) => {
      if (count > 50) { // Threshold for suspicious activity
        anomalies.push({
          type: 'unusual_frequency',
          action,
          count,
          severity: count > 100 ? 'critical' : 'medium'
        });
      }
    });

    // Detect high-risk activities
    const highRiskLogs = recentLogs.filter(
      log => log.riskScore > riskThresholds.current.high
    );
    if (highRiskLogs.length > 5) {
      anomalies.push({
        type: 'multiple_high_risk_activities',
        count: highRiskLogs.length,
        avgRiskScore: highRiskLogs.reduce((sum, log) => sum + log.riskScore, 0) / highRiskLogs.length,
        severity: 'high'
      });
    }

    return anomalies;
  }, []);

  return {
    calculateRiskScore,
    detectAnomalies,
    auditBuffer: auditBuffer.current,
    riskThresholds: riskThresholds.current
  };
}
