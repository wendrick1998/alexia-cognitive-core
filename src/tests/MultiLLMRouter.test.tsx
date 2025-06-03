
/**
 * @description Testes unitários para o MultiLLMRouter
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import { multiLLMRouter } from '@/services/MultiLLMRouter';
import type { LLMRequest } from '@/services/MultiLLMRouter';

describe('MultiLLMRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve selecionar provider baseado na tarefa', async () => {
    const request: LLMRequest = {
      prompt: 'Escreva um código em JavaScript',
      taskType: 'coding',
      priority: 'medium'
    };

    const response = await multiLLMRouter.routeRequest(request);
    
    expect(response).toHaveProperty('content');
    expect(response).toHaveProperty('provider');
    expect(response).toHaveProperty('tokensUsed');
    expect(response.fallbackUsed).toBe(false);
  });

  test('deve usar fallback quando provider principal falha', async () => {
    // Simular falha do provider principal
    multiLLMRouter.updateProviderStatus('openai-gpt4o', false);

    const request: LLMRequest = {
      prompt: 'Teste de fallback',
      taskType: 'general',
      priority: 'high'
    };

    const response = await multiLLMRouter.routeRequest(request);
    
    expect(response.provider).not.toBe('OpenAI GPT-4o');
    expect(response.fallbackUsed).toBe(true);
  });

  test('deve retornar estatísticas dos provedores', () => {
    const stats = multiLLMRouter.getProviderStats();
    
    expect(Array.isArray(stats)).toBe(true);
    expect(stats.length).toBeGreaterThan(0);
    
    stats.forEach(stat => {
      expect(stat).toHaveProperty('id');
      expect(stat).toHaveProperty('name');
      expect(stat).toHaveProperty('isAvailable');
      expect(stat).toHaveProperty('reliability');
    });
  });

  test('deve processar fila de requisições', async () => {
    const request: LLMRequest = {
      prompt: 'Teste de fila',
      taskType: 'general',
      priority: 'low'
    };

    const response = await multiLLMRouter.addToQueue(request);
    
    expect(response).toHaveProperty('content');
    expect(response).toHaveProperty('provider');
  });

  test('deve calcular custo baseado em tokens', async () => {
    const request: LLMRequest = {
      prompt: 'Prompt de teste para cálculo de custo',
      taskType: 'general',
      priority: 'medium'
    };

    const response = await multiLLMRouter.routeRequest(request);
    
    expect(response.cost).toBeGreaterThan(0);
    expect(response.tokensUsed).toBeGreaterThan(0);
    expect(response.cost).toBe(response.tokensUsed * expect.any(Number));
  });
});
