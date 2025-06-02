
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
    expect(typeof result.current.trackAPICall).toBe('function');
    expect(typeof result.current.updateMetric).toBe('function');
  });

  it('should track API calls correctly', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      result.current.trackAPICall(1000, 1500, true);
    });

    // Verify the API call was tracked
    expect(result.current.metrics.loadTime).toBeGreaterThan(0);
  });

  it('should update metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    act(() => {
      result.current.updateMetric('renderTime', 100);
    });

    expect(result.current.metrics.renderTime).toBe(100);
  });

  it('should calculate performance score', () => {
    const { result } = renderHook(() => usePerformanceMonitoring());
    
    const score = result.current.getPerformanceScore();
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
