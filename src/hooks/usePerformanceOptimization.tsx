
import { useState, useCallback, useRef, useEffect } from 'react';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl: number;
  size: number;
}

export interface PerformanceMetrics {
  memoryUsage: number;
  cacheHitRate: number;
  avgResponseTime: number;
  activeConnections: number;
  resourceLoadTime: number;
  renderTime: number;
  jsHeapSize: number;
  memoryPressure: 'low' | 'medium' | 'high';
}

export interface OptimizationConfig {
  maxMemoryCache: number; // MB
  maxIndexedDBCache: number; // MB
  prefetchThreshold: number;
  virtualScrollThreshold: number;
  workerPoolSize: number;
  compressionLevel: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxMemory: number;

  constructor(maxSize: number = 1000, maxMemoryMB: number = 50) {
    this.maxSize = maxSize;
    this.maxMemory = maxMemoryMB * 1024 * 1024;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access info
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key: string, data: T, ttl: number = 300000): void {
    const size = this.estimateSize(data);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      ttl,
      size
    };

    // Remove old entry if exists
    this.cache.delete(key);

    // Check memory limits
    while (this.getCurrentMemoryUsage() + size > this.maxMemory && this.cache.size > 0) {
      this.evictLRU();
    }

    // Check size limits
    while (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  private evictLRU(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }

  private getCurrentMemoryUsage(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimate
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      memoryUsage: this.getCurrentMemoryUsage(),
      avgAccessCount: entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length || 0,
      oldestEntry: Math.min(...entries.map(e => e.timestamp))
    };
  }

  clear(): void {
    this.cache.clear();
  }
}

