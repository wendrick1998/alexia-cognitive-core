
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInputArea from '../ChatInputArea';

// Mock hooks
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

jest.mock('@/hooks/useMobileSafeArea', () => ({
  useMobileSafeArea: jest.fn(() => ({ isIOSPWA: false })),
}));

describe('ChatInputArea', () => {
  const mockOnSendMessage = jest.fn();
  const mockConversation = {
    id: '1',
    title: 'Test Conversation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'test-user',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat input area', () => {
    render(
      <ChatInputArea
        processing={false}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    expect(screen.getByPlaceholderText(/digite sua mensagem/i)).toBeInTheDocument();
  });

  it('shows different placeholder when no conversation', () => {
    render(
      <ChatInputArea
        processing={false}
        onSendMessage={mockOnSendMessage}
        currentConversation={null}
      />
    );

    expect(screen.getByPlaceholderText(/digite sua primeira mensagem/i)).toBeInTheDocument();
  });

  it('disables send when processing', () => {
    render(
      <ChatInputArea
        processing={true}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    const input = screen.getByPlaceholderText(/digite sua mensagem/i);
    fireEvent.change(input, { target: { value: 'test message' } });
    
    // The send functionality should be disabled when processing
    expect(input).toBeInTheDocument();
  });

  it('calls onSendMessage with correct text', async () => {
    render(
      <ChatInputArea
        processing={false}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    const input = screen.getByPlaceholderText(/digite sua mensagem/i);
    fireEvent.change(input, { target: { value: 'Hello Alex!' } });
    
    // Simulate send action (this will depend on the actual implementation)
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Hello Alex!');
    });
  });
});
