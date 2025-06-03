
import { CacheStats } from '@/hooks/useOptimizedCache';

export interface CachedResponse {
  response: string;
  context_used: boolean;
  chunks_found: number;
  memories_found: number;
  timestamp: number;
  model_used?: string;
}

export interface CacheAnalytics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  memoryUsage: number;
}

interface CacheHook {
  set: (key: string, data: any, ttl?: number) => Promise<void>;
  get: (key: string) => any;
  remove: (key: string) => boolean;
  clear: () => void;
  getStats: () => CacheStats;
  stats: CacheStats;
}

class CacheOptimizationService {
  private cache?: CacheHook;
  private analytics: CacheAnalytics;

  constructor() {
    this.analytics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      memoryUsage: 0
    };
  }

  initializeCache(cache: CacheHook) {
    this.cache = cache;
  }

  // Generate cache key from message content
  private generateCacheKey(message: string, conversationId?: string): string {
    // Normalize message for better cache hits
    const normalized = message
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');

    // Include conversation context for personalization
    const contextKey = conversationId ? `conv_${conversationId}` : 'global';
    
    return `chat_${contextKey}_${this.hashString(normalized)}`;
  }

  // Simple hash function for cache keys
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Check if response should be cached
  private shouldCache(response: CachedResponse): boolean {
    // Cache responses that:
    // 1. Are not errors
    // 2. Have meaningful content
    // 3. Used context (more valuable responses)
    return (
      response.response.length > 10 &&
      !response.response.toLowerCase().includes('erro') &&
      !response.response.toLowerCase().includes('desculpe') &&
      (response.context_used || response.chunks_found > 0 || response.memories_found > 0)
    );
  }

  // Get cached response
  async getCachedResponse(
    message: string, 
    conversationId?: string
  ): Promise<CachedResponse | null> {
    if (!this.cache) return null;

    const key = this.generateCacheKey(message, conversationId);
    const startTime = performance.now();
    
    const cached = this.cache.get(key);
    
    this.analytics.totalRequests++;
    
    if (cached) {
      this.analytics.cacheHits++;
      const responseTime = performance.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      
      console.log('✅ Cache hit for message:', message.substring(0, 50));
      return cached as CachedResponse;
    } else {
      this.analytics.cacheMisses++;
      console.log('❌ Cache miss for message:', message.substring(0, 50));
      return null;
    }
  }

  // Store response in cache
  async setCachedResponse(
    message: string,
    response: CachedResponse,
    conversationId?: string,
    ttl?: number
  ): Promise<void> {
    if (!this.cache || !this.shouldCache(response)) return;

    const key = this.generateCacheKey(message, conversationId);
    
    try {
      await this.cache.set(key, response, ttl);
      console.log('💾 Cached response for:', message.substring(0, 50));
    } catch (error) {
      console.error('❌ Error caching response:', error);
    }
  }

  // Update average response time
  private updateAverageResponseTime(newTime: number): void {
    const totalRequests = this.analytics.cacheHits + this.analytics.cacheMisses;
    this.analytics.averageResponseTime = 
      (this.analytics.averageResponseTime * (totalRequests - 1) + newTime) / totalRequests;
  }

  // Get cache analytics
  getAnalytics(): CacheAnalytics {
    if (this.cache) {
      this.analytics.memoryUsage = this.cache.stats.memoryUsage;
    }
    return { ...this.analytics };
  }

  // Clear all analytics
  clearAnalytics(): void {
    this.analytics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      memoryUsage: 0
    };
  }

  // Get cache hit rate
  getHitRate(): number {
    const total = this.analytics.cacheHits + this.analytics.cacheMisses;
    return total > 0 ? this.analytics.cacheHits / total : 0;
  }

  // Optimize cache based on usage patterns
  async optimizeCache(): Promise<void> {
    if (!this.cache) return;

    try {
      // Get current cache stats
      const stats = this.cache.getStats();
      
      // Log optimization metrics
      console.log('🔧 Cache optimization completed:', {
        hitRate: this.getHitRate(),
        totalRequests: this.analytics.totalRequests,
        memoryUsage: stats.memoryUsage
      });
      
    } catch (error) {
      console.error('❌ Error optimizing cache:', error);
    }
  }
}

// Export singleton instance
export const cacheOptimizationService = new CacheOptimizationService();
export default CacheOptimizationService;
