
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface SecurityContext {
  id: string;
  name: string;
  level: 'public' | 'private' | 'confidential' | 'secret';
  encryption: boolean;
  auditTrail: boolean;
  accessControl: string[];
  createdAt: Date;
  lastAccessed: Date;
}

export interface AccessLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  success: boolean;
  metadata: any;
  riskScore: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
  algorithm: string;
  keyDerivation: string;
}

export interface SecurityMetrics {
  totalAccesses: number;
  failedAttempts: number;
  anomalousActivities: number;
  avgRiskScore: number;
  encryptionCoverage: number;
  complianceScore: number;
}

export function useCognitiveSecurity() {
  const { user } = useAuth();
  const [securityContexts, setSecurityContexts] = useState<SecurityContext[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAccesses: 0,
    failedAttempts: 0,
    anomalousActivities: 0,
    avgRiskScore: 0,
    encryptionCoverage: 0,
    complianceScore: 0
  });

  const cryptoKeyCache = useRef(new Map<string, CryptoKey>());
  const auditBuffer = useRef<AccessLog[]>([]);
  const riskThresholds = useRef({
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    critical: 0.95
  });

  // Generate secure encryption key
  const generateEncryptionKey = useCallback(async (
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> => {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }, []);

  // Encrypt sensitive data
  const encryptData = useCallback(async (
    data: any,
    password: string
  ): Promise<EncryptedData> => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await generateEncryptionKey(password, salt);
    
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    return {
      data: Array.from(new Uint8Array(encryptedBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      iv: Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      salt: Array.from(salt)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      algorithm: 'AES-GCM',
      keyDerivation: 'PBKDF2'
    };
  }, [generateEncryptionKey]);

  // Decrypt sensitive data
  const decryptData = useCallback(async (
    encryptedData: EncryptedData,
    password: string
  ): Promise<any> => {
    const salt = new Uint8Array(
      encryptedData.salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    const iv = new Uint8Array(
      encryptedData.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    const data = new Uint8Array(
      encryptedData.data.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );

    const key = await generateEncryptionKey(password, salt);
    
    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decryptedText);
    } catch (error) {
      throw new Error('Failed to decrypt data: Invalid password or corrupted data');
    }
  }, [generateEncryptionKey]);

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

  // Log access attempt
  const logAccess = useCallback(async (
    action: string,
    resource: string,
    success: boolean,
    metadata: any = {}
  ): Promise<void> => {
    if (!user) return;

    const riskScore = calculateRiskScore(action, resource, metadata);
    
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
    auditBuffer.current.push(accessLog);
    
    // Keep only last 1000 logs in memory
    if (auditBuffer.current.length > 1000) {
      auditBuffer.current = auditBuffer.current.slice(-1000);
    }

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalAccesses: prev.totalAccesses + 1,
      failedAttempts: success ? prev.failedAttempts : prev.failedAttempts + 1,
      anomalousActivities: riskScore > riskThresholds.current.high ? 
        prev.anomalousActivities + 1 : prev.anomalousActivities,
      avgRiskScore: (prev.avgRiskScore * prev.totalAccesses + riskScore) / (prev.totalAccesses + 1)
    }));

    // Alert on high-risk activities
    if (riskScore > riskThresholds.current.critical) {
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
  }, [user, calculateRiskScore]);

  // Create security context
  const createSecurityContext = useCallback(async (
    name: string,
    level: SecurityContext['level'],
    options: {
      encryption?: boolean;
      auditTrail?: boolean;
      accessControl?: string[];
    } = {}
  ): Promise<SecurityContext> => {
    const context: SecurityContext = {
      id: crypto.randomUUID(),
      name,
      level,
      encryption: options.encryption ?? level !== 'public',
      auditTrail: options.auditTrail ?? true,
      accessControl: options.accessControl ?? [user?.id || 'anonymous'],
      createdAt: new Date(),
      lastAccessed: new Date()
    };

    setSecurityContexts(prev => [...prev, context]);
    
    await logAccess('create_context', `security_context:${name}`, true, { level });
    
    return context;
  }, [user, logAccess]);

  // Check access permission
  const checkAccess = useCallback((
    contextId: string,
    action: string
  ): { allowed: boolean; reason?: string } => {
    const context = securityContexts.find(c => c.id === contextId);
    if (!context) {
      return { allowed: false, reason: 'Context not found' };
    }

    // Check user permissions
    if (!context.accessControl.includes(user?.id || '')) {
      return { allowed: false, reason: 'Access denied: User not in access control list' };
    }

    // Check action permissions based on security level
    const restrictedActions = ['delete', 'export', 'admin'];
    if (context.level === 'secret' && restrictedActions.includes(action)) {
      return { allowed: false, reason: `Action '${action}' not allowed for secret context` };
    }

    return { allowed: true };
  }, [securityContexts, user]);

  // Secure data access with logging
  const secureAccess = useCallback(async <T>(
    contextId: string,
    action: string,
    operation: () => Promise<T>,
    metadata: any = {}
  ): Promise<T | null> => {
    const accessCheck = checkAccess(contextId, action);
    
    if (!accessCheck.allowed) {
      await logAccess(action, `context:${contextId}`, false, { 
        ...metadata, 
        reason: accessCheck.reason 
      });
      throw new Error(accessCheck.reason);
    }

    try {
      const result = await operation();
      await logAccess(action, `context:${contextId}`, true, metadata);
      return result;
    } catch (error) {
      await logAccess(action, `context:${contextId}`, false, { 
        ...metadata, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }, [checkAccess, logAccess]);

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
  const generateSecurityReport = useCallback(() => {
    const anomalies = detectAnomalies();
    const now = Date.now();
    const dayAgo = now - 86400000;
    
    const dailyLogs = auditBuffer.current.filter(
      log => log.timestamp.getTime() > dayAgo
    );

    return {
      timestamp: new Date(),
      period: '24 hours',
      metrics: {
        ...metrics,
        encryptionCoverage: securityContexts.filter(c => c.encryption).length / 
          Math.max(1, securityContexts.length),
        complianceScore: Math.max(0, 1 - (metrics.failedAttempts / Math.max(1, metrics.totalAccesses)))
      },
      anomalies,
      topActions: dailyLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recommendations: generateSecurityRecommendations(anomalies, metrics)
    };
  }, [detectAnomalies, metrics, securityContexts, generateSecurityRecommendations]);

  // Periodic security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const anomalies = detectAnomalies();
      if (anomalies.length > 0) {
        console.log('🛡️ Security anomalies detected:', anomalies);
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [detectAnomalies]);

  return {
    // Encryption
    encryptData,
    decryptData,
    
    // Access control
    createSecurityContext,
    checkAccess,
    secureAccess,
    
    // Monitoring
    logAccess,
    detectAnomalies,
    generateSecurityReport,
    
    // State
    securityContexts,
    accessLogs: auditBuffer.current,
    metrics,
    
    // Risk assessment
    calculateRiskScore,
    riskThresholds: riskThresholds.current
  };
}
