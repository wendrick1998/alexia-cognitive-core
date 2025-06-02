
// Simple rate limiter implementation
interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

export const rateLimiter = {
  isAllowed: (options: RateLimitOptions): boolean => {
    // Simple implementation - in production this would use a more sophisticated system
    const key = `rate_limit_${options.identifier}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, windowStart: now }));
      return true;
    }
    
    try {
      const data = JSON.parse(stored);
      const timeElapsed = now - data.windowStart;
      
      if (timeElapsed > options.windowMs) {
        // Reset window
        localStorage.setItem(key, JSON.stringify({ count: 1, windowStart: now }));
        return true;
      }
      
      if (data.count >= options.maxRequests) {
        return false;
      }
      
      // Increment count
      data.count++;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      // If parsing fails, allow the request
      localStorage.setItem(key, JSON.stringify({ count: 1, windowStart: now }));
      return true;
    }
  }
};
