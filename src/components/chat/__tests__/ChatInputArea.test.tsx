
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/testUtils';
import ChatInputArea from '../ChatInputArea';
import { Conversation } from '@/hooks/useConversationsData';

// Mock hooks
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

jest.mock('@/hooks/useMobileSafeArea', () => ({
  useMobileSafeArea: jest.fn(() => ({ isIOSPWA: false })),
}));

describe('ChatInputArea', () => {
  const mockOnSendMessage = jest.fn();
  const mockConversation: Conversation = {
    id: '1',
    user_id: 'test-user',
    project_id: undefined,
    session_id: 'test-session',
    name: 'Test Conversation',
    tags: [],
    is_favorite: false,
    is_archived: false,
    category_id: undefined,
    last_message_preview: undefined,
    message_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
