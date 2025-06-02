
import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
  priority: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
  enableCompression: boolean;
  enablePersistence: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  entries: number;
  hitRate: number;
  memoryUsage: number;
}

export function useOptimizedCache<T = any>(config: Partial<CacheConfig> = {}) {
  const defaultConfig: CacheConfig = {
    maxSize: 100,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    enableCompression: true,
    enablePersistence: true,
    ...config
  };

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hits: 0,
    misses: 0,
    entries: 0,
    hitRate: 0,
    memoryUsage: 0
  });

  // Load cache from localStorage on mount
  useEffect(() => {
    if (!defaultConfig.enablePersistence) return;

    try {
      const savedCache = localStorage.getItem('alexia-cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        Object.entries(parsedCache).forEach(([key, entry]) => {
          const cacheEntry = entry as CacheEntry<T>;
          if (cacheEntry.expiresAt > Date.now()) {
            cache.current.set(key, cacheEntry);
          }
        });
        updateMetrics();
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }, []);

  // Save cache to localStorage periodically
  useEffect(() => {
    if (!defaultConfig.enablePersistence) return;

    const interval = setInterval(() => {
      try {
        const cacheObject = Object.fromEntries(cache.current.entries());
        localStorage.setItem('alexia-cache', JSON.stringify(cacheObject));
      } catch (error) {
        console.warn('Failed to save cache to localStorage:', error);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Clean expired entries periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanup();
    }, 60000); // Cleanup every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  const updateMetrics = useCallback(() => {
    const entries = cache.current.size;
    const memoryUsage = JSON.stringify(Object.fromEntries(cache.current.entries())).length;
    
    setMetrics(prev => ({
      ...prev,
      entries,
      memoryUsage,
      hitRate: prev.hits + prev.misses > 0 ? (prev.hits / (prev.hits + prev.misses)) * 100 : 0
    }));
  }, []);

  const cleanup = useCallback(() => {
    const now = Date.now();
    let removed = 0;

    // Remove expired entries
    for (const [key, entry] of cache.current.entries()) {
      if (entry.expiresAt <= now) {
        cache.current.delete(key);
        removed++;
      }
    }

    // If still over capacity, remove least recently used entries
    if (cache.current.size > defaultConfig.maxSize) {
      const sortedEntries = Array.from(cache.current.entries())
        .sort(([, a], [, b]) => {
          // Sort by priority first, then by hits, then by timestamp
          if (a.priority !== b.priority) return b.priority - a.priority;
          if (a.hits !== b.hits) return a.hits - b.hits;
          return a.timestamp - b.timestamp;
        });

      const toRemove = sortedEntries.slice(defaultConfig.maxSize);
      toRemove.forEach(([key]) => {
        cache.current.delete(key);
        removed++;
      });
    }

    if (removed > 0) {
      console.log(`🧹 Cache cleanup: removed ${removed} entries`);
      updateMetrics();
    }
  }, [defaultConfig.maxSize, updateMetrics]);

  const set = useCallback((
    key: string, 
    data: T, 
    ttl: number = defaultConfig.defaultTTL,
    priority: number = 1
  ) => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      hits: 0,
      priority
    };

    cache.current.set(key, entry);
    
    // Trigger cleanup if over capacity
    if (cache.current.size > defaultConfig.maxSize) {
      cleanup();
    }

    updateMetrics();
    console.log(`💾 Cache SET: ${key}`);
  }, [defaultConfig.defaultTTL, defaultConfig.maxSize, cleanup, updateMetrics]);

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) {
      setMetrics(prev => ({ ...prev, misses: prev.misses + 1 }));
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    }

    const now = Date.now();
    if (entry.expiresAt <= now) {
      cache.current.delete(key);
      setMetrics(prev => ({ ...prev, misses: prev.misses + 1 }));
      console.log(`⏰ Cache EXPIRED: ${key}`);
      return null;
    }

    // Update hit count and timestamp
    entry.hits++;
    entry.timestamp = now;
    
    setMetrics(prev => ({ ...prev, hits: prev.hits + 1 }));
    console.log(`✅ Cache HIT: ${key} (hits: ${entry.hits})`);
    
    return entry.data;
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key);
    return entry ? entry.expiresAt > Date.now() : false;
  }, []);

  const remove = useCallback((key: string): boolean => {
    const deleted = cache.current.delete(key);
    if (deleted) {
      updateMetrics();
      console.log(`🗑️ Cache DELETE: ${key}`);
    }
    return deleted;
  }, [updateMetrics]);

  const clear = useCallback(() => {
    cache.current.clear();
    setMetrics({
      hits: 0,
      misses: 0,
      entries: 0,
      hitRate: 0,
      memoryUsage: 0
    });
    console.log('🧹 Cache CLEARED');
  }, []);

  const getOrSet = useCallback(async <K>(
    key: string,
    fetcher: () => Promise<K>,
    ttl?: number,
    priority?: number
  ): Promise<K> => {
    const cached = get(key) as K;
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    set(key, data as any, ttl, priority);
    return data;
  }, [get, set]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    getOrSet,
    cleanup,
    metrics,
    size: cache.current.size
  };
}
