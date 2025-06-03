
# Guia de Desenvolvimento - Fase 3

## Estrutura do Projeto

### Componentes de Performance
- `LazyComponentLoader` - Carregamento lazy de componentes
- `SmartLoadingSpinner` - Indicadores de carregamento inteligentes

### Serviços Core
- `MultiLLMRouter` - Roteamento entre provedores LLM
- `SystemMonitor` - Monitoramento em tempo real

### Hooks Especializados
- `useMultiLLMRouter` - Interface para sistema multi-LLM
- `useSystemMonitor` - Métricas e alertas do sistema

## Convenções de Código

### Nomenclatura
- Componentes: PascalCase (`MultiLLMDashboard`)
- Hooks: camelCase com prefixo `use` (`useSystemMonitor`)
- Serviços: PascalCase (`SystemMonitor`)
- Tipos: PascalCase (`LLMRequest`)

### Estrutura de Arquivos
```
src/
├── components/
│   ├── cognitive/       # Componentes cognitivos
│   ├── monitoring/      # Dashboards de monitoramento
│   └── performance/     # Otimizações de performance
├── services/           # Serviços core
├── hooks/             # Hooks customizados
└── tests/             # Testes unitários
```

### Documentação
- Cada arquivo deve ter header com `@description` e `@created_by`
- Funções complexas devem ter JSDoc
- Interfaces TypeScript devem ser documentadas

## Testes

### Estrutura de Testes
- Arquivos de teste: `*.test.tsx`
- Mocks em `__mocks__/`
- Setup global em `setupTests.ts`

### Cobertura Mínima
- Funções: 70%
- Linhas: 70%
- Branches: 70%

## Performance

### Lazy Loading
```typescript
const Component = createLazyImport(
  () => import('./Component'),
  'cognitive'
);
```

### Monitoramento
```typescript
const { metrics, alerts } = useSystemMonitor();
```

## Deployment

### Build
```bash
npm run build
npm run test
```

### Métricas Críticas
- Bundle size < 2MB
- First Contentful Paint < 2s
- Time to Interactive < 3s
