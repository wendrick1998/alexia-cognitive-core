
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { SecurityContext } from './types';

export function useAccessControl() {
  const { user } = useAuth();
  const [securityContexts, setSecurityContexts] = useState<SecurityContext[]>([]);

  const createSecurityContext = useCallback((
    name: string,
    level: 'public' | 'private' | 'secret'
  ): SecurityContext => {
    const context: SecurityContext = {
      id: crypto.randomUUID(),
      name,
      level,
      createdAt: new Date()
    };

    setSecurityContexts(prev => [...prev, context]);
    return context;
  }, [user]);

  const checkAccess = useCallback((
    contextId: string,
    action: 'read' | 'write' | 'delete' | 'admin'
  ): boolean => {
    const context = securityContexts.find(c => c.id === contextId);
    if (!context) return false;
    
    // Simple access control based on security level
    switch (context.level) {
      case 'public':
        return true;
      case 'private':
        return action !== 'admin';
      case 'secret':
        return action === 'read';
      default:
        return false;
    }
  }, [securityContexts]);

  const secureAccess = useCallback(async (
    contextId: string,
    action: 'read' | 'write' | 'delete' | 'admin',
    callback: () => Promise<any>
  ): Promise<any> => {
    if (!checkAccess(contextId, action)) {
      throw new Error(`Access denied: ${action} on ${contextId}`);
    }
    return await callback();
  }, [checkAccess]);

  return {
    securityContexts,
    createSecurityContext,
    checkAccess,
    secureAccess
  };
}
