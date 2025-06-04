
/**
 * @description Enhanced error handling and security logging
 * @created_by Manus AI - Phase 5: Security Enhancement
 */

interface SecurityEvent {
  userId?: string;
  action: string;
  resource: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  timestamp?: string;
}

interface ErrorContext {
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

class ErrorHandler {
  private errorQueue: Array<SecurityEvent> = [];
  private maxQueueSize = 100;

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Add to queue for batch processing
    this.errorQueue.push(securityEvent);
    
    // Trim queue if too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }

    // Log to console with appropriate level
    const logLevel = this.getLogLevel(event.severity);
    console[logLevel](`🚨 Security Event [${event.severity.toUpperCase()}]:`, {
      action: event.action,
      resource: event.resource,
      userId: event.userId || 'anonymous',
      details: event.details
    });

    // In production, you might want to send to external logging service
    if (event.severity === 'critical') {
      await this.handleCriticalEvent(securityEvent);
    }
  }

  private getLogLevel(severity: string): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low': return 'log';
      case 'medium': return 'warn';
      case 'high':
      case 'critical': return 'error';
      default: return 'log';
    }
  }

  private async handleCriticalEvent(event: SecurityEvent): Promise<void> {
    // For critical events, we might want to:
    // 1. Send immediate alerts
    // 2. Block suspicious users
    // 3. Log to external security service
    console.error('🔴 CRITICAL SECURITY EVENT:', event);
    
    // In a real application, you might:
    // - Send to Sentry, DataDog, or similar service
    // - Trigger security alerts
    // - Temporarily block the user
  }

  handleError(
    error: Error | unknown, 
    context: ErrorContext = {}
  ): { message: string; code: string } {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = this.generateErrorCode(context.action || 'unknown');

    // Log security event for errors
    this.logSecurityEvent({
      userId: context.userId,
      action: context.action || 'error_occurred',
      resource: context.resource || 'unknown',
      severity: this.determineSeverity(error, context),
      details: {
        message: errorMessage,
        code: errorCode,
        metadata: context.metadata
      }
    });

    return {
      message: this.sanitizeErrorMessage(errorMessage),
      code: errorCode
    };
  }

  // User-friendly error handler that returns sanitized messages
  handleUserError(error: Error | unknown, action: string = 'unknown'): string {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Log the error for internal tracking
    this.logSecurityEvent({
      action: `user_error_${action}`,
      resource: 'client_error',
      severity: 'low',
      details: {
        message: errorMessage,
        action
      }
    });

    // Return user-friendly message
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'Dados inválidos. Verifique as informações e tente novamente.';
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  private generateErrorCode(action: string): string {
    const timestamp = Date.now().toString(36);
    const actionCode = action.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4);
    return `ERR_${actionCode}_${timestamp}`;
  }

  private determineSeverity(
    error: Error | unknown, 
    context: ErrorContext
  ): SecurityEvent['severity'] {
    const errorMessage = error instanceof Error ? error.message : '';
    
    // Critical errors
    if (errorMessage.includes('unauthorized') || 
        errorMessage.includes('authentication') ||
        context.action?.includes('auth')) {
      return 'critical';
    }
    
    // High severity errors
    if (errorMessage.includes('permission') ||
        errorMessage.includes('forbidden') ||
        context.resource?.includes('admin')) {
      return 'high';
    }
    
    // Medium severity for API failures
    if (errorMessage.includes('api') || 
        errorMessage.includes('network') ||
        context.action?.includes('llm')) {
      return 'medium';
    }
    
    return 'low';
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b(?:sk-|pk_)[a-zA-Z0-9]+/g, '[API_KEY]')
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[UUID]')
      .replace(/\b(?:password|token|secret|key)\s*[:=]\s*\S+/gi, '[REDACTED]');
  }

  getRecentEvents(limit: number = 10): SecurityEvent[] {
    return this.errorQueue.slice(-limit);
  }

  clearQueue(): void {
    this.errorQueue = [];
  }
}

export const errorHandler = new ErrorHandler();

// React Error Boundary helper
export class SecurityErrorBoundary extends Error {
  constructor(
    message: string, 
    public context: ErrorContext = {},
    public originalError?: Error
  ) {
    super(message);
    this.name = 'SecurityErrorBoundary';
    
    // Log the security event
    errorHandler.logSecurityEvent({
      userId: context.userId,
      action: 'error_boundary_triggered',
      resource: context.resource || 'react_component',
      severity: 'medium',
      details: {
        message,
        originalError: originalError?.message,
        metadata: context.metadata
      }
    });
  }
}

// Async error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {}
): Promise<{ data?: T; error?: { message: string; code: string } }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const errorInfo = errorHandler.handleError(error, context);
    return { error: errorInfo };
  }
}
