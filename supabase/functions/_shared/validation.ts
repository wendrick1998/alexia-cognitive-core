
import { z } from 'https://esm.sh/zod@3.22.4';

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

export const rateLimiter = new RateLimiter();

// Common validation schemas
export const commonSchemas = {
  userId: z.string().uuid('Invalid user ID format'),
  email: z.string().email('Invalid email format'),
  text: z.string().min(1, 'Text cannot be empty').max(10000, 'Text too long'),
  positiveNumber: z.number().positive('Must be a positive number'),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(1).max(4000),
  model: z.enum(['gpt-4o', 'gpt-4o-mini']),
  embedding: z.array(z.number()).length(1536, 'Invalid embedding dimensions')
};

// Validation middleware
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: `Validation failed: ${errorMessage}` };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'Invalid request format' };
  }
}

// Rate limiting middleware
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const limiter = new RateLimiter(maxRequests, windowMs);
  const allowed = limiter.isAllowed(identifier);
  const remaining = limiter.getRemainingRequests(identifier);
  
  return { allowed, remaining };
}

// IP extraction utility
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0]?.trim() || 
         realIP || 
         cfConnectingIP || 
         'unknown';
}

// Common response helpers
export function createErrorResponse(
  message: string, 
  status: number = 400, 
  headers: Record<string, string> = {}
) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { 
        'Content-Type': 'application/json',
        ...headers 
      } 
    }
  );
}

export function createRateLimitResponse(
  remaining: number,
  headers: Record<string, string> = {}
) {
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded', 
      remaining,
      resetTime: Date.now() + 60000 
    }),
    { 
      status: 429, 
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': '60',
        'X-RateLimit-Remaining': remaining.toString(),
        ...headers 
      } 
    }
  );
}
