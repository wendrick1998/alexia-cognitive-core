
import { useOptimizedCache } from '@/hooks/useOptimizedCache';

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

class CacheOptimizationService {
  private cache: ReturnType<typeof useOptimizedCache>;
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

  initializeCache(cache: ReturnType<typeof useOptimizedCache>) {
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
    
    const cached = this.cache.get<CachedResponse>(key);
    
    this.analytics.totalRequests++;
    
    if (cached) {
      this.analytics.cacheHits++;
      const responseTime = performance.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      
      console.log('✅ Cache hit for message:', message.substring(0, 50));
      return cached;
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
    
    // Add timestamp for analytics
    const enrichedResponse: CachedResponse = {
      ...response,
      timestamp: Date.now()
    };

    this.cache.set(key, enrichedResponse, ttl);
    
    console.log('💾 Response cached for message:', message.substring(0, 50));
  }

  // Get similar cached responses (fuzzy matching)
  async getSimilarResponses(
    message: string,
    similarityThreshold: number = 0.7
  ): Promise<CachedResponse[]> {
    if (!this.cache) return [];

    // This is a simplified similarity check
    // In a real implementation, you'd use embedding similarity
    const messageWords = message.toLowerCase().split(' ');
    const similar: CachedResponse[] = [];

    // This would be replaced with proper semantic search
    console.log('🔍 Searching for similar cached responses...');
    
    return similar;
  }

  // Update average response time
  private updateAverageResponseTime(newTime: number): void {
    const totalTime = this.analytics.averageResponseTime * this.analytics.totalRequests;
    this.analytics.averageResponseTime = (totalTime + newTime) / (this.analytics.totalRequests + 1);
  }

  // Get cache analytics
  getAnalytics(): CacheAnalytics & { cacheStats: any } {
    return {
      ...this.analytics,
      cacheStats: this.cache?.getStats() || null
    };
  }

  // Clear cache analytics
  resetAnalytics(): void {
    this.analytics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      memoryUsage: 0
    };
  }

  // Preload common responses
  async preloadCommonResponses(): Promise<void> {
    const commonQueries = [
      'Olá',
      'Como você pode me ajudar?',
      'Qual é a sua função?',
      'Explique isso',
      'Pode me dar um exemplo?'
    ];

    console.log('🔄 Preloading common responses...');
    
    // In a real implementation, these would be actual cached responses
    commonQueries.forEach(query => {
      const key = this.generateCacheKey(query);
      // Preload logic would go here
    });
  }

  // Cache maintenance
  async performMaintenance(): Promise<void> {
    if (!this.cache) return;

    console.log('🧹 Performing cache maintenance...');
    
    // Update memory usage
    const stats = this.cache.getStats();
    this.analytics.memoryUsage = stats.totalSize;
    
    // Additional maintenance tasks could include:
    // - Removing old entries
    // - Optimizing frequently accessed items
    // - Preloading predicted content
  }
}

// Singleton instance
export const cacheOptimizationService = new CacheOptimizationService();

export default CacheOptimizationService;
