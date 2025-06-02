
import React from 'react';
import { render, screen } from '../../../utils/testUtils';
import Dashboard from '../Dashboard';

// Mock the dashboard stats hook
jest.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: jest.fn(() => ({
    stats: {
      totalConversations: 42,
      totalMemories: 156,
      totalDocuments: 23,
      weeklyActivity: 85,
    },
    isLoading: false,
    error: null,
  })),
}));

// Mock other dashboard components
jest.mock('../ConversationCard', () => {
  return function MockConversationCard() {
    return <div data-testid="conversation-card">Conversation Card</div>;
  };
});

jest.mock('../MemoryCard', () => {
  return function MockMemoryCard() {
    return <div data-testid="memory-card">Memory Card</div>;
  };
});

jest.mock('../AIUsageCard', () => {
  return function MockAIUsageCard() {
    return <div data-testid="ai-usage-card">AI Usage Card</div>;
  };
});

describe('Dashboard', () => {
  it('renders dashboard components', () => {
    render(<Dashboard />);

    expect(screen.getByTestId('conversation-card')).toBeInTheDocument();
    expect(screen.getByTestId('memory-card')).toBeInTheDocument();
    expect(screen.getByTestId('ai-usage-card')).toBeInTheDocument();
  });

  it('displays welcome message', () => {
    render(<Dashboard />);

    // Look for dashboard-specific content
    expect(screen.getByText(/conversation card/i)).toBeInTheDocument();
    expect(screen.getByText(/memory card/i)).toBeInTheDocument();
    expect(screen.getByText(/ai usage card/i)).toBeInTheDocument();
  });
});
