
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitoring } from '../usePerformanceMonitoring';

// Mock performance APIs
const mockPerformanceNow = jest.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => [])
  },
  writable: true
});

describe('usePerformanceMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(1000);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    expect(result.current.metrics).toEqual({
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: 0
    });
    expect(typeof result.current.startMeasurement).toBe('function');
    expect(typeof result.current.endMeasurement).toBe('function');
  });

  it('should measure performance correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      const measurementId = result.current.startMeasurement('test-operation');
      expect(typeof measurementId).toBe('string');
    });

    mockPerformanceNow.mockReturnValue(1500);

    act(() => {
      result.current.endMeasurement('test-measurement-id', 500);
    });

    // Verify the measurement was recorded
    expect(result.current.metrics.renderTime).toBeGreaterThan(0);
  });

  it('should handle memory usage measurement', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    // Mock memory API
    Object.defineProperty(window.performance, 'memory', {
      value: { usedJSHeapSize: 1000000 },
      configurable: true
    });

    act(() => {
      result.current.endMeasurement('memory-test', 100);
    });

    expect(result.current.metrics.memoryUsage).toBeGreaterThan(0);
  });
});
