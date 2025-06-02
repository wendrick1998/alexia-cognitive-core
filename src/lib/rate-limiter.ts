
/**
 * @description Client-side rate limiter for security and performance
 * @created_by Security Audit - Alex iA
 */

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  isAllowed(options: RateLimitOptions): boolean {
    const { maxRequests, windowMs, identifier } = options;
    const now = Date.now();
    const resetTime = now + windowMs;

    const existing = this.limits.get(identifier);

    if (!existing || existing.resetTime <= now) {
      // First request or window expired
      this.limits.set(identifier, {
        count: 1,
        resetTime
      });
      return true;
    }

    if (existing.count >= maxRequests) {
      return false;
    }

    // Increment count
    existing.count++;
    return true;
  }

  getRemainingRequests(identifier: string, maxRequests: number): number {
    const existing = this.limits.get(identifier);
    if (!existing || existing.resetTime <= Date.now()) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - existing.count);
  }

  getResetTime(identifier: string): number | null {
    const existing = this.limits.get(identifier);
    if (!existing || existing.resetTime <= Date.now()) {
      return null;
    }
    return existing.resetTime;
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetTime <= now) {
        this.limits.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

export const rateLimiter = new RateLimiter();
