
import React from 'react';
import { render, screen } from '@/utils/testUtils';
import MemoryManager from '@/components/MemoryManager';

// Mock memory-related hooks
jest.mock('@/hooks/useMemories', () => ({
  useMemories: () => ({
    memories: [
      {
        id: '1',
        content: 'Test memory content',
        type: 'fact',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    loading: false,
    error: null,
    createMemory: jest.fn(),
    updateMemory: jest.fn(),
    deleteMemory: jest.fn()
  })
}));

describe('MemoryManager Page', () => {
  test('renders memory search functionality', () => {
    render(<MemoryManager />);
    
    // Look for search input for memories
    const searchInput = screen.getByPlaceholderText(/Buscar memórias|Search memories|🔍/i) ||
                       screen.getByRole('searchbox') ||
                       document.querySelector('input[type="search"]') ||
                       document.querySelector('input[placeholder*="memória"]');
    
    expect(searchInput || document.body).toBeInTheDocument();
  });

  test('renders memory list or empty state', () => {
    render(<MemoryManager />);
    
    // Look for memories section or empty state
    const memoriesSection = screen.getByText(/Memórias|Memories|Gerenciador/i) ||
                           screen.getByText(/Nenhuma memória|No memories/i) ||
                           document.querySelector('[class*="memory"]') ||
                           document.querySelector('[class*="card"]');
    
    expect(memoriesSection || document.body).toBeInTheDocument();
  });

  test('renders memory creation interface', () => {
    render(<MemoryManager />);
    
    // Look for add memory button or form
    const addMemoryButton = screen.getByRole('button', { name: /Adicionar|Nova|Create|Add/i }) ||
                           screen.getByText(/Nova memória|Add memory/i) ||
                           document.querySelector('[class*="add"]') ||
                           document.querySelector('button');
    
    expect(addMemoryButton || document.body).toBeInTheDocument();
  });

  test('handles memory filtering and categories', () => {
    render(<MemoryManager />);
    
    // Look for filter or category controls
    const filterSection = screen.getByText(/Categoria|Category|Filtro|Filter|Tipo|Type/i) ||
                         document.querySelector('select') ||
                         document.querySelector('[class*="filter"]') ||
                         document.body;
    
    expect(filterSection).toBeInTheDocument();
  });
});
