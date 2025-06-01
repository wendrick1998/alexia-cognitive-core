/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Guia de testes e validação para o projeto Alex iA
 * Inclui procedimentos para validar todas as melhorias implementadas
 */

# Guia de Testes e Validação - Alex iA

## Índice

1. [Testes de Build e Dependências](#testes-de-build-e-dependências)
2. [Testes de Performance](#testes-de-performance)
3. [Testes de Segurança](#testes-de-segurança)
4. [Testes do Sistema Multi-LLM](#testes-do-sistema-multi-llm)
5. [Métricas de Sucesso](#métricas-de-sucesso)
6. [Integração com Lovable e GitHub](#integração-com-lovable-e-github)

## Testes de Build e Dependências

### Validação do Build

```bash
# Executar build de produção
npm run build

# Verificar se não há erros de compilação
# Verificar se os arquivos foram gerados corretamente na pasta dist/
```

### Verificação de Dependências

```bash
# Verificar conflitos de dependências
npm ls date-fns react-day-picker

# Verificar vulnerabilidades restantes
npm audit
```

## Testes de Performance

### Métricas de Bundle

- **Antes da Otimização**:
  - Index-CzMLhAUf.js: 789.41 kB
  - index-CwHy0iHs.js: 489.61 kB
  - Total: ~1279 kB

- **Depois da Otimização**:
  - Dividido em múltiplos chunks menores
  - Os maiores agora são:
    - chart-vendor: 376.64 kB
    - index: 322.01 kB
    - Index: 263.25 kB
  - Melhor distribuição e carregamento mais eficiente

### Testes de Carregamento

```bash
# Iniciar servidor de preview
npm run preview

# Medir tempo de carregamento inicial
# Usar DevTools para verificar:
# - First Contentful Paint (FCP)
# - Largest Contentful Paint (LCP)
# - Cumulative Layout Shift (CLS)
```

### Verificação de Memory Leaks

1. Abrir o aplicativo no navegador
2. Abrir DevTools > Memory
3. Realizar gravação de heap snapshot
4. Executar operações que usam workers e componentes de memória
5. Realizar nova gravação de heap snapshot
6. Comparar snapshots para identificar vazamentos

## Testes de Segurança

### Validação de CSP Headers

1. Iniciar servidor de preview
2. Abrir DevTools > Network
3. Verificar headers de resposta para confirmar presença de:
   - Content-Security-Policy
   - X-Content-Type-Options
   - X-Frame-Options
   - X-XSS-Protection
   - Referrer-Policy
   - Permissions-Policy

### Teste de Rate Limiting

```javascript
// Simular múltiplas requisições rápidas
const testRateLimit = async () => {
  const userId = 'test-user-123';
  const results = [];
  
  for (let i = 0; i < 120; i++) {
    const limited = shouldRateLimit(userId);
    results.push(limited);
  }
  
  console.log('Rate limiting results:', results);
  console.log('Requests blocked:', results.filter(r => r).length);
};

testRateLimit();
```

### Teste de Sanitização

```javascript
// Testar sanitização de conteúdo malicioso
const testSanitization = () => {
  const maliciousContent = '<img src="x" onerror="alert(\'XSS\')">';
  const sanitized = sanitizeContent(maliciousContent);
  
  console.log('Original:', maliciousContent);
  console.log('Sanitized:', sanitized);
};

testSanitization();
```

## Testes do Sistema Multi-LLM

### Teste de Roteamento

```javascript
// Testar roteamento por tipo de tarefa
const testLLMRouting = () => {
  const router = useLLMRouter();
  
  const tasks = [
    'general',
    'creative',
    'code',
    'reasoning',
    'academic',
    'summarization',
    'extraction'
  ];
  
  tasks.forEach(task => {
    const model = router.routeByTask(task);
    console.log(`Task: ${task} => Model: ${model.modelName} (${model.provider})`);
  });
};

testLLMRouting();
```

### Teste de Fallback

```javascript
// Testar fallback entre provedores
const testLLMFallback = () => {
  const router = useLLMRouter();
  
  console.log('Initial provider:', router.currentProvider);
  
  // Desabilitar o provedor atual
  router.toggleProvider(router.currentProvider, false);
  
  console.log('Provider after disabling current:', router.currentProvider);
  console.log('Available providers:', router.availableProviders);
};

testLLMFallback();
```

## Métricas de Sucesso

### Build e Funcionalidade

- ✅ Build sem erros em < 15 segundos
- ✅ Zero conflitos de dependências
- ⬜ Todas funcionalidades core operacionais (testar manualmente)

### Performance

- ✅ Bundle principal reduzido de ~789kB para ~322kB
- ⬜ Lighthouse score > 90 (testar em produção)
- ⬜ FCP < 1.8s, LCP < 2.5s, CLS < 0.1 (testar em produção)

### Segurança

- ⬜ Zero vulnerabilidades de alta severidade (restam vulnerabilidades moderadas em esbuild)
- ✅ CSP implementado e validado
- ⬜ Score de segurança > 8.5/10 (testar com ferramentas de análise)

### Multi-LLM

- ✅ Suporte a 4 provedores (OpenAI, Claude, DeepSeek, Groq)
- ✅ Fallback automático em caso de falha
- ✅ Roteamento inteligente por tipo de tarefa

## Integração com Lovable e GitHub

### Preparação de Commits

```bash
# Adicionar arquivos modificados
git add vite.config.ts
git add src/lib/security.ts
git add src/hooks/useLLMRouter.tsx
git add package.json

# Criar commits separados por funcionalidade
git commit -m "fix: resolve dependency conflict between date-fns and react-day-picker"
git commit -m "perf: implement code splitting and optimize bundle size"
git commit -m "security: add CSP headers, rate limiting and input sanitization"
git commit -m "feat: activate multi-LLM system with intelligent routing"

# Push para o GitHub
git push origin main
```

### Integração com Lovable

1. Abrir o projeto no Lovable
2. Sincronizar com o repositório GitHub
3. Verificar se as alterações foram aplicadas corretamente
4. Testar funcionalidades no ambiente Lovable
