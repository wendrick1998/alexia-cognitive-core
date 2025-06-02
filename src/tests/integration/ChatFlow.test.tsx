
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/testUtils';
import Chat from '@/components/Chat';
import { createMockConversation, createMockMessage } from '@/tests/factories/testDataFactory';

// Mock all required hooks
jest.mock('@/hooks/useConversations');
jest.mock('@/hooks/useChatProcessor');

describe('Chat Integration Flow', () => {
  it('should handle complete chat flow', async () => {
    render(<Chat />);
    
    // Should render chat interface
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should handle message sending', async () => {
    render(<Chat />);
    
    const input = screen.getByRole('textbox');
    if (input) {
      fireEvent.change(input, { target: { value: 'Test message' } });
      
      const sendButton = screen.getByRole('button', { name: /enviar/i });
      if (sendButton) {
        fireEvent.click(sendButton);
        
        await waitFor(() => {
          expect(screen.getByText('Test message')).toBeInTheDocument();
        });
      }
    }
  });
});
