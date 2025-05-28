import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEncryption } from './security/useEncryption';
import { useRiskAssessment } from './security/useRiskAssessment';
import { useAccessControl } from './security/useAccessControl';
import { useSecurityReporting } from './security/useSecurityReporting';
import type { SecurityMetrics, AccessLog } from './security/types';

export function useCognitiveSecurity() {
  const { user } = useAuth();
  const encryption = useEncryption();
  const riskAssessment = useRiskAssessment();
  const accessControl = useAccessControl();
  const reporting = useSecurityReporting();

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAccesses: 0,
    failedAttempts: 0,
    anomalousActivities: 0,
    avgRiskScore: 0,
    encryptionCoverage: 0,
    complianceScore: 0
  });

  // Log access attempt
  const logAccess = useCallback(async (
    action: string,
    resource: string,
    success: boolean,
    metadata: any = {}
  ): Promise<void> => {
    if (!user) return;

    const riskScore = riskAssessment.calculateRiskScore(action, resource, metadata);
    
    const accessLog: AccessLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      action,
      resource,
      timestamp: new Date(),
      success,
      metadata,
      riskScore
    };

    // Add to buffer
    riskAssessment.auditBuffer.push(accessLog);
    
    // Keep only last 1000 logs in memory
    if (riskAssessment.auditBuffer.length > 1000) {
      riskAssessment.auditBuffer.splice(0, riskAssessment.auditBuffer.length - 1000);
    }

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalAccesses: prev.totalAccesses + 1,
      failedAttempts: success ? prev.failedAttempts : prev.failedAttempts + 1,
      anomalousActivities: riskScore > riskAssessment.riskThresholds.high ? 
        prev.anomalousActivities + 1 : prev.anomalousActivities,
      avgRiskScore: (prev.avgRiskScore * prev.totalAccesses + riskScore) / (prev.totalAccesses + 1)
    }));

    // Alert on high-risk activities
    if (riskScore > riskAssessment.riskThresholds.critical) {
      console.warn('🚨 Critical security event:', { action, resource, riskScore });
      
      // Could trigger notifications or additional security measures
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Security Alert', {
          body: `High-risk activity detected: ${action} on ${resource}`,
          icon: '/security-icon.png'
        });
      }
    }

    console.log(`🔒 Access logged: ${action} on ${resource} (risk: ${riskScore.toFixed(2)})`);
  }, [user, riskAssessment]);

  // Generate comprehensive security report
  const generateSecurityReport = useCallback(() => {
    const anomalies = riskAssessment.detectAnomalies();
    return reporting.generateSecurityReport(
      metrics, 
      anomalies, 
      accessControl.securityContexts.length
    );
  }, [metrics, riskAssessment, reporting, accessControl.securityContexts.length]);

  // Periodic security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const anomalies = riskAssessment.detectAnomalies();
      if (anomalies.length > 0) {
        console.log('🛡️ Security anomalies detected:', anomalies);
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [riskAssessment]);

  return {
    // Encryption
    encryptData: encryption.encryptData,
    decryptData: encryption.decryptData,
    
    // Access control
    createSecurityContext: accessControl.createSecurityContext,
    checkAccess: accessControl.checkAccess,
    secureAccess: accessControl.secureAccess,
    
    // Monitoring
    logAccess,
    detectAnomalies: riskAssessment.detectAnomalies,
    generateSecurityReport,
    
    // State
    securityContexts: accessControl.securityContexts,
    accessLogs: riskAssessment.auditBuffer,
    metrics,
    
    // Risk assessment
    calculateRiskScore: riskAssessment.calculateRiskScore,
    riskThresholds: riskAssessment.riskThresholds
  };
}

// Re-export types for backward compatibility
export type {
  SecurityContext,
  AccessLog,
  EncryptedData,
  SecurityMetrics
} from './security/types';
