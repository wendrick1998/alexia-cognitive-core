
/**
 * @description Secure API wrapper for Edge Functions
 * @created_by Security Audit - Alex iA
 */

import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from '@/lib/error-handler';
import { rateLimiter } from '@/lib/rate-limiter';
import { validateSafely } from '@/lib/validation';
import { z } from 'zod';

interface ApiRequestOptions {
  body?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  rateLimitKey?: string;
  schema?: z.ZodSchema;
}

class SecureApi {
  private static instance: SecureApi;
  private defaultTimeout = 30000; // 30 seconds
  
  private constructor() {}
  
  public static getInstance(): SecureApi {
    if (!SecureApi.instance) {
      SecureApi.instance = new SecureApi();
    }
    return SecureApi.instance;
  }
  
  // Secure function invocation with validation and rate limiting
  async invokeFunction<T = any>(
    functionName: string,
    options: ApiRequestOptions = {}
  ): Promise<{ data: T | null; error: string | null }> {
    const {
      body,
      headers = {},
      timeout = this.defaultTimeout,
      rateLimitKey = functionName,
      schema
    } = options;
    
    try {
      // Rate limiting check
      if (!rateLimiter.isAllowed({
        maxRequests: 30,
        windowMs: 60000, // 30 requests per minute
        identifier: `api_${rateLimitKey}_${Date.now()}`
      })) {
        await errorHandler.logSecurityEvent({
          action: 'rate_limit_exceeded',
          resource: functionName,
          severity: 'medium',
          details: { rateLimitKey, timestamp: Date.now() }
        });
        
        return {
          data: null,
          error: 'Muitas requisições. Aguarde alguns momentos.'
        };
      }
      
      // Validate request body if schema provided
      if (schema && body) {
        const validation = validateSafely(schema, body, `api_${functionName}`);
        if (!validation.success) {
          return {
            data: null,
            error: validation.error
          };
        }
      }
      
      // Log API call
      await errorHandler.logSecurityEvent({
        action: 'api_call_initiated',
        resource: functionName,
        severity: 'low',
        details: { 
          hasBody: !!body,
          bodyKeys: body ? Object.keys(body) : [],
          timestamp: Date.now()
        }
      });
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Make the function call
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
          ...headers
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        await errorHandler.logSecurityEvent({
          action: 'api_call_failed',
          resource: functionName,
          severity: 'medium',
          details: { 
            error: error.message,
            timestamp: Date.now()
          }
        });
        
        return {
          data: null,
          error: errorHandler.handleUserError(error, `api_${functionName}`)
        };
      }
      
      // Log successful call
      await errorHandler.logSecurityEvent({
        action: 'api_call_success',
        resource: functionName,
        severity: 'low',
        details: { 
          hasData: !!data,
          timestamp: Date.now()
        }
      });
      
      return { data, error: null };
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        await errorHandler.logSecurityEvent({
          action: 'api_call_timeout',
          resource: functionName,
          severity: 'medium',
          details: { timeout, timestamp: Date.now() }
        });
        
        return {
          data: null,
          error: 'Timeout na requisição. Tente novamente.'
        };
      }
      
      await errorHandler.logSecurityEvent({
        action: 'api_call_exception',
        resource: functionName,
        severity: 'high',
        details: { 
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: Date.now()
        }
      });
      
      return {
        data: null,
        error: errorHandler.handleUserError(err, `api_${functionName}`)
      };
    }
  }
  
  // Chat message with validation
  async sendChatMessage(message: string, conversationId?: string) {
    const schema = z.object({
      user_message: z.string().min(1).max(10000),
      conversation_id: z.string().uuid().optional(),
      user_id: z.string().uuid()
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado'
      };
    }
    
    return this.invokeFunction('process-chat-message', {
      body: {
        user_message: message,
        conversation_id: conversationId,
        user_id: user.id
      },
      schema,
      rateLimitKey: 'chat_message'
    });
  }
}

export const secureApi = SecureApi.getInstance();
