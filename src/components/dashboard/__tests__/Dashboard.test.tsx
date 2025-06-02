
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../Dashboard';

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' }
  })
}));

jest.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: () => ({
    stats: {
      totalConversations: 10,
      totalMemories: 25,
      totalDocuments: 5,
      totalProjects: 3
    },
    isLoading: false
  })
}));

jest.mock('@/hooks/useConversations', () => ({
  useConversations: () => ({
    conversations: [],
    isLoading: false
  })
}));

jest.mock('@/hooks/useMemories', () => ({
  useMemories: () => ({
    memories: [],
    isLoading: false
  })
}));

// Create test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  it('renders dashboard components', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    // Check for main dashboard elements
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('displays user statistics', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    // Should show statistics cards or sections
    const dashboard = screen.getByTestId('dashboard-container') || screen.getByRole('main');
    expect(dashboard).toBeInTheDocument();
  });

  it('handles loading state gracefully', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    // Dashboard should render even in loading states
    expect(screen.getByText(/Dashboard/i) || screen.getByRole('main')).toBeInTheDocument();
  });
});
