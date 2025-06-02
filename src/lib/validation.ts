
/**
 * @description Validation utilities with Zod for secure input handling
 * @created_by Security Audit - Alex iA
 */

import { z } from 'zod';

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(10000, 'Mensagem muito longa')
    .refine(val => !containsMaliciousContent(val), 'Conteúdo suspeito detectado'),
  conversationId: z.string().uuid().optional(),
  userId: z.string().uuid()
});

// Document upload validation
export const documentUploadSchema = z.object({
  file: z.object({
    name: z.string().max(255),
    size: z.number().max(50 * 1024 * 1024), // 50MB max
    type: z.string().refine(type => 
      ['application/pdf', 'text/plain', 'application/msword'].includes(type),
      'Tipo de arquivo não permitido'
    )
  }),
  userId: z.string().uuid()
});

// Memory creation validation
export const memorySchema = z.object({
  content: z.string()
    .min(1, 'Conteúdo não pode estar vazio')
    .max(5000, 'Conteúdo muito longo'),
  type: z.enum(['note', 'fact', 'preference', 'decision']),
  userId: z.string().uuid()
});

// User input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Malicious content detection
const containsMaliciousContent = (content: string): boolean => {
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /union\s+select/gi,
    /exec\(/gi,
    /eval\(/gi,
    /document\.cookie/gi,
    /localStorage\./gi,
    /sessionStorage\./gi
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(content));
};

// Rate limiting validation
export const rateLimitSchema = z.object({
  action: z.string(),
  userId: z.string().uuid(),
  timestamp: z.number()
});

// Validation error handler
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Safe validation wrapper
export const validateSafely = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      console.warn(`Validation failed in ${context || 'unknown'}:`, {
        field: firstError.path.join('.'),
        message: firstError.message,
        received: firstError.received
      });
      
      return {
        success: false,
        error: `Dados inválidos: ${firstError.message}`
      };
    }
    
    console.error(`Unexpected validation error in ${context}:`, error);
    return {
      success: false,
      error: 'Erro de validação interno'
    };
  }
};
