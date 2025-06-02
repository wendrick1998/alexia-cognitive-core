
/**
 * @description Secure API wrapper with enhanced validation and error handling
 * @created_by Security Audit - Alex iA
 */

import { errorHandler } from './error-handler';
import { rateLimiter } from './rate-limiter';
import { validateSafely } from './validation';
import { z } from 'zod';

export interface SecureApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  validateResponse?: z.ZodSchema;
}

export interface SecureApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  headers: Headers;
}

class SecureApiClient {
  private defaultTimeout = 30000; // 30 seconds
  private defaultRetries = 3;

  async request<T = any>(
    url: string, 
    options: SecureApiOptions = {}
  ): Promise<SecureApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      validateResponse
    } = options;

    // Rate limiting check
    const rateLimitCheck = rateLimiter.isAllowed({
      maxRequests: 100,
      windowMs: 60000, // 100 requests per minute
      identifier: `api_${url}`
    });

    if (!rateLimitCheck) {
      await errorHandler.logSecurityEvent({
        action: 'api_rate_limit_exceeded',
        resource: url,
        severity: 'medium',
        details: { url, method }
      });

      return {
        status: 429,
        headers: new Headers(),
        error: 'Rate limit exceeded. Try again later.'
      };
    }

    // URL validation
    const urlValidation = validateSafely(
      z.string().url().max(2048),
      url,
      'api_url'
    );

    if (!urlValidation.success) {
      return {
        status: 400,
        headers: new Headers(),
        error: urlValidation.error
      };
    }

    let lastError: string = '';
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const requestHeaders = {
          'Content-Type': 'application/json',
          'User-Agent': 'Alex-iA-SecureClient/1.0',
          ...headers
        };

        const response = await fetch(urlValidation.data, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        let responseData: any;
        
        try {
          const text = await response.text();
          responseData = text ? JSON.parse(text) : null;
        } catch (parseError) {
          // If JSON parsing fails, return the text as is
          responseData = await response.text();
        }

        // Validate response if schema provided
        if (validateResponse && responseData) {
          const validation = validateSafely(validateResponse, responseData, 'api_response');
          if (!validation.success) {
            await errorHandler.logSecurityEvent({
              action: 'api_response_validation_failed',
              resource: url,
              severity: 'medium',
              details: { validation_error: validation.error }
            });

            return {
              status: response.status,
              headers: response.headers,
              error: 'Invalid response format received'
            };
          }
          responseData = validation.data;
        }

        // Log successful API calls for monitoring
        if (response.ok) {
          console.log(`✅ API call successful: ${method} ${url}`);
        } else {
          await errorHandler.logSecurityEvent({
            action: 'api_call_failed',
            resource: url,
            severity: 'low',
            details: { 
              status: response.status,
              method,
              attempt: attempt + 1
            }
          });
        }

        return {
          data: responseData,
          status: response.status,
          headers: response.headers,
          error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
        };

      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = 'Request timeout';
        }

        if (attempt === retries) {
          await errorHandler.logSecurityEvent({
            action: 'api_call_max_retries_exceeded',
            resource: url,
            severity: 'high',
            details: { 
              error: lastError,
              attempts: retries + 1,
              method
            }
          });
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      status: 0,
      headers: new Headers(),
      error: `Request failed after ${retries + 1} attempts: ${lastError}`
    };
  }

  // Convenience methods
  async get<T = any>(url: string, options: Omit<SecureApiOptions, 'method'> = {}) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(url: string, body: any, options: Omit<SecureApiOptions, 'method' | 'body'> = {}) {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = any>(url: string, body: any, options: Omit<SecureApiOptions, 'method' | 'body'> = {}) {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(url: string, options: Omit<SecureApiOptions, 'method'> = {}) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const secureApi = new SecureApiClient();
