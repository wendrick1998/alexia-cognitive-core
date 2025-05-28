
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { SecurityContext } from './types';

export function useAccessControl() {
  const { user } = useAuth();
  const [securityContexts, setSecurityContexts] = useState<SecurityContext[]>([]);

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
    
    return context;
  }, [user]);

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
      throw new Error(accessCheck.reason);
    }

    try {
      const result = await operation();
      return result;
    } catch (error) {
      throw error;
    }
  }, [checkAccess]);

  return {
    securityContexts,
    createSecurityContext,
    checkAccess,
    secureAccess
  };
}
