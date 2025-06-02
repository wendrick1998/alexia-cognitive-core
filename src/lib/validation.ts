
import { z } from 'zod';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateSafely<T>(schema: z.ZodSchema<T>, data: unknown, context: string): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        success: false, 
        error: firstError?.message || 'Dados inválidos' 
      };
    }
    
    return { 
      success: false, 
      error: `Erro de validação em ${context}` 
    };
  }
}
