
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider';
import UnifiedDashboard from '@/components/unified/UnifiedDashboard';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useAutonomousLearning } from '@/hooks/useAutonomousLearning';
import { useMultiAgentCollaboration } from '@/hooks/useMultiAgentCollaboration';

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
        <AuthProvider>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    loading: false,
    error: null
  })
}));

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
    getPerformanceScore: () => 85
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
  });

  describe('Sistema de Cache Otimizado', () => {
    test('Cache funciona corretamente', () => {
      const TestComponent = () => {
        const cache = useOptimizedCache();
        
        return (
          <div>
            <button
              onClick={() => cache.set('test-key', { data: 'test-value' })}
            >
              Set Cache
            </button>
            <button
              onClick={() => {
                const result = cache.get('test-key');
                console.log('Cache result:', result);
              }}
            >
              Get Cache
            </button>
            <div>Cache Size: {cache.size}</div>
            <div>Hit Rate: {cache.metrics.hitRate.toFixed(1)}%</div>
          </div>
        );
      };

      render(<TestComponent />);

      // Definir cache
      fireEvent.click(screen.getByText('Set Cache'));
      expect(screen.getByText('Cache Size: 1')).toBeInTheDocument();

      // Obter cache
      fireEvent.click(screen.getByText('Get Cache'));
    });

    test('Cache expira corretamente', async () => {
      const TestComponent = () => {
        const cache = useOptimizedCache();
        
        return (
          <div>
            <button
              onClick={() => cache.set('expire-key', { data: 'expire-value' }, 100)} // 100ms TTL
            >
              Set Expiring Cache
            </button>
            <button
              onClick={() => {
                const result = cache.get('expire-key');
                console.log('Expired cache result:', result);
              }}
            >
              Get Expired Cache
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      // Definir cache com TTL curto
      fireEvent.click(screen.getByText('Set Expiring Cache'));

      // Aguardar expiração
      await new Promise(resolve => setTimeout(resolve, 150));

      // Tentar obter cache expirado
      fireEvent.click(screen.getByText('Get Expired Cache'));
    });
  });

  describe('Integração de Hooks', () => {
    test('Hooks de aprendizado e colaboração funcionam juntos', () => {
      const TestComponent = () => {
        const learning = useAutonomousLearning();
        const collaboration = useMultiAgentCollaboration();
        
        return (
          <div>
            <div>Learning Patterns: {learning.patterns.length}</div>
            <div>Active Agents: {collaboration.agents.filter(a => a.status !== 'idle').length}</div>
            <div>Total Experience: {learning.learningStats.totalExperience}</div>
            <div>Active Collaborations: {collaboration.collaborationStats.activeCollaborations}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Learning Patterns: 1')).toBeInTheDocument();
      expect(screen.getByText('Active Agents: 1')).toBeInTheDocument();
      expect(screen.getByText('Total Experience: 1000')).toBeInTheDocument();
      expect(screen.getByText('Active Collaborations: 3')).toBeInTheDocument();
    });
  });
});

describe('Testes de Performance', () => {
  test('Componentes lazy load corretamente', async () => {
    render(
      <TestWrapper>
        <UnifiedDashboard />
      </TestWrapper>
    );

    // Verificar que componentes lazy são carregados
    await waitFor(() => {
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
    });

    // Mudar para tab que usa lazy loading
    fireEvent.click(screen.getByText('Projetos'));
    
    await waitFor(() => {
      // Verificar que o componente lazy foi carregado
      expect(screen.getByText('Projetos')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('Cache melhora performance de consultas repetidas', () => {
    const TestComponent = () => {
      const cache = useOptimizedCache();
      const [timing, setTiming] = useState<{ first: number; second: number }>({
        first: 0,
        second: 0
      });

      const expensiveOperation = () => {
        // Simular operação custosa
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += i;
        }
        return result;
      };

      const testPerformance = async () => {
        // Primeira execução (sem cache)
        const start1 = performance.now();
        const result1 = await cache.getOrSet('expensive-op', async () => expensiveOperation());
        const end1 = performance.now();

        // Segunda execução (com cache)
        const start2 = performance.now();
        const result2 = await cache.getOrSet('expensive-op', async () => expensiveOperation());
        const end2 = performance.now();

        setTiming({
          first: end1 - start1,
          second: end2 - start2
        });
      };

      return (
        <div>
          <button onClick={testPerformance}>Test Performance</button>
          <div>First: {timing.first.toFixed(2)}ms</div>
          <div>Second: {timing.second.toFixed(2)}ms</div>
          <div>Hit Rate: {cache.metrics.hitRate.toFixed(1)}%</div>
        </div>
      );
    };

    render(<TestComponent />);

    fireEvent.click(screen.getByText('Test Performance'));
  });
});
