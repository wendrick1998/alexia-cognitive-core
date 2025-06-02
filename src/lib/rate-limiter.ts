
/**
 * @description Client-side rate limiting and request throttling
 * @created_by Security Audit - Alex iA
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RequestLog {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RequestLog> = new Map();
  
  // Check if request should be allowed
  isAllowed(config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = config.identifier;
    const existing = this.requests.get(key);
    
    // Clean up old entries
    this.cleanup(now, config.windowMs);
    
    if (!existing) {
      this.requests.set(key, { timestamp: now, count: 1 });
      return true;
    }
    
    // Check if window has passed
    if (now - existing.timestamp > config.windowMs) {
      this.requests.set(key, { timestamp: now, count: 1 });
      return true;
    }
    
    // Increment count
    existing.count++;
    
    return existing.count <= config.maxRequests;
  }
  
  // Get remaining requests
  getRemaining(config: RateLimitConfig): number {
    const key = config.identifier;
    const existing = this.requests.get(key);
    
    if (!existing) return config.maxRequests;
    
    const now = Date.now();
    if (now - existing.timestamp > config.windowMs) {
      return config.maxRequests;
    }
    
    return Math.max(0, config.maxRequests - existing.count);
  }
  
  // Clean up old entries
  private cleanup(now: number, windowMs: number): void {
    for (const [key, log] of this.requests.entries()) {
      if (now - log.timestamp > windowMs) {
        this.requests.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Predefined rate limit configs
export const RATE_LIMITS = {
  CHAT_MESSAGE: { maxRequests: 30, windowMs: 60000, identifier: 'chat' }, // 30/min
  DOCUMENT_UPLOAD: { maxRequests: 5, windowMs: 300000, identifier: 'upload' }, // 5/5min
  MEMORY_CREATE: { maxRequests: 20, windowMs: 60000, identifier: 'memory' }, // 20/min
  SEARCH: { maxRequests: 100, windowMs: 60000, identifier: 'search' } // 100/min
};
