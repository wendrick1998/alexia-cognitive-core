
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock utilities for tests
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
};

export const mockConversation = {
  id: 'test-conversation-id',
  title: 'Test Conversation',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'test-user-id',
};

export const mockMessage = {
  id: 'test-message-id',
  content: 'Test message content',
  role: 'user' as const,
  conversation_id: 'test-conversation-id',
  created_at: new Date().toISOString(),
  user_id: 'test-user-id',
};

export const mockMemory = {
  id: 'test-memory-id',
  content: 'Test memory content',
  type: 'fact' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user_id: 'test-user-id',
};

// Helper function to wait for async operations
export const waitFor = async (callback: () => void | Promise<void>, timeout = 1000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await callback();
      return;
    } catch (error) {
      // Continue waiting
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  throw new Error(`waitFor timeout after ${timeout}ms`);
};

// Mock hook utilities
export const createMockHook = <T>(defaultValue: T) => {
  let currentValue = defaultValue;
  
  return {
    getValue: () => currentValue,
    setValue: (value: T) => { currentValue = value; },
    mock: jest.fn(() => currentValue)
  };
};
