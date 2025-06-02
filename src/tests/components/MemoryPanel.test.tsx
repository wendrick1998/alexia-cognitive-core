
import React from 'react';
import { render, screen, fireEvent } from '@/utils/testUtils';
import MemoryTestPanel from '@/components/MemoryTestPanel';
import { useMemoryActivation } from '@/hooks/useMemoryActivation';
import { useInteractionMemory } from '@/hooks/useInteractionMemory';

// Mock hooks
jest.mock('@/hooks/useMemoryActivation');
jest.mock('@/hooks/useInteractionMemory');

const mockUseMemoryActivation = useMemoryActivation as jest.MockedFunction<typeof useMemoryActivation>;
const mockUseInteractionMemory = useInteractionMemory as jest.MockedFunction<typeof useInteractionMemory>;

describe('MemoryTestPanel', () => {
  beforeEach(() => {
    mockUseMemoryActivation.mockReturnValue({
      stats: {
        totalMemories: 10,
        activeNodes: 5,
        consolidationSessions: 2,
        isConsolidating: false,
        lastConsolidation: new Date().toISOString()
      },
      runMemoryConsolidation: jest.fn(),
      saveInteractionAsMemory: jest.fn()
    });

    mockUseInteractionMemory.mockReturnValue({
      interceptChatMessage: jest.fn(),
      detectImportantPatterns: jest.fn().mockReturnValue(true),
      determineMemoryType: jest.fn().mockReturnValue('note')
    });
  });

  it('should render memory stats correctly', () => {
    render(<MemoryTestPanel />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Parado')).toBeInTheDocument();
  });

  it('should handle test message submission', async () => {
    const mockInterceptChatMessage = jest.fn();
    mockUseInteractionMemory.mockReturnValue({
      interceptChatMessage: mockInterceptChatMessage,
      detectImportantPatterns: jest.fn().mockReturnValue(true),
      determineMemoryType: jest.fn().mockReturnValue('note')
    });

    render(<MemoryTestPanel />);
    
    const textarea = screen.getByPlaceholderText(/digite uma mensagem para testar/i);
    const sendButton = screen.getByText('Enviar Teste');
    
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    expect(mockInterceptChatMessage).toHaveBeenCalledWith('Test message');
  });
});
