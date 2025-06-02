
/**
 * @file useSecurity.tsx
 * @description Hook para integração com o módulo de segurança
 */

import { useCallback, useEffect, useState } from 'react';
import { securityModule, SecurityEvent } from '@/services/SecurityModule';
import { useAuth } from '@/hooks/useAuth';

export function useSecurity() {
  const { user } = useAuth();
  const [securityStats, setSecurityStats] = useState<any>(null);

  useEffect(() => {
    const updateStats = () => {
      setSecurityStats(securityModule.getSecurityStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = useCallback((identifier?: string) => {
    const id = identifier || user?.id || 'anonymous';
    return securityModule.checkRateLimit(id);
  }, [user]);

  const sanitizeInput = useCallback((input: string) => {
    return securityModule.sanitizeInput(input);
  }, []);

  const createSecureSession = useCallback(() => {
    if (!user) return null;
    return securityModule.createSession(user.id);
  }, [user]);

  const validateSession = useCallback((token: string) => {
    return securityModule.validateSession(token);
  }, []);

  const hashSensitiveData = useCallback((data: string, salt?: string) => {
    return securityModule.hashSensitiveData(data, salt);
  }, []);

  return {
    securityStats,
    checkRateLimit,
    sanitizeInput,
    createSecureSession,
    validateSession,
    hashSensitiveData,
    securityModule
  };
}
