
import React from 'react';
import { render, screen } from '@/utils/testUtils';
import ChatMessages from '@/components/chat/ChatMessages';
import { createMockMessage } from '@/tests/factories/testDataFactory';

describe('ChatMessages', () => {
  const mockMessages = [
    createMockMessage({ role: 'user', content: 'Hello' }),
    createMockMessage({ role: 'assistant', content: 'Hi there!' })
  ];

  it('should render messages correctly', () => {
    render(
      <ChatMessages 
        messages={mockMessages} 
        loading={false} 
        processing={false} 
      />
    );
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('should show loading indicator when loading', () => {
    render(
      <ChatMessages 
        messages={[]} 
        loading={true} 
        processing={false} 
      />
    );
    
    expect(screen.getByText('Carregando conversa...')).toBeInTheDocument();
  });

  it('should show processing indicator when processing', () => {
    render(
      <ChatMessages 
        messages={mockMessages} 
        loading={false} 
        processing={true} 
      />
    );
    
    expect(screen.getByText(/processando sua pergunta/i)).toBeInTheDocument();
  });
});
