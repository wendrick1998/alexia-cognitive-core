
/**
 * @description Secure API utilities with comprehensive validation
 * @created_by Security Audit - Alex iA
 */

import { z } from 'zod';
import { errorHandler } from './error-handler';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Rate limiting for API calls
const apiCallCounts = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(
  identifier: string,
  maxCalls: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = `api_${identifier}`;
  const existing = apiCallCounts.get(key);

  if (!existing || now > existing.resetTime) {
    apiCallCounts.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (existing.count >= maxCalls) {
    return true;
  }

  existing.count++;
  return false;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Secure validation wrapper
export function validateSafely<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      const errorMessage = firstError?.message || 'Dados inválidos';
      
      errorHandler.logSecurityEvent({
        action: 'validation_failed',
        resource: context,
        severity: 'low',
        details: {
          error: errorMessage,
          path: firstError?.path?.join('.') || 'unknown'
        }
      });

      return {
        success: false,
        error: errorMessage
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    errorHandler.logSecurityEvent({
      action: 'validation_error',
      resource: context,
      severity: 'medium',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });

    return {
      success: false,
      error: 'Erro na validação dos dados'
    };
  }
}

// Secure API request wrapper
export async function secureApiCall<T>(
  apiCall: () => Promise<T>,
  context: string,
  userId?: string
): Promise<{ data?: T; error?: string }> {
  const identifier = userId || 'anonymous';
  
  if (isRateLimited(identifier)) {
    return { error: 'Muitas requisições. Tente novamente em alguns segundos.' };
  }

  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    await errorHandler.logSecurityEvent({
      userId,
      action: 'api_call_failed',
      resource: context,
      severity: 'medium',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return {
      error: error instanceof Error ? error.message : 'Erro na requisição'
    };
  }
}

// Schema validation for common data types
export const commonSchemas = {
  email: z.string().email('Email inválido').max(255),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa'),
  uuid: z.string().uuid('ID inválido'),
  url: z.string().url('URL inválida').max(2048),
  text: z.string().max(10000, 'Texto muito longo'),
  positiveNumber: z.number().positive('Deve ser um número positivo'),
  safeHtml: z.string().transform(sanitizeInput)
};

// Validate API parameters
export function validateApiParams<T extends Record<string, unknown>>(
  params: T,
  schema: z.ZodSchema<T>,
  context: string
): ValidationResult<T> {
  const validation = validateSafely(schema, params, context);
  
  if (!validation.success) {
    return validation;
  }

  // Additional security checks
  const cleanedParams = Object.fromEntries(
    Object.entries(validation.data).map(([key, value]) => [
      key,
      typeof value === 'string' ? sanitizeInput(value) : value
    ])
  ) as T;

  return {
    success: true,
    data: cleanedParams
  };
}
