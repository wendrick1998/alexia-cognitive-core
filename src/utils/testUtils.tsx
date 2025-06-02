
import React from 'react';
import { render, RenderOptions, renderHook } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

// Re-export everything from @testing-library/react and dom
export * from '@testing-library/react';
export { screen, fireEvent, waitFor, userEvent };

// Mock do useAuth para testes
const mockAuthContext = {
  user: {
    id: 'test-user',
    email: 'test@example.com'
  },
  isAuthenticated: true,
  loading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn()
};

// Mock do Auth Provider
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Simula o contexto de autenticação
  return <>{children}</>;
};

// Create a custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MockAuthProvider>
            {children}
          </MockAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Helper para renderizar com user event
export const renderWithUserEvent = (ui: React.ReactElement) => {
  const user = userEvent.setup();
  return {
    user,
    ...customRender(ui)
  };
};

// Helper para criar um QueryClient de teste personalizado
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Helper para limpar todos os mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
};

// Helper para aguardar carregamento assíncrono
export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

// Override the default render with our custom render
export { customRender as render };

// Export mock auth context for use in tests
export { mockAuthContext };

// Explicitly re-export the commonly used testing utilities
export { renderHook };
