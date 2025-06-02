
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitoring } from '../usePerformanceMonitoring';

// Mock performance APIs
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => 123.456),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10, // 10MB
      totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    }
  }
});

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());

    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics.userSatisfaction).toBeGreaterThanOrEqual(0);
    expect(result.current.metrics.errorRate).toBeGreaterThanOrEqual(0);
    expect(result.current.alerts).toEqual([]);
  });

  it('should update metrics when updateMetric is called', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());

    act(() => {
      result.current.updateMetric('userSatisfaction', 95);
    });

    expect(result.current.metrics.userSatisfaction).toBe(95);
  });

  it('should track API calls', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());

    act(() => {
      result.current.trackAPICall('/api/test', 200, 150);
    });

    expect(result.current.metrics.apiResponseTime).toBeGreaterThan(0);
  });

  it('should calculate performance score', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());

    const score = result.current.getPerformanceScore();
    
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should handle performance data collection', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());

    // Test that performance monitoring doesn't crash
    expect(() => {
      result.current.updateMetric('cacheHitRate', 85.5);
      result.current.trackAPICall('/api/memories', 200, 250);
    }).not.toThrow();
  });
});
