
import { useState, useCallback, useEffect, useRef } from 'react';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  expiresAt?: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalSize: number;
  entryCount: number;
  averageAccessTime: number;
}

export function useOptimizedCache(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
  const cache = useRef<Map<string, CacheEntry>>(new Map());
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    totalSize: 0,
    entryCount: 0,
    averageAccessTime: 0
  });

  const accessTimes = useRef<number[]>([]);
  const hitCount = useRef(0);
  const missCount = useRef(0);

  // Cleanup expired entries
  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, entry] of cache.current) {
      if (entry.expiresAt && entry.expiresAt < now) {
        expired.push(key);
      }
    }

    expired.forEach(key => cache.current.delete(key));
    
    if (expired.length > 0) {
      console.log(`🧹 Cache cleanup: ${expired.length} entries expired`);
    }
  }, []);

  // LRU eviction when cache is full
  const evictLRU = useCallback(() => {
    if (cache.current.size < maxSize) return;

    let oldestKey = '';
    let oldestAccess = Date.now();

    for (const [key, entry] of cache.current) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.current.delete(oldestKey);
      console.log(`📤 Cache eviction: ${oldestKey}`);
    }
  }, [maxSize]);

  // Get item from cache
  const get = useCallback(<T,>(key: string): T | null => {
    const startTime = performance.now();
    
    cleanupExpired();
    
    const entry = cache.current.get(key);
    
    if (entry) {
      // Update access tracking
      entry.accessCount++;
      entry.lastAccess = Date.now();
      hitCount.current++;
      
      const accessTime = performance.now() - startTime;
      accessTimes.current.push(accessTime);
      
      console.log(`✅ Cache hit: ${key} (${accessTime.toFixed(2)}ms)`);
      return entry.data as T;
    } else {
      missCount.current++;
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }
  }, [cleanupExpired]);

  // Set item in cache
  const set = useCallback(<T,>(key: string, data: T, customTTL?: number): void => {
    cleanupExpired();
    evictLRU();

    const now = Date.now();
    const expiresAt = customTTL ? now + customTTL : now + ttl;

    cache.current.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccess: now,
      expiresAt
    });

    console.log(`💾 Cache set: ${key} (expires in ${((expiresAt - now) / 1000).toFixed(1)}s)`);
  }, [cleanupExpired, evictLRU, ttl]);

  // Remove item from cache
  const remove = useCallback((key: string): boolean => {
    const deleted = cache.current.delete(key);
    if (deleted) {
      console.log(`🗑️ Cache remove: ${key}`);
    }
    return deleted;
  }, []);

  // Clear entire cache
  const clear = useCallback((): void => {
    const size = cache.current.size;
    cache.current.clear();
    hitCount.current = 0;
    missCount.current = 0;
    accessTimes.current = [];
    console.log(`🧽 Cache cleared: ${size} entries removed`);
  }, []);

  // Check if key exists
  const has = useCallback((key: string): boolean => {
    cleanupExpired();
    return cache.current.has(key);
  }, [cleanupExpired]);

  // Get cache statistics
  const getStats = useCallback(() => {
    cleanupExpired();
    
    const totalRequests = hitCount.current + missCount.current;
    const hitRate = totalRequests > 0 ? (hitCount.current / totalRequests) : 0;
    const missRate = totalRequests > 0 ? (missCount.current / totalRequests) : 0;
    
    // Calculate total size (rough estimate)
    let totalSize = 0;
    for (const entry of cache.current.values()) {
      totalSize += JSON.stringify(entry.data).length;
    }

    // Calculate average access time
    const avgAccessTime = accessTimes.current.length > 0 
      ? accessTimes.current.reduce((a, b) => a + b, 0) / accessTimes.current.length
      : 0;

    return {
      hitRate,
      missRate,
      totalSize,
      entryCount: cache.current.size,
      averageAccessTime: avgAccessTime,
      totalRequests,
      hitCount: hitCount.current,
      missCount: missCount.current
    };
  }, [cleanupExpired]);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getStats]);

  // Cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(cleanupExpired, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, [cleanupExpired]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    getStats,
    metrics,
    size: cache.current.size
  };
}
