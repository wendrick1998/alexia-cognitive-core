
/**
 * @file MultiLLMRouter.ts
 * @description Sistema de roteamento inteligente entre múltiplos LLMs
 * @author Alex iA System
 */

export interface LLMProvider {
  id: string;
  name: string;
  endpoint: string;
  models: string[];
  costPerToken: number;
  maxTokens: number;
  responseTime: number;
  reliability: number;
  isAvailable: boolean;
}

export interface LLMRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  taskType: 'general' | 'coding' | 'analysis' | 'creative' | 'technical';
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: number;
  responseTime: number;
  cost: number;
  confidence: number;
}

class MultiLLMRouter {
  private providers: Map<string, LLMProvider> = new Map();
  private fallbackOrder: string[] = [];
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.initializeProviders();
    this.setupFallbackOrder();
  }

  private initializeProviders() {
    // OpenAI GPT-4
    this.providers.set('openai-gpt4', {
      id: 'openai-gpt4',
      name: 'OpenAI GPT-4',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o'],
      costPerToken: 0.00003,
      maxTokens: 8192,
      responseTime: 2000,
      reliability: 0.98,
      isAvailable: true
    });

    // OpenAI GPT-3.5
    this.providers.set('openai-gpt35', {
      id: 'openai-gpt35',
      name: 'OpenAI GPT-3.5',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
      costPerToken: 0.000002,
      maxTokens: 4096,
      responseTime: 1000,
      reliability: 0.95,
      isAvailable: true
    });

    // Claude (Anthropic)
    this.providers.set('claude', {
      id: 'claude',
      name: 'Claude',
      endpoint: 'https://api.anthropic.com/v1/messages',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      costPerToken: 0.000015,
      maxTokens: 4096,
      responseTime: 1500,
      reliability: 0.96,
      isAvailable: true
    });

    // DeepSeek
    this.providers.set('deepseek', {
      id: 'deepseek',
      name: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      models: ['deepseek-chat', 'deepseek-coder'],
      costPerToken: 0.000001,
      maxTokens: 4096,
      responseTime: 3000,
      reliability: 0.92,
      isAvailable: true
    });

    // Groq (rápido)
    this.providers.set('groq', {
      id: 'groq',
      name: 'Groq',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      models: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
      costPerToken: 0.0000005,
      maxTokens: 4096,
      responseTime: 500,
      reliability: 0.90,
      isAvailable: true
    });
  }

  private setupFallbackOrder() {
    this.fallbackOrder = [
      'openai-gpt4',
      'claude',
      'openai-gpt35',
      'deepseek',
      'groq'
    ];
  }

  public async routeRequest(request: LLMRequest): Promise<LLMResponse> {
    const selectedProvider = this.selectOptimalProvider(request);
    
    try {
      return await this.executeRequest(selectedProvider, request);
    } catch (error) {
      console.warn(`Provider ${selectedProvider} failed, trying fallback...`);
      return await this.executeFallback(request, selectedProvider);
    }
  }

  private selectOptimalProvider(request: LLMRequest): string {
    const candidates = Array.from(this.providers.values())
      .filter(p => p.isAvailable && !this.isRateLimited(p.id))
      .sort((a, b) => this.calculateScore(b, request) - this.calculateScore(a, request));

    if (candidates.length === 0) {
      throw new Error('No available providers');
    }

    return candidates[0].id;
  }

  private calculateScore(provider: LLMProvider, request: LLMRequest): number {
    let score = 0;

    // Prioridade baseada no tipo de tarefa
    switch (request.taskType) {
      case 'coding':
        if (provider.id === 'deepseek' || provider.id === 'openai-gpt4') score += 30;
        break;
      case 'creative':
        if (provider.id === 'claude' || provider.id === 'openai-gpt4') score += 30;
        break;
      case 'analysis':
        if (provider.id === 'openai-gpt4' || provider.id === 'claude') score += 30;
        break;
      case 'general':
        if (provider.id === 'openai-gpt35' || provider.id === 'groq') score += 20;
        break;
    }

    // Prioridade baseada na urgência
    switch (request.priority) {
      case 'critical':
        score += (1 / provider.responseTime) * 1000; // Velocidade crítica
        break;
      case 'high':
        score += provider.reliability * 50;
        break;
      case 'medium':
        score += (1 / provider.costPerToken) * 10; // Custo moderado
        break;
      case 'low':
        score += (1 / provider.costPerToken) * 20; // Priorizar custo baixo
        break;
    }

    // Confiabilidade sempre importa
    score += provider.reliability * 10;

    return score;
  }

  private async executeRequest(providerId: string, request: LLMRequest): Promise<LLMResponse> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const startTime = Date.now();
    
    // Simular chamada para a API (em produção, fazer chamada real)
    await new Promise(resolve => setTimeout(resolve, provider.responseTime));
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const tokensUsed = Math.ceil(request.prompt.length / 4) + 150; // Estimativa
    
    return {
      content: `Resposta do ${provider.name} para: ${request.prompt.substring(0, 50)}...`,
      provider: provider.name,
      model: provider.models[0],
      tokensUsed,
      responseTime,
      cost: tokensUsed * provider.costPerToken,
      confidence: provider.reliability
    };
  }

  private async executeFallback(request: LLMRequest, failedProvider: string): Promise<LLMResponse> {
    const remainingProviders = this.fallbackOrder.filter(id => 
      id !== failedProvider && 
      this.providers.get(id)?.isAvailable &&
      !this.isRateLimited(id)
    );

    for (const providerId of remainingProviders) {
      try {
        const response = await this.executeRequest(providerId, request);
        response.confidence *= 0.9; // Reduzir confiança por ser fallback
        return response;
      } catch (error) {
        console.warn(`Fallback provider ${providerId} also failed`);
        continue;
      }
    }

    throw new Error('All providers failed');
  }

  private isRateLimited(providerId: string): boolean {
    const limit = this.rateLimits.get(providerId);
    if (!limit) return false;
    
    const now = Date.now();
    if (now > limit.resetTime) {
      this.rateLimits.delete(providerId);
      return false;
    }
    
    return limit.count >= 100; // Limite de 100 requests por minuto
  }

  public updateProviderStatus(providerId: string, isAvailable: boolean, responseTime?: number) {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.isAvailable = isAvailable;
      if (responseTime) {
        provider.responseTime = responseTime;
      }
    }
  }

  public getProviderStats() {
    return Array.from(this.providers.values()).map(p => ({
      id: p.id,
      name: p.name,
      isAvailable: p.isAvailable,
      reliability: p.reliability,
      responseTime: p.responseTime,
      costPerToken: p.costPerToken
    }));
  }
}

export const multiLLMRouter = new MultiLLMRouter();
