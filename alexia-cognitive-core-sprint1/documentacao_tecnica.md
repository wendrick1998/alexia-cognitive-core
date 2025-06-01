/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Documentação técnica completa do projeto Alex iA
 * Inclui detalhes sobre correções, melhorias e boas práticas implementadas
 */

# Documentação Técnica - Alex iA

## Índice

1. [Visão Geral](#visão-geral)
2. [Correções Implementadas](#correções-implementadas)
3. [Boas Práticas](#boas-práticas)
4. [Integração com Lovable](#integração-com-lovable)
5. [Integração com Supabase](#integração-com-supabase)
6. [Manutenção e Evolução](#manutenção-e-evolução)
7. [Troubleshooting](#troubleshooting)

## Visão Geral

Este documento técnico detalha as correções, melhorias e boas práticas implementadas no projeto Alex iA, um agente cognitivo pessoal que funciona como segundo cérebro digital. As implementações focaram em quatro áreas críticas:

1. **Build e Dependências**: Resolução de conflitos e otimização de pacotes
2. **Performance**: Code splitting, lazy loading e otimização de bundles
3. **Segurança**: CSP headers, rate limiting, sanitização e validação
4. **Multi-LLM**: Roteamento inteligente entre múltiplos provedores de LLM

## Correções Implementadas

### 1. Build e Dependências

#### Problema
Conflito entre `date-fns@4.1.0` e `react-day-picker@8.10.1` que exigia versões `^2.28.0 || ^3.0.0`.

#### Solução
```bash
# Downgrade do date-fns para versão compatível
npm uninstall date-fns
npm install date-fns@3.6.0 --save
```

#### Resultado
Build funcional sem erros de compilação.

### 2. Performance

#### Problema
Bundles JavaScript excessivamente grandes (789.72 kB e 489.61 kB após minificação).

#### Solução
Implementação de code splitting avançado no Vite:

```javascript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': [/* componentes Radix UI */],
        '3d-vendor': ['@react-three/drei', '@react-three/fiber', 'three'],
        'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
        'chart-vendor': ['recharts'],
      },
    },
  },
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
}
```

#### Resultado
Redução significativa do tamanho dos bundles e melhor distribuição de carregamento:
- chart-vendor: 376.64 kB
- index: 322.01 kB
- Index: 263.25 kB

### 3. Segurança

#### Problema
Ausência de CSP headers, vulnerabilidades XSS e falta de rate limiting.

#### Solução
Criação de um módulo de segurança completo (`security.ts`):

```typescript
// Principais funcionalidades implementadas
export const sanitizeContent = (content: string): string => { /* ... */ }
export const shouldRateLimit = (userId: string): boolean => { /* ... */ }
export const getSecurityHeaders = (): Record<string, string> => { /* ... */ }
export const validateUserInput = (input: string): boolean => { /* ... */ }
export const logSecurityEvent = async (/* ... */): Promise<void> => { /* ... */ }
export const applySecurityMiddleware = (request: Request, response: Response): Response => { /* ... */ }
```

#### Resultado
Proteção robusta contra XSS, injeções e ataques de força bruta.

### 4. Multi-LLM

#### Problema
Sistema multi-LLM estruturado mas inativo.

#### Solução
Implementação de um hook de roteamento inteligente (`useLLMRouter.tsx`):

```typescript
// Principais funcionalidades implementadas
export const useLLMRouter = (options: UseLLMRouterOptions = {}): LLMRouterResult => {
  // Estado e configuração
  const [currentProvider, setCurrentProvider] = useState<LLMProvider>(/* ... */);
  
  // Funções de roteamento
  const isProviderEnabled = useCallback((provider: LLMProvider): boolean => { /* ... */ });
  const toggleProvider = useCallback((provider: LLMProvider, enabled: boolean) => { /* ... */ });
  const routeByTask = useCallback((task: TaskType): ModelConfig => { /* ... */ });
  
  return {
    currentProvider,
    currentModel,
    availableProviders,
    setProvider: setCurrentProvider,
    routeByTask,
    isProviderEnabled,
    toggleProvider,
    modelStats
  };
};
```

#### Resultado
Sistema multi-LLM ativo com roteamento inteligente, fallback automático e monitoramento de performance.

## Boas Práticas

### Gerenciamento de Dependências

1. **Fixação de Versões**: Fixar versões de dependências críticas para evitar conflitos futuros.
   ```json
   "dependencies": {
     "date-fns": "3.6.0",
     "react-day-picker": "8.10.1"
   }
   ```

2. **Auditoria Regular**: Executar `npm audit` regularmente e corrigir vulnerabilidades.
   ```bash
   npm audit
   npm audit fix
   ```

3. **Atualização Controlada**: Atualizar dependências uma a uma, testando após cada atualização.

### Otimização de Performance

1. **Code Splitting**: Dividir o código em chunks lógicos por funcionalidade ou rota.

2. **Lazy Loading**: Carregar componentes apenas quando necessários.
   ```jsx
   const LazyComponent = React.lazy(() => import('./LazyComponent'));
   ```

3. **Monitoramento de Bundle**: Usar ferramentas como `webpack-bundle-analyzer` ou equivalente para Vite.

4. **Cleanup de Recursos**: Garantir que todos os recursos sejam liberados, especialmente em Web Workers.
   ```jsx
   useEffect(() => {
     const worker = new Worker(/* ... */);
     return () => worker.terminate();
   }, []);
   ```

### Segurança

1. **CSP Headers**: Implementar Content Security Policy para prevenir XSS.

2. **Sanitização**: Sempre sanitizar conteúdo HTML antes de renderizar.
   ```jsx
   <div dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }} />
   ```

3. **Validação de Input**: Validar todas as entradas do usuário antes de processar.
   ```jsx
   if (!validateUserInput(userInput)) {
     return showError('Input inválido');
   }
   ```

4. **Rate Limiting**: Implementar limitação de taxa para prevenir abusos.

### Multi-LLM

1. **Abstração de Provedores**: Usar interfaces comuns para diferentes provedores de LLM.

2. **Fallback Automático**: Implementar mecanismos de fallback em caso de falha.

3. **Roteamento Inteligente**: Rotear requisições para o modelo mais adequado com base no tipo de tarefa.

4. **Monitoramento de Custos**: Acompanhar custos e uso de tokens para otimizar gastos.

## Integração com Lovable

### Importando o Projeto

1. Abrir o Lovable 2.0
2. Selecionar "Importar Projeto"
3. Conectar ao GitHub e selecionar o repositório `alexia-cognitive-core`
4. Aguardar a sincronização completa

### Editando Componentes

1. Navegar até o componente desejado na interface do Lovable
2. Editar o código usando o editor integrado
3. Testar as alterações no preview em tempo real
4. Salvar as alterações

### Prompts Recomendados

Para editar componentes específicos via prompts no Lovable:

1. **Componente de Seleção de Modelo**:
   ```
   Modifique o componente ModelSelector.tsx para exibir os modelos disponíveis de cada provedor LLM, mostrando ícones distintos para OpenAI, Claude, DeepSeek e Groq. Adicione tooltips que mostrem as forças de cada modelo e seu custo aproximado por 1k tokens.
   ```

2. **Dashboard de Performance**:
   ```
   Atualize o componente PerformanceDashboard.tsx para exibir métricas de uso de cada modelo LLM, incluindo tempo médio de resposta, taxa de falhas e custo acumulado. Use gráficos de barras para comparação visual entre modelos.
   ```

3. **Configuração de Segurança**:
   ```
   Crie um componente SecuritySettings.tsx que permita configurar os parâmetros de segurança, como limites de rate limiting, regras CSP personalizadas e níveis de sanitização de conteúdo.
   ```

## Integração com Supabase

### Tabelas Necessárias

1. **llm_usage_stats**: Armazenar estatísticas de uso dos modelos LLM.
   ```sql
   CREATE TABLE llm_usage_stats (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     model_name TEXT NOT NULL,
     total_calls INTEGER DEFAULT 0,
     avg_response_time FLOAT DEFAULT 0,
     failure_rate FLOAT DEFAULT 0,
     cost_to_date FLOAT DEFAULT 0,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **security_events**: Registrar eventos de segurança.
   ```sql
   CREATE TABLE security_events (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id TEXT NOT NULL,
     event_type TEXT NOT NULL,
     details JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Edge Functions

1. **process-llm-request**: Processar requisições para diferentes provedores de LLM.
   ```typescript
   // supabase/functions/process-llm-request/index.ts
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
   
   serve(async (req) => {
     const { task, content, provider } = await req.json();
     
     // Implementar roteamento para o provedor correto
     // Registrar estatísticas de uso
     // Implementar fallback em caso de falha
     
     return new Response(JSON.stringify({ result }), {
       headers: { 'Content-Type': 'application/json' },
     });
   });
   ```

2. **security-middleware**: Aplicar headers de segurança e rate limiting.
   ```typescript
   // supabase/functions/security-middleware/index.ts
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
   
   serve(async (req) => {
     // Implementar verificação de rate limiting
     // Aplicar headers de segurança
     // Registrar eventos de segurança
     
     // Passar para a próxima função
     const response = await fetch(nextFunctionUrl, {
       method: req.method,
       headers: req.headers,
       body: req.body,
     });
     
     // Adicionar headers de segurança à resposta
     return new Response(response.body, {
       status: response.status,
       headers: {
         ...response.headers,
         'Content-Security-Policy': '...',
         'X-Content-Type-Options': 'nosniff',
         // Outros headers de segurança
       },
     });
   });
   ```

## Manutenção e Evolução

### Monitoramento

1. **Performance**: Monitorar métricas Core Web Vitals regularmente.
2. **Segurança**: Configurar alertas para eventos de segurança suspeitos.
3. **Uso de LLM**: Acompanhar custos e performance dos diferentes modelos.

### Atualizações Futuras

1. **Dependências**: Atualizar dependências regularmente, priorizando correções de segurança.
2. **Novos Modelos LLM**: Adicionar suporte a novos modelos conforme disponíveis.
3. **Otimizações de Performance**: Continuar refinando o code splitting e lazy loading.

### Backups e Recuperação

1. **Banco de Dados**: Configurar backups regulares das tabelas do Supabase.
2. **Código**: Manter branches estáveis no GitHub para recuperação rápida.

## Troubleshooting

### Problemas Comuns

1. **Build Quebrado**:
   - Verificar conflitos de dependências com `npm ls`
   - Tentar `npm ci` para instalação limpa

2. **Performance Lenta**:
   - Verificar tamanho dos bundles
   - Analisar memory leaks com DevTools

3. **Erros de Segurança**:
   - Verificar logs de eventos de segurança
   - Testar CSP com ferramentas online

4. **Falhas no Multi-LLM**:
   - Verificar chaves de API e permissões
   - Confirmar que os endpoints estão acessíveis
   - Verificar limites de uso das APIs
