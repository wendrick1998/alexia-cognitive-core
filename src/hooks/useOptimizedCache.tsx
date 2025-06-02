
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl?: number;
  size: number;
  priority: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  compressionThreshold: number;
  preloadStrategies: string[];
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO';
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionCount: number;
  totalSize: number;
  entryCount: number;
  averageAccessTime: number;
}

export function useOptimizedCache() {
  const { user } = useAuth();
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [metrics, setMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    totalSize: 0,
    entryCount: 0,
    averageAccessTime: 0
  });

  const config = useRef<CacheConfig>({
    maxSize: 50 * 1024 * 1024, // 50MB
    defaultTTL: 300000, // 5 minutes
    compressionThreshold: 1024, // 1KB
    preloadStrategies: ['user_behavior', 'temporal_patterns'],
    evictionPolicy: 'LRU'
  });

  const accessTimes = useRef<number[]>([]);

  // Calculate entry size (simplified)
  const calculateSize = useCallback((data: any): number => {
    return JSON.stringify(data).length * 2; // Rough estimate
  }, []);

  // Compress data if needed
  const compressData = useCallback((data: any): any => {
    const size = calculateSize(data);
    if (size > config.current.compressionThreshold) {
      // Simple compression simulation - in real app use actual compression
      return {
        compressed: true,
        data: data,
        originalSize: size
      };
    }
    return data;
  }, [calculateSize]);

  // Decompress data
  const decompressData = useCallback((entry: CacheEntry): any => {
    if (entry.data?.compressed) {
      return entry.data.data;
    }
    return entry.data;
  }, []);

  // Eviction strategies
  const evictEntries = useCallback(() => {
    const entries = Array.from(cache.entries());
    let evicted = 0;

    switch (config.current.evictionPolicy) {
      case 'LRU':
        entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
        break;
      case 'LFU':
        entries.sort(([, a], [, b]) => a.accessCount - b.accessCount);
        break;
      case 'FIFO':
        entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
        break;
    }

    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    
    setCache(prev => {
      const newCache = new Map(prev);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        newCache.delete(entries[i][0]);
        evicted++;
      }
      return newCache;
    });

    setMetrics(prev => ({
      ...prev,
      evictionCount: prev.evictionCount + evicted
    }));

    return evicted;
  }, [cache]);

  // Set cache entry
  const set = useCallback((key: string, data: any, options?: { ttl?: number; priority?: number }) => {
    const startTime = Date.now();
    
    const compressedData = compressData(data);
    const size = calculateSize(compressedData);
    
    // Check if we need to evict
    const currentSize = Array.from(cache.values()).reduce((acc, entry) => acc + entry.size, 0);
    if (currentSize + size > config.current.maxSize) {
      evictEntries();
    }

    const entry: CacheEntry = {
      key,
      data: compressedData,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      ttl: options?.ttl || config.current.defaultTTL,
      size,
      priority: options?.priority || 1
    };

    setCache(prev => new Map(prev).set(key, entry));
    
    const accessTime = Date.now() - startTime;
    accessTimes.current.push(accessTime);
    if (accessTimes.current.length > 100) {
      accessTimes.current = accessTimes.current.slice(-100);
    }

    console.log(`📦 Cache SET: ${key} (${size} bytes)`);
  }, [cache, compressData, calculateSize, evictEntries]);

  // Get cache entry
  const get = useCallback((key: string): any => {
    const startTime = Date.now();
    const entry = cache.get(key);
    
    if (!entry) {
      setMetrics(prev => ({
        ...prev,
        missRate: prev.missRate + 1
      }));
      console.log(`📦 Cache MISS: ${key}`);
      return null;
    }

    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      console.log(`📦 Cache EXPIRED: ${key}`);
      return null;
    }

    // Update access stats
    setCache(prev => {
      const newCache = new Map(prev);
      const updatedEntry = {
        ...entry,
        accessCount: entry.accessCount + 1,
        lastAccessed: Date.now()
      };
      newCache.set(key, updatedEntry);
      return newCache;
    });

    setMetrics(prev => ({
      ...prev,
      hitRate: prev.hitRate + 1
    }));

    const accessTime = Date.now() - startTime;
    accessTimes.current.push(accessTime);
    if (accessTimes.current.length > 100) {
      accessTimes.current = accessTimes.current.slice(-100);
    }

    console.log(`📦 Cache HIT: ${key}`);
    return decompressData(entry);
  }, [cache, decompressData]);

  // Remove cache entry
  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
    console.log(`📦 Cache REMOVE: ${key}`);
  }, []);

  // Clear cache
  const clear = useCallback(() => {
    setCache(new Map());
    console.log('📦 Cache CLEARED');
  }, []);

  // Preload strategy
  const preload = useCallback(async (keys: string[], dataFetcher: (key: string) => Promise<any>) => {
    console.log(`📦 Cache PRELOAD: ${keys.length} keys`);
    
    const promises = keys.map(async (key) => {
      if (!cache.has(key)) {
        try {
          const data = await dataFetcher(key);
          set(key, data, { priority: 2 }); // Higher priority for preloaded data
        } catch (error) {
          console.error(`Failed to preload ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }, [cache, set]);

  // Update metrics
  useEffect(() => {
    const totalOperations = metrics.hitRate + metrics.missRate;
    const avgAccessTime = accessTimes.current.length > 0 
      ? accessTimes.current.reduce((a, b) => a + b, 0) / accessTimes.current.length 
      : 0;

    setMetrics(prev => ({
      ...prev,
      totalSize: Array.from(cache.values()).reduce((acc, entry) => acc + entry.size, 0),
      entryCount: cache.size,
      averageAccessTime: avgAccessTime,
      hitRate: totalOperations > 0 ? prev.hitRate / totalOperations : 0,
      missRate: totalOperations > 0 ? prev.missRate / totalOperations : 0
    }));
  }, [cache, metrics.hitRate, metrics.missRate]);

  // Cleanup expired entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setCache(prev => {
        const newCache = new Map();
        for (const [key, entry] of prev.entries()) {
          if (!entry.ttl || now - entry.timestamp < entry.ttl) {
            newCache.set(key, entry);
          }
        }
        return newCache;
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    set,
    get,
    remove,
    clear,
    preload,
    metrics,
    config: config.current,
    size: cache.size
  };
}
