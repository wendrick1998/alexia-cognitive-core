/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Documentação completa dos aprimoramentos do sistema multi-LLM
 * Inclui instruções de uso, integração e manutenção dos novos recursos
 */

# Documentação dos Aprimoramentos do Sistema Multi-LLM

## Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Feedback Ativo](#sistema-de-feedback-ativo)
3. [CortexCache (Cache Semântico)](#cortexcache-cache-semântico)
4. [Logs Inteligentes por Modelo](#logs-inteligentes-por-modelo)
5. [Integração com Supabase](#integração-com-supabase)
6. [Integração com Lovable](#integração-com-lovable)
7. [Manutenção e Monitoramento](#manutenção-e-monitoramento)
8. [Troubleshooting](#troubleshooting)

## Visão Geral

Este documento detalha os três principais aprimoramentos implementados no sistema multi-LLM do Alex iA:

1. **Sistema de Feedback Ativo**: Coleta feedback do usuário (👍👎 e escala 1-5) para melhorar o roteamento entre modelos.
2. **CortexCache**: Sistema de cache semântico que evita chamadas redundantes às APIs de LLM.
3. **Logs Inteligentes**: Registro detalhado de métricas por modelo, incluindo tempo, custo e fallback.

Estes aprimoramentos trabalham em conjunto para melhorar a experiência do usuário, reduzir custos e otimizar o desempenho do sistema.

## Sistema de Feedback Ativo

### Componentes Principais

- **FeedbackSystem.tsx**: Componente React que exibe botões 👍👎 e escala 1-5 opcional.
- **FeedbackBatchProcessor.ts**: Serviço que processa feedback em lote e atualiza preferências do orquestrador.
- **Tabelas Supabase**: `llm_feedback`, `llm_orchestrator_preferences`, `llm_feedback_batch_processing`.

### Como Usar

1. **Adicionar o componente de feedback após respostas LLM**:

```tsx
import { FeedbackSystem } from '@/components/FeedbackSystem';
import { useLLMRouter } from '@/hooks/useLLMRouter';

const ChatMessage = ({ message }) => {
  const { recordResponseContext } = useLLMRouter();
  
  // Registrar contexto da resposta para feedback
  const responseContext = {
    question: message.question,
    answer: message.answer,
    modelName: message.modelName,
    provider: message.provider,
    usedFallback: message.usedFallback,
    responseTime: message.responseTime,
    tokensUsed: message.tokensUsed,
    timestamp: new Date(),
    sessionId: 'session-123',
    userId: 'user-456'
  };
  
  return (
    <div className="message">
      <div className="content">{message.answer}</div>
      <FeedbackSystem context={responseContext} />
    </div>
  );
};
```

2. **Configurar processamento em lote**:

```tsx
import { FeedbackBatchProcessor } from '@/services/FeedbackBatchProcessor';

// Executar periodicamente (ex: a cada 24h)
const processFeedback = async () => {
  const processor = new FeedbackBatchProcessor();
  await processor.startBatchProcessing();
  const preferencesUpdated = await processor.processFeedback();
  console.log(`${preferencesUpdated} preferências atualizadas`);
};
```

3. **Verificar preferências atualizadas**:

As preferências atualizadas serão automaticamente consideradas pelo hook `useLLMRouter` na próxima inicialização.

### Métricas e Monitoramento

- **Taxa de feedback**: Porcentagem de respostas que recebem feedback.
- **Distribuição de avaliações**: Proporção de 👍 vs 👎 e distribuição na escala 1-5.
- **Impacto no roteamento**: Mudanças nas preferências do orquestrador ao longo do tempo.

## CortexCache (Cache Semântico)

### Componentes Principais

- **SemanticCache.ts**: Serviço que gerencia o cache semântico de respostas LLM.
- **Tabelas Supabase**: `llm_response_cache`, `llm_cache_metrics`.
- **Extensão pgvector**: Utilizada para armazenamento e busca de embeddings.

### Como Usar

1. **Inicializar o cache**:

```tsx
import { SemanticCache } from '@/services/SemanticCache';

const cache = new SemanticCache({
  similarityThreshold: 0.85, // Limiar de similaridade (0-1)
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
  userId: 'user-123'
});
```

2. **Verificar cache antes de chamar LLM**:

```tsx
const handleQuestion = async (question: string) => {
  // Determinar tipo de tarefa
  const taskType = inferTaskType(question);
  
  // Verificar cache
  const cachedResponse = await cache.getCachedResponse(question, taskType);
  
  if (cachedResponse) {
    // Usar resposta em cache
    return {
      answer: cachedResponse,
      fromCache: true
    };
  }
  
  // Se não encontrou no cache, chamar LLM
  const { modelConfig } = llmRouter.routeByTask(taskType);
  const response = await callLLM(question, modelConfig);
  
  // Adicionar ao cache
  await cache.cacheResponse(
    question,
    response.answer,
    taskType,
    modelConfig.modelName,
    modelConfig.provider,
    response.tokensUsed
  );
  
  return {
    answer: response.answer,
    fromCache: false
  };
};
```

3. **Manutenção do cache**:

```tsx
// Limpar cache expirado (executar periodicamente)
const cleanupCache = async () => {
  const itemsRemoved = await cache.cleanupExpiredCache();
  console.log(`${itemsRemoved} itens de cache expirados removidos`);
};

// Obter estatísticas de uso do cache
const getCacheStats = async () => {
  const stats = await cache.getCacheStats();
  console.log(`Taxa de hit: ${stats.hitRate * 100}%`);
  console.log(`Tokens economizados em média: ${stats.averageTokensSaved}`);
};
```

### Métricas e Monitoramento

- **Taxa de hit**: Porcentagem de consultas atendidas pelo cache.
- **Tokens economizados**: Quantidade de tokens (e custo) economizados pelo cache.
- **Distribuição de similaridade**: Histograma de scores de similaridade para hits de cache.

## Logs Inteligentes por Modelo

### Componentes Principais

- **LLMLogger.ts**: Serviço que registra e analisa métricas detalhadas por modelo.
- **Tabelas Supabase**: `llm_call_logs`, `llm_model_metrics`.
- **Função cron**: Agregação diária de métricas para análise de tendências.

### Como Usar

1. **Inicializar o logger**:

```tsx
import { LLMLogger } from '@/services/LLMLogger';

const logger = new LLMLogger({
  enableRealTimeLogging: true,
  batchSize: 10,
  userId: 'user-123',
  sessionId: 'session-456'
});
```

2. **Registrar chamadas LLM**:

```tsx
const callLLMWithLogging = async (question: string, modelConfig) => {
  // Iniciar log
  const callId = await logger.logStart(
    modelConfig.modelName,
    modelConfig.provider,
    taskType,
    question,
    estimatedInputTokens
  );
  
  try {
    // Chamar LLM
    const startTime = Date.now();
    const response = await callLLM(question, modelConfig);
    const responseTime = Date.now() - startTime;
    
    // Finalizar log com sucesso
    await logger.logEnd(
      callId,
      response.answer.length,
      response.tokensOutput,
      'success',
      {
        usedFallback: false,
        cacheHit: false
      }
    );
    
    return response;
  } catch (error) {
    // Finalizar log com erro
    await logger.logEnd(
      callId,
      0,
      0,
      'error',
      {
        errorMessage: error.message
      }
    );
    
    // Tentar fallback
    const fallbackResponse = await callFallbackLLM(question);
    
    // Registrar uso de fallback
    await logger.logEnd(
      callId,
      fallbackResponse.answer.length,
      fallbackResponse.tokensOutput,
      'success',
      {
        usedFallback: true,
        fallbackReason: 'primary_model_error',
        fallbackModel: fallbackResponse.modelName
      }
    );
    
    return fallbackResponse;
  }
};
```

3. **Analisar métricas**:

```tsx
// Obter métricas por modelo
const getModelMetrics = async () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Últimos 30 dias
  
  const metrics = await logger.getMetricsByModel(startDate);
  
  // Exibir métricas
  metrics.forEach(metric => {
    console.log(`Modelo: ${metric.modelName} (${metric.provider})`);
    console.log(`Chamadas totais: ${metric.totalCalls}`);
    console.log(`Taxa de sucesso: ${metric.successRate * 100}%`);
    console.log(`Tempo médio de resposta: ${metric.avgResponseTime}ms`);
    console.log(`Custo total: $${metric.totalCost.toFixed(2)}`);
    console.log(`Taxa de fallback: ${metric.fallbackRate * 100}%`);
    console.log(`Taxa de cache hit: ${metric.cacheHitRate * 100}%`);
    console.log('---');
  });
};

// Obter métricas de fallback
const getFallbackInsights = async () => {
  const fallbackMetrics = await logger.getFallbackMetrics();
  
  console.log(`Total de fallbacks: ${fallbackMetrics.totalFallbacks}`);
  console.log('Razões de fallback:');
  Object.entries(fallbackMetrics.fallbacksByReason).forEach(([reason, count]) => {
    console.log(`- ${reason}: ${count}`);
  });
};

// Obter métricas de custo
const getCostInsights = async () => {
  const costMetrics = await logger.getCostMetrics('week');
  
  console.log(`Custo total: $${costMetrics.totalCost.toFixed(2)}`);
  console.log('Custo por modelo:');
  Object.entries(costMetrics.costByModel).forEach(([model, cost]) => {
    console.log(`- ${model}: $${cost.toFixed(2)}`);
  });
};
```

### Métricas e Monitoramento

- **Performance**: Tempo médio de resposta, P95, P99 por modelo.
- **Confiabilidade**: Taxa de sucesso, taxa de fallback, razões de fallback.
- **Custo**: Custo total, custo por modelo, custo por tipo de tarefa.
- **Tendências**: Evolução das métricas ao longo do tempo.

## Integração com Supabase

### Configuração Inicial

1. **Aplicar schemas SQL**:

Acesse o Editor SQL do Supabase e execute os seguintes scripts:

- `/supabase/migrations/20250601_llm_feedback_schema.sql`
- `/supabase/migrations/20250601_semantic_cache_schema.sql`
- `/supabase/migrations/20250601_llm_logs_schema.sql`

2. **Habilitar extensão pgvector**:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

3. **Configurar variáveis de ambiente**:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_OPENAI_API_KEY=sua-chave-openai
```

### Manutenção do Banco de Dados

- **Limpeza periódica**: Configurar jobs para remover dados antigos e manter o tamanho do banco gerenciável.
- **Backup**: Configurar backups regulares das tabelas críticas.
- **Monitoramento**: Verificar regularmente o crescimento das tabelas e performance das queries.

## Integração com Lovable

### Sincronização com GitHub

1. **Commit dos arquivos**:

```bash
git add src/components/FeedbackSystem.tsx
git add src/services/FeedbackBatchProcessor.ts
git add src/services/SemanticCache.ts
git add src/services/LLMLogger.ts
git add src/hooks/useLLMRouter.tsx
git add supabase/migrations/*.sql
git commit -m "feat: add feedback system, semantic cache and intelligent logs"
git push origin main
```

2. **Sincronizar Lovable com GitHub**:

- Abra o Lovable 2.0
- Selecione "Importar Projeto"
- Conecte ao GitHub e selecione o repositório `alexia-cognitive-core`
- Aguarde a sincronização completa

### Uso no Lovable

1. **Adicionar componente de feedback**:

- Navegue até o componente de chat ou resposta LLM
- Adicione o componente `FeedbackSystem` após cada resposta

2. **Integrar cache semântico**:

- Modifique o fluxo de processamento de perguntas para verificar o cache antes de chamar LLM
- Adicione lógica para armazenar respostas no cache

3. **Implementar logging**:

- Adicione chamadas ao `LLMLogger` nos pontos de entrada e saída de chamadas LLM
- Crie um dashboard para visualizar métricas

## Manutenção e Monitoramento

### Tarefas Periódicas

1. **Processamento de feedback**:

Configurar um job para executar diariamente:

```typescript
// Exemplo com setInterval (em produção, usar um scheduler mais robusto)
setInterval(async () => {
  const processor = new FeedbackBatchProcessor();
  await processor.startBatchProcessing();
  await processor.processFeedback();
}, 24 * 60 * 60 * 1000); // 24 horas
```

2. **Limpeza de cache**:

```typescript
// Executar semanalmente
setInterval(async () => {
  const cache = new SemanticCache();
  await cache.cleanupExpiredCache();
}, 7 * 24 * 60 * 60 * 1000); // 7 dias
```

3. **Análise de métricas**:

```typescript
// Gerar relatório semanal
const generateWeeklyReport = async () => {
  const logger = new LLMLogger();
  
  // Definir período
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  // Obter métricas
  const modelMetrics = await logger.getMetricsByModel(startDate, endDate);
  const fallbackMetrics = await logger.getFallbackMetrics();
  const costMetrics = await logger.getCostMetrics('day', startDate, endDate);
  
  // Gerar relatório
  const report = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    models: modelMetrics,
    fallback: fallbackMetrics,
    cost: costMetrics
  };
  
  // Salvar ou enviar relatório
  await saveWeeklyReport(report);
};
```

### Alertas

Configurar alertas para situações críticas:

1. **Custo excessivo**:
   - Alerta quando o custo diário exceder um limite predefinido
   - Exemplo: > $10/dia

2. **Taxa de fallback alta**:
   - Alerta quando a taxa de fallback exceder um limite
   - Exemplo: > 10% das chamadas

3. **Tempo de resposta degradado**:
   - Alerta quando o P95 do tempo de resposta aumentar significativamente
   - Exemplo: > 50% acima da média histórica

## Troubleshooting

### Problemas Comuns

1. **Feedback não está sendo registrado**:
   - Verificar conexão com Supabase
   - Verificar permissões da tabela `llm_feedback`
   - Verificar erros no console do navegador

2. **Cache semântico não está funcionando**:
   - Verificar se a extensão pgvector está habilitada
   - Verificar se os embeddings estão sendo gerados corretamente
   - Verificar o limiar de similaridade (pode estar muito alto)

3. **Logs não estão sendo registrados**:
   - Verificar conexão com Supabase
   - Verificar se o flush automático está funcionando
   - Verificar erros no console

4. **Processamento em batch não está atualizando preferências**:
   - Verificar se há feedback suficiente para análise estatística
   - Verificar permissões da tabela `llm_orchestrator_preferences`
   - Verificar logs de erro do processador

### Diagnóstico

1. **Verificar conexão com Supabase**:

```typescript
const testSupabaseConnection = async () => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string
  );
  
  const { data, error } = await supabase.from('llm_feedback').select('count');
  
  if (error) {
    console.error('Erro de conexão com Supabase:', error);
    return false;
  }
  
  console.log('Conexão com Supabase OK');
  return true;
};
```

2. **Verificar geração de embeddings**:

```typescript
const testEmbeddingGeneration = async () => {
  const cache = new SemanticCache();
  const testText = 'Texto de teste para geração de embedding';
  
  try {
    const embedding = await cache['generateEmbedding'](testText);
    console.log(`Embedding gerado com sucesso. Dimensão: ${embedding.length}`);
    return true;
  } catch (error) {
    console.error('Erro na geração de embedding:', error);
    return false;
  }
};
```

3. **Verificar processamento de feedback**:

```typescript
const testFeedbackProcessing = async () => {
  const processor = new FeedbackBatchProcessor();
  
  try {
    await processor.startBatchProcessing();
    const updated = await processor.processFeedback();
    console.log(`Processamento de feedback OK. ${updated} preferências atualizadas.`);
    return true;
  } catch (error) {
    console.error('Erro no processamento de feedback:', error);
    return false;
  }
};
```

### Recuperação

1. **Reiniciar serviços**:

```typescript
const resetServices = () => {
  // Limpar dados temporários
  localStorage.clear();
  
  // Reiniciar instâncias
  const logger = new LLMLogger();
  const cache = new SemanticCache();
  const processor = new FeedbackBatchProcessor();
  
  console.log('Serviços reiniciados');
};
```

2. **Reconstruir índices**:

```sql
-- Reconstruir índice de embeddings
REINDEX INDEX idx_llm_response_cache_embedding;

-- Reconstruir outros índices
REINDEX TABLE llm_feedback;
REINDEX TABLE llm_call_logs;
```

3. **Limpar dados corrompidos**:

```typescript
const cleanupCorruptedData = async () => {
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_ANON_KEY as string
  );
  
  // Remover logs com erros
  await supabase
    .from('llm_call_logs')
    .delete()
    .eq('status', 'error');
  
  // Remover embeddings nulos
  await supabase
    .from('llm_response_cache')
    .delete()
    .is('embedding', null);
  
  console.log('Dados corrompidos removidos');
};
```
