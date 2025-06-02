
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInputArea from '../ChatInputArea';

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user' }
  })
}));

describe('ChatInputArea', () => {
  const mockOnSendMessage = jest.fn();
  const mockConversation = {
    id: 'test-conversation',
    session_id: 'test-session',
    name: 'Test Conversation',
    user_id: 'test-user',
    project_id: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    is_favorite: false,
    is_archived: false,
    category_id: null,
    message_count: 0,
    tags: [],
    last_message_preview: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders textarea and send button', () => {
    render(
      <ChatInputArea
        processing={false}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('disables input when processing', () => {
    render(
      <ChatInputArea
        processing={true}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');
    
    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('calls onSendMessage when form is submitted', async () => {
    render(
      <ChatInputArea
        processing={false}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    const textarea = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
    });
  });

  it('clears input after sending message', async () => {
    render(
      <ChatInputArea
        processing={false}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const button = screen.getByRole('button');

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    expect(textarea.value).toBe('Test message');

    fireEvent.click(button);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('prevents sending empty messages', () => {
    render(
      <ChatInputArea
        processing={false}
        onSendMessage={mockOnSendMessage}
        currentConversation={mockConversation}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
});
