
/**
 * @description Client-side rate limiting utility
 * @created_by Security Audit - Alex iA
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private storage: Map<string, RateLimitRecord> = new Map();
  
  private constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }
  
  public isAllowed(config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = `${config.identifier}_${Math.floor(now / config.windowMs)}`;
    
    const record = this.storage.get(key);
    
    if (!record) {
      // First request in this window
      this.storage.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }
    
    if (record.count >= config.maxRequests) {
      console.warn(`🚫 Rate limit exceeded for ${config.identifier}:`, {
        current: record.count,
        max: config.maxRequests,
        resetIn: Math.ceil((record.resetTime - now) / 1000)
      });
      return false;
    }
    
    // Increment counter
    record.count++;
    return true;
  }
  
  public getRemainingRequests(config: RateLimitConfig): number {
    const now = Date.now();
    const key = `${config.identifier}_${Math.floor(now / config.windowMs)}`;
    const record = this.storage.get(key);
    
    if (!record) {
      return config.maxRequests;
    }
    
    return Math.max(0, config.maxRequests - record.count);
  }
  
  public getResetTime(config: RateLimitConfig): number {
    const now = Date.now();
    const key = `${config.identifier}_${Math.floor(now / config.windowMs)}`;
    const record = this.storage.get(key);
    
    if (!record) {
      return now + config.windowMs;
    }
    
    return record.resetTime;
  }
  
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.storage.entries()) {
      if (now > record.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();
