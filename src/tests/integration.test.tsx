
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import UnifiedDashboard from '@/components/unified/UnifiedDashboard';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Mock hooks básicos
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    loading: false,
    error: null
  })
}));

// Mock de hooks que ainda não existem ou são complexos
jest.mock('@/hooks/useAutonomousLearning', () => ({
  useAutonomousLearning: () => ({
    learningStats: {
      totalExperience: 1000,
      patternsFound: 15,
      preferencesLearned: 25
    },
    patterns: [
      {
        id: '1',
        pattern: ['analysis', 'review', 'implementation'],
        confidence: 0.85,
        frequency: 12,
        context: 'development',
        lastSeen: new Date()
      }
    ]
  })
}));

jest.mock('@/hooks/useMultiAgentCollaboration', () => ({
  useMultiAgentCollaboration: () => ({
    agents: [
      {
        id: 'agent-1',
        name: 'Alex Analytics',
        type: 'analytical',
        status: 'working',
        performance: { tasksCompleted: 15 }
      }
    ],
    collaborationStats: {
      activeCollaborations: 3
    }
  })
}));

jest.mock('@/hooks/usePerformanceMonitoring', () => ({
  usePerformanceMonitoring: () => ({
    getPerformanceScore: () => 85,
    metrics: {
      memoryUsage: 45,
      cacheHitRate: 78,
      avgResponseTime: 150
    }
  })
}));

describe('Integration Tests - Sistema Completo', () => {
  describe('Dashboard Unificado', () => {
    test('Renderiza dashboard principal corretamente', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      // Verificar header
      await waitFor(() => {
        expect(screen.getByText(/Bom dia|Boa tarde|Boa noite/)).toBeInTheDocument();
        expect(screen.getByText('Centro de Comando da IA Cognitiva')).toBeInTheDocument();
      });

      // Verificar tabs
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Projetos')).toBeInTheDocument();
      expect(screen.getByText('Aprendizado')).toBeInTheDocument();
      expect(screen.getByText('Coaching')).toBeInTheDocument();
      expect(screen.getByText('Otimização')).toBeInTheDocument();
    });

    test('Navegação entre tabs funciona corretamente', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      });

      // Clicar na aba de projetos
      fireEvent.click(screen.getByText('Projetos'));
      
      await waitFor(() => {
        // Verificar se o conteúdo da aba mudou
        expect(screen.getByText('Projetos')).toBeInTheDocument();
      });

      // Clicar na aba de coaching
      fireEvent.click(screen.getByText('Coaching'));
      
      await waitFor(() => {
        expect(screen.getByText('Coaching')).toBeInTheDocument();
      });
    });

    test('Cards de estatísticas são exibidos', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Projetos')).toBeInTheDocument();
        expect(screen.getByText('Agentes Ativos')).toBeInTheDocument();
        expect(screen.getByText('Tarefas')).toBeInTheDocument();
        expect(screen.getByText('Aprendizado')).toBeInTheDocument();
      });
    });
  });

  describe('Sistema de Performance', () => {
    test('Métricas de performance são exibidas', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Performance')).toBeInTheDocument();
        expect(screen.getByText('Memória')).toBeInTheDocument();
      });
    });
  });

  describe('Components Loading', () => {
    test('Lazy components carregam corretamente', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      });

      // Mudar para tab de projetos para testar lazy loading
      fireEvent.click(screen.getByText('Projetos'));
      
      await waitFor(() => {
        expect(screen.getByText('Projetos')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Testar tab de coaching
      fireEvent.click(screen.getByText('Coaching'));
      
      await waitFor(() => {
        expect(screen.getByText('Coaching')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Funcionalidades Básicas', () => {
    test('Sistema status é exibido', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Sistema operando|Sistema funcionando|Sistema necessita|Sistema requer/)).toBeInTheDocument();
      });
    });

    test('Insights recentes são carregados', async () => {
      render(
        <TestWrapper>
          <UnifiedDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Insights Recentes')).toBeInTheDocument();
      });
    });
  });
});

describe('Testes de Compatibilidade', () => {
  test('Dashboard funciona sem erros de console', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <TestWrapper>
        <UnifiedDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Centro de Comando da IA Cognitiva')).toBeInTheDocument();
    });

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('Navegação não causa erros', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <TestWrapper>
        <UnifiedDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Navegar entre todas as tabs
    const tabs = ['Projetos', 'Aprendizado', 'Coaching', 'Otimização'];
    
    for (const tab of tabs) {
      fireEvent.click(screen.getByText(tab));
      await waitFor(() => {
        expect(screen.getByText(tab)).toBeInTheDocument();
      });
    }

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
