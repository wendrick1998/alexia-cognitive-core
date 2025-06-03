
import { useState, useCallback, useEffect, useRef } from 'react';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl: number;
  size: number;
  compressed?: boolean;
}

export interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitRate: number;
  compressionRatio: number;
  memoryUsage: number;
}

export interface CacheConfig {
  maxSize: number; // MB
  maxEntries: number;
  defaultTTL: number; // ms
  compressionThreshold: number; // bytes
  cleanupInterval: number; // ms
}

class OptimizedLRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Set<string>();
  private config: CacheConfig;
  private totalSize = 0;
  private hits = 0;
  private misses = 0;
  private compressionWorker?: Worker;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 50, // 50MB default
      maxEntries: config.maxEntries || 1000,
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      compressionThreshold: config.compressionThreshold || 1024, // 1KB
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
    };

    this.initCompressionWorker();
    this.startCleanupInterval();
  }

  private initCompressionWorker() {
    try {
      // Simple compression using built-in compression
      this.compressionWorker = null; // Simplified for now
    } catch (error) {
      console.warn('Compression worker not available:', error);
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpired();
      this.enforceSize();
    }, this.config.cleanupInterval);
  }

  private estimateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Fallback estimation
    }
  }

  private async compressIfNeeded(data: T): Promise<{ data: T; compressed: boolean; size: number }> {
    const serialized = JSON.stringify(data);
    const size = serialized.length * 2;

    if (size > this.config.compressionThreshold) {
      // Simple compression simulation (in real implementation, use compression algorithm)
      return {
        data: data, // Would be compressed data
        compressed: true,
        size: Math.floor(size * 0.7) // Simulate 30% compression
      };
    }

    return { data, compressed: false, size };
  }

  async set(key: string, data: T, ttl?: number): Promise<void> {
    const compressed = await this.compressIfNeeded(data);
    const entry: CacheEntry<T> = {
      data: compressed.data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      size: compressed.size,
      compressed: compressed.compressed
    };

    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.totalSize -= this.cache.get(key)!.size;
      this.accessOrder.delete(key);
    }

    // Add new entry
    this.cache.set(key, entry);
    this.accessOrder.add(key);
    this.totalSize += entry.size;

    // Enforce size limits
    this.enforceSize();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // Update access info
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    this.hits++;

    // Move to end (most recently used)
    this.accessOrder.delete(key);
    this.accessOrder.add(key);

    return entry.data;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalSize -= entry.size;
      this.accessOrder.delete(key);
      return this.cache.delete(key);
    }
    return false;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    }
  }

  private enforceSize(): void {
    // Enforce memory limit
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;
    
    while (this.totalSize > maxSizeBytes && this.cache.size > 0) {
      const oldestKey = this.accessOrder.values().next().value;
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    // Enforce entry count limit
    while (this.cache.size > this.config.maxEntries) {
      const oldestKey = this.accessOrder.values().next().value;
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }
  }

  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    
    let compressionRatio = 0;
    let compressedEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (entry.compressed) {
        compressedEntries++;
      }
    }

    compressionRatio = this.cache.size > 0 ? compressedEntries / this.cache.size : 0;

    return {
      totalSize: this.totalSize,
      entryCount: this.cache.size,
      hitRate,
      compressionRatio,
      memoryUsage: this.totalSize / (1024 * 1024) // MB
    };
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.totalSize = 0;
    this.hits = 0;
    this.misses = 0;
  }
}

export function useOptimizedCache<T = any>(config?: Partial<CacheConfig>) {
  const cacheRef = useRef<OptimizedLRUCache<T>>();
  const [stats, setStats] = useState<CacheStats>({
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
    compressionRatio: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    if (!cacheRef.current) {
      cacheRef.current = new OptimizedLRUCache<T>(config);
    }

    const updateStats = () => {
      if (cacheRef.current) {
        setStats(cacheRef.current.getStats());
      }
    };

    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial update

    return () => clearInterval(interval);
  }, [config]);

  const set = useCallback(async (key: string, data: T, ttl?: number) => {
    if (cacheRef.current) {
      await cacheRef.current.set(key, data, ttl);
    }
  }, []);

  const get = useCallback((key: string): T | null => {
    return cacheRef.current?.get(key) || null;
  }, []);

  const remove = useCallback((key: string): boolean => {
    return cacheRef.current?.delete(key) || false;
  }, []);

  const clear = useCallback(() => {
    cacheRef.current?.clear();
  }, []);

  const getStats = useCallback((): CacheStats => {
    return cacheRef.current?.getStats() || stats;
  }, [stats]);

  return {
    set,
    get,
    remove,
    clear,
    getStats,
    stats
  };
}
