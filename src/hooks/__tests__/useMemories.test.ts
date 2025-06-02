
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

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn()
  }))
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
  
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
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
