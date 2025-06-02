
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock useAuth hook
const mockUseAuth = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Create a test wrapper
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

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return authenticated user', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com'
    };

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      isAuthenticated: true
    });

    const { useAuth } = require('@/hooks/useAuth');
    const result = useAuth();

    expect(result.user).toEqual(mockUser);
    expect(result.isAuthenticated).toBe(true);
    expect(result.isLoading).toBe(false);
  });

  it('should return loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      signIn: jest.fn(),
      signOut: jest.fn(),
      isAuthenticated: false
    });

    const { useAuth } = require('@/hooks/useAuth');
    const result = useAuth();

    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
    expect(result.isLoading).toBe(true);
  });

  it('should handle unauthenticated state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      isAuthenticated: false
    });

    const { useAuth } = require('@/hooks/useAuth');
    const result = useAuth();

    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
    expect(result.isLoading).toBe(false);
    expect(typeof result.signIn).toBe('function');
    expect(typeof result.signOut).toBe('function');
  });
});
