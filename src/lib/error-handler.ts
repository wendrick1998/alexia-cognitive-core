
/**
 * @description Centralized error handling with secure logging
 * @created_by Security Audit - Alex iA
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  userId?: string;
  action: string;
  resource: string;
  severity: ErrorSeverity;
  details: Record<string, any>;
  userAgent?: string;
  ip?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  // Log security events to console (will be extended to database once migration is applied)
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to console for immediate debugging
      console.warn('🔒 Security Event:', {
        timestamp: new Date().toISOString(),
        userId: event.userId || 'anonymous',
        action: event.action,
        resource: event.resource,
        severity: event.severity,
        details: event.details,
        userAgent: event.userAgent || navigator?.userAgent,
        ip: event.ip || 'unknown'
      });
      
      // TODO: Store in database once security_events table is available
      // This will be enabled after the migration is applied
      /*
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: event.userId,
          action: event.action,
          resource: event.resource,
          severity: event.severity,
          details: event.details,
          user_agent: event.userAgent || navigator?.userAgent,
          ip_address: event.ip,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Failed to log security event to database:', error);
      }
      */
    } catch (err) {
      console.error('Security logging error:', err);
    }
  }
  
  // Handle errors safely for user display
  handleUserError(error: unknown, context: string): string {
    console.error(`Error in ${context}:`, error);
    
    // Log security event for suspicious errors
    if (this.isSuspiciousError(error)) {
      this.logSecurityEvent({
        action: 'suspicious_error',
        resource: context,
        severity: 'medium',
        details: { 
          errorType: typeof error,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
    
    // Return safe error messages
    if (error instanceof ValidationError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Network Error')) {
        return 'Erro de conexão. Verifique sua internet.';
      }
      
      if (error.message.includes('Unauthorized')) {
        return 'Acesso não autorizado. Faça login novamente.';
      }
      
      if (error.message.includes('rate limit')) {
        return 'Muitas tentativas. Aguarde alguns momentos.';
      }
    }
    
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
  
  // Detect suspicious errors that might indicate attacks
  private isSuspiciousError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    
    const suspiciousPatterns = [
      /sql injection/i,
      /xss/i,
      /script injection/i,
      /path traversal/i,
      /unauthorized access/i
    ];
    
    return suspiciousPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.stack || '')
    );
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Validation Error class
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
