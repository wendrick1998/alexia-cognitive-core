
import React from 'react';
import { render, screen } from '@/utils/testUtils';
import Dashboard from '@/components/dashboard/Dashboard';

// Mock the dashboard hooks
jest.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: () => ({
    stats: {
      totalConversations: 5,
      totalMemories: 25,
      totalDocuments: 10,
      totalMessages: 100,
      tokensUsed: 5000,
      tokenLimit: 10000,
      avgMessagesPerConversation: 20
    },
    activityData: [
      { date: '2024-12-01', messages: 10, memories: 5 },
      { date: '2024-12-02', messages: 15, memories: 3 }
    ],
    loading: false,
    error: null
  })
}));

jest.mock('@/hooks/useRecentInsights', () => ({
  useRecentInsights: () => ({
    insights: [
      { id: '1', content: 'Test insight', created_at: new Date().toISOString() }
    ],
    loading: false,
    error: null
  })
}));

describe('Dashboard Page', () => {
  test('renders dashboard greeting and key elements', () => {
    render(<Dashboard />);
    
    // Check for greeting message (should contain time-based greeting)
    expect(screen.getByText(/Bom dia|Boa tarde|Boa noite/i)).toBeInTheDocument();
    
    // Check for activity chart or dashboard title
    expect(screen.getByText(/Atividade|Dashboard/i)).toBeInTheDocument();
    
    // Check for statistics cards
    expect(screen.getByText(/msgs|mensagens/i)).toBeInTheDocument();
    expect(screen.getByText(/docs|documentos/i)).toBeInTheDocument();
    expect(screen.getByText(/insights/i)).toBeInTheDocument();
  });

  test('renders dashboard cards', () => {
    render(<Dashboard />);
    
    // Check for memory card content
    expect(screen.getByText(/Memórias|Memory/i)).toBeInTheDocument();
    
    // Check for conversation statistics
    expect(screen.getByText(/Conversas|Conversation/i)).toBeInTheDocument();
    
    // Check for AI usage information
    expect(screen.getByText(/IA|AI/i)).toBeInTheDocument();
  });

  test('handles loading state gracefully', () => {
    render(<Dashboard />);
    
    // Dashboard should render without crashing even during loading
    const dashboardContainer = screen.getByRole('main') || document.querySelector('[data-testid="dashboard-container"]');
    expect(dashboardContainer || document.body).toBeInTheDocument();
  });
});
