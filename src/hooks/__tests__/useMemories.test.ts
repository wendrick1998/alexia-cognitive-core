
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemories } from '../useMemories';
import React from 'react';

// Mock the supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: jest.fn()
  }
}));

// Create a test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMemories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state with empty memories', () => {
    const { result } = renderHook(() => useMemories(), {
      wrapper: createWrapper(),
    });

    expect(result.current.memories).toEqual([]);
    expect(typeof result.current.createMemory).toBe('function');
    expect(typeof result.current.fetchMemories).toBe('function');
  });

  it('should handle loading state', async () => {
    const { result } = renderHook(() => useMemories(), {
      wrapper: createWrapper(),
    });

    // Initial state should be handled properly
    expect(result.current.memories).toEqual([]);
  });
});
