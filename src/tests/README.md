
# Alex iA - Testes Automatizados

Este diretório contém a suite completa de testes automatizados para o Alex iA.

## 📁 Estrutura

```
tests/
├── __mocks__/           # Mocks para serviços externos
│   ├── msw-handlers.ts  # Handlers MSW para API mocking
│   ├── supabase.ts     # Mock do cliente Supabase
│   └── openai.ts       # Mock dos serviços OpenAI/LLM
├── factories/           # Data factories para criação de dados de teste
│   └── testDataFactory.ts
├── components/          # Testes de componentes React
├── hooks/              # Testes de custom hooks
├── services/           # Testes de serviços e utilitários
├── integration/        # Testes de integração entre módulos
└── e2e/               # Testes end-to-end (futuros)
```

## 🚀 Como Executar

### Todos os testes
```bash
npm test
```

### Com coverage
```bash
npm test -- --coverage
```

### Watch mode (desenvolvimento)
```bash
npm test -- --watch
```

### Testes específicos
```bash
npm test ChatView.test.tsx
npm test -- --testNamePattern="Chat"
```

## 📊 Cobertura de Código

O projeto mantém uma cobertura mínima de **70%** em:
- Linhas de código
- Funções
- Branches
- Statements

## 🛠️ Ferramentas Utilizadas

- **Jest**: Framework de testes
- **React Testing Library**: Testes de componentes React
- **MSW**: Mock Service Worker para interceptação de APIs
- **Faker.js**: Geração de dados de teste
- **User Event**: Simulação de interações do usuário

## 📝 Padrões de Teste

### Componentes React
```typescript
import { render, screen, userEvent } from '@/utils/testUtils';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hooks
```typescript
import { renderHook, waitFor } from '@/utils/testUtils';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('should return expected values', async () => {
    const { result } = renderHook(() => useCustomHook());
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Serviços
```typescript
import { LLMService } from './LLMService';

describe('LLMService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process message correctly', async () => {
    const result = await LLMService.processMessage('test');
    expect(result).toMatchObject({
      response: expect.any(String),
      tokens_used: expect.any(Number)
    });
  });
});
```

## 🔧 Configuração

### MSW Handlers
Os handlers MSW estão configurados em `__mocks__/msw-handlers.ts` e interceptam:
- Supabase Edge Functions
- Supabase REST API
- APIs externas (OpenAI, etc.)

### Test Utils
O arquivo `testUtils.tsx` fornece:
- Render customizado com providers
- Helpers para user events
- Mocks de contextos
- Utilitários de limpeza

## 📈 Métricas e CI/CD

Os testes são executados automaticamente em:
- Push para `main` e `develop`
- Pull Requests
- Deploy de produção

### Coverage Reports
- Reports locais: `coverage/lcov-report/index.html`
- CI/CD: Integração com Codecov

## 🐛 Debugging

### Logs de Debug
```bash
DEBUG=true npm test
```

### Ver DOM renderizado
```typescript
import { screen } from '@/utils/testUtils';

// Em qualquer teste
screen.debug(); // Mostra o DOM atual
```

### Identificar queries
```bash
npm test -- --verbose
```

## 🔄 Próximos Passos

- [ ] Implementar testes E2E com Playwright
- [ ] Adicionar testes de performance
- [ ] Testes de acessibilidade automatizados
- [ ] Visual regression testing
