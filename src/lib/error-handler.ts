
/**
 * @description Enhanced error handling system with security logging
 * @created_by Security Audit - Alex iA
 */

interface SecurityEvent {
  userId?: string;
  action: string;
  resource: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

class ErrorHandler {
  // Log security events for monitoring
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      console.log('🔒 Security Event:', {
        timestamp: new Date().toISOString(),
        ...event
      });
      
      // In a real implementation, this would send to a security monitoring service
      // For now, we'll just log to console
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Handle user-facing errors with friendly messages
  handleUserError(error: any, context: string): string {
    console.error(`Error in ${context}:`, error);
    
    // Map technical errors to user-friendly messages
    if (error?.message?.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (error?.message?.includes('timeout')) {
      return 'A operação demorou muito para responder. Tente novamente.';
    }
    
    if (error?.message?.includes('unauthorized')) {
      return 'Você não tem permissão para esta ação.';
    }
    
    // Generic fallback
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  // Handle async errors globally
  setupGlobalErrorHandling(): void {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logSecurityEvent({
        action: 'unhandled_promise_rejection',
        resource: 'global',
        severity: 'medium',
        details: {
          error: event.reason?.message || 'Unknown error',
          stack: event.reason?.stack
        }
      });
    });

    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.logSecurityEvent({
        action: 'global_error',
        resource: 'global',
        severity: 'medium',
        details: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
  }
}

export const errorHandler = new ErrorHandler();

// Initialize global error handling
errorHandler.setupGlobalErrorHandling();
