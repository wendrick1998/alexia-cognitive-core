
/**
 * @description Secure validation utilities with comprehensive error handling
 * @created_by Security Audit - Alex iA
 */

import { z } from 'zod';
import { errorHandler } from './error-handler';

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export function validateSafely<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      // Log validation failures for security monitoring
      errorHandler.logSecurityEvent({
        action: 'validation_failed',
        resource: context,
        severity: 'low',
        details: {
          context,
          errors: result.error.errors,
          dataType: typeof data
        }
      });

      return { success: false, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = `Validation error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    // Log unexpected validation errors
    errorHandler.logSecurityEvent({
      action: 'validation_exception',
      resource: context,
      severity: 'medium',
      details: {
        context,
        error: errorMessage,
        dataType: typeof data
      }
    });

    return { success: false, error: errorMessage };
  }
}

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Email inválido').max(255),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa'),
  uuid: z.string().uuid('UUID inválido'),
  url: z.string().url('URL inválida').max(2048),
  nonEmptyString: z.string().min(1, 'Campo obrigatório').max(1000),
  positiveInteger: z.number().int().positive('Deve ser um número positivo'),
  safeHtml: z.string().refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    'Conteúdo não permitido detectado'
  )
};

// Sanitization utilities
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove basic HTML chars
    .replace(/javascript:/gi, '') // Remove JS protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function validateAndSanitize(
  schema: z.ZodSchema<string>,
  input: string,
  context: string
): ValidationResult<string> {
  const sanitized = sanitizeInput(input);
  return validateSafely(schema, sanitized, context);
}