export function usePerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    cacheHitRate: 0,
    avgResponseTime: 0,
    activeConnections: 0,
    resourceLoadTime: 0,
    renderTime: 0,
    jsHeapSize: 0,
    memoryPressure: 'low'
  });

  const [config, setConfig] = useState<OptimizationConfig>({
    maxMemoryCache: 100, // 100MB
    maxIndexedDBCache: 500, // 500MB
    prefetchThreshold: 0.7,
    virtualScrollThreshold: 1000,
    workerPoolSize: navigator.hardwareConcurrency || 4,
    compressionLevel: 6
  });

  const memoryCache = useRef(new LRUCache(1000, config.maxMemoryCache));
  const workerPool = useRef<Worker[]>([]);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const prefetchQueue = useRef<Set<string>>(new Set());

  // Initialize IndexedDB cache
  const initIndexedDBCache = useCallback(async () => {
    try {
      const request = indexedDB.open('AlexIACache', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('accessed', 'lastAccessed');
        }
      };

      return new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error initializing IndexedDB cache:', error);
      return null;
    }
  }, []);

  // Get from IndexedDB cache
  const getFromIndexedDB = useCallback(async (key: string): Promise<any | null> => {
    try {
      const db = await initIndexedDBCache();
      if (!db) return null;

      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && Date.now() - result.timestamp < result.ttl) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('❌ Error reading from IndexedDB:', error);
      return null;
    }
  }, [initIndexedDBCache]);

  // Set to IndexedDB cache
  const setToIndexedDB = useCallback(async (
    key: string, 
    data: any, 
    ttl: number = 3600000
  ): Promise<void> => {
    try {
      const db = await initIndexedDBCache();
      if (!db) return;

      const entry = {
        key,
        data,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        ttl,
        size: JSON.stringify(data).length
      };

      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.put(entry);
    } catch (error) {
      console.error('❌ Error writing to IndexedDB:', error);
    }
  }, [initIndexedDBCache]);

  // Multi-level cache get
  const getCached = useCallback(async (key: string): Promise<any | null> => {
    // Level 1: Memory cache
    const memoryResult = memoryCache.current.get(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // Level 2: IndexedDB cache
    const indexedDBResult = await getFromIndexedDB(key);
    if (indexedDBResult !== null) {
      // Promote to memory cache
      memoryCache.current.set(key, indexedDBResult);
      return indexedDBResult;
    }

    return null;
  }, [getFromIndexedDB]);

  // Multi-level cache set
  const setCached = useCallback(async (
    key: string, 
    data: any, 
    memoryTTL: number = 300000,
    persistentTTL: number = 3600000
  ): Promise<void> => {
    // Set in memory cache
    memoryCache.current.set(key, data, memoryTTL);
    
    // Set in IndexedDB cache
    await setToIndexedDB(key, data, persistentTTL);
  }, [setToIndexedDB]);

  // Initialize Web Workers pool
  const initWorkerPool = useCallback(() => {
    const poolSize = config.workerPoolSize;
    workerPool.current = [];

    for (let i = 0; i < poolSize; i++) {
      try {
        const worker = new Worker(
          new URL('../workers/PerformanceWorker.worker.ts', import.meta.url),
          { type: 'module' }
        );
        workerPool.current.push(worker);
      } catch (error) {
        console.warn('⚠️ Could not create worker:', error);
      }
    }

    console.log(`🏭 Worker pool initialized with ${workerPool.current.length} workers`);
  }, [config.workerPoolSize]);

  // Get available worker
  const getAvailableWorker = useCallback((): Worker | null => {
    return workerPool.current.find(worker => true) || null; // Simplified for now
  }, []);

  // Process with worker
  const processWithWorker = useCallback(async (
    task: string,
    data: any
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const worker = getAvailableWorker();
      if (!worker) {
        reject(new Error('No workers available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 30000);

      worker.onmessage = (event) => {
        clearTimeout(timeout);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      worker.postMessage({ task, data });
    });
  }, [getAvailableWorker]);

  // Virtual scrolling implementation
  const useVirtualScrolling = useCallback((
    items: any[],
    itemHeight: number,
    containerHeight: number
  ) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
      visibleItems,
      totalHeight,
      offsetY,
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
      }
    };
  }, []);

  // Intersection Observer for lazy loading
  const observeElement = useCallback((
    element: Element,
    callback: () => void,
    threshold: number = 0.1
  ) => {
    if (!intersectionObserver.current) {
      intersectionObserver.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback();
              intersectionObserver.current?.unobserve(entry.target);
            }
          });
        },
        { threshold }
      );
    }

    intersectionObserver.current.observe(element);
  }, []);

  // Prefetch resources
  const prefetchResource = useCallback(async (url: string): Promise<void> => {
    if (prefetchQueue.current.has(url)) return;
    
    prefetchQueue.current.add(url);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      await setCached(`prefetch_${url}`, data, 600000, 3600000);
      console.log('🚀 Prefetched:', url);
    } catch (error) {
      console.warn('⚠️ Prefetch failed:', url, error);
    } finally {
      prefetchQueue.current.delete(url);
    }
  }, [setCached]);

  // Monitor performance metrics
  const updateMetrics = useCallback(() => {
    const now = performance.now();
    
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        jsHeapSize: memory.usedJSHeapSize,
        memoryPressure: memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8 ? 'high' :
                        memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.6 ? 'medium' : 'low'
      }));
    }

    // Cache stats
    const cacheStats = memoryCache.current.getStats();
    setMetrics(prev => ({
      ...prev,
      memoryUsage: cacheStats.memoryUsage / (1024 * 1024), // Convert to MB
      cacheHitRate: cacheStats.avgAccessCount > 1 ? 0.8 : 0.2 // Simplified
    }));
  }, []);

  // Cleanup resources
  const cleanup = useCallback(() => {
    // Cleanup workers
    workerPool.current.forEach(worker => worker.terminate());
    workerPool.current = [];

    // Cleanup observers
    if (performanceObserver.current) {
      performanceObserver.current.disconnect();
    }
    
    if (intersectionObserver.current) {
      intersectionObserver.current.disconnect();
    }

    // Clear caches
    memoryCache.current.clear();
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    initWorkerPool();

    // Performance Observer
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            setMetrics(prev => ({
              ...prev,
              resourceLoadTime: entry.duration
            }));
          }
        });
      });

      try {
        performanceObserver.current.observe({ entryTypes: ['navigation', 'resource'] });
      } catch (error) {
        console.warn('⚠️ Performance Observer not supported');
      }
    }

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, [initWorkerPool, updateMetrics, cleanup]);

  return {
    // Cache operations
    getCached,
    setCached,
    
    // Worker operations
    processWithWorker,
    
    // UI optimizations
    useVirtualScrolling,
    observeElement,
    prefetchResource,
    
    // Metrics and config
    metrics,
    config,
    setConfig,
    
    // Utilities
    cleanup
  };
}
