
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

export interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
  critical: number;
}
