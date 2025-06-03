
/**
 * @file MultiLLMRouter.ts
 * @description Sistema de roteamento inteligente entre múltiplos LLMs com failover automático
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

export type TaskType = 'general' | 'coding' | 'analysis' | 'creative' | 'technical';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

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
  capabilities: TaskType[];
}

export interface LLMRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  priority: Priority;
  taskType: TaskType;
  userId?: string;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed: number;
  responseTime: number;
  cost: number;
  confidence: number;
  fallbackUsed: boolean;
}

export interface ProviderHealth {
  id: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  successRate: number;
  lastCheck: Date;
}

class MultiLLMRouter {
  private providers: Map<string, LLMProvider> = new Map();
  private healthChecks: Map<string, ProviderHealth> = new Map();
  private fallbackOrder: string[] = [];
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private requestQueue: LLMRequest[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializeProviders();
    this.setupFallbackOrder();
    this.startHealthChecks();
  }

  private initializeProviders() {
    // OpenAI GPT-4o
    this.providers.set('openai-gpt4o', {
      id: 'openai-gpt4o',
      name: 'OpenAI GPT-4o',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: ['gpt-4o', 'gpt-4o-mini'],
      costPerToken: 0.00003,
      maxTokens: 4096,
      responseTime: 2000,
      reliability: 0.98,
      isAvailable: true,
      capabilities: ['general', 'coding', 'analysis', 'creative', 'technical']
    });

    // Claude (Anthropic)
    this.providers.set('claude', {
      id: 'claude',
      name: 'Claude',
      endpoint: 'https://api.anthropic.com/v1/messages',
      models: ['claude-3-sonnet', 'claude-3-haiku'],
      costPerToken: 0.000015,
      maxTokens: 4096,
      responseTime: 1800,
      reliability: 0.96,
      isAvailable: true,
      capabilities: ['creative', 'analysis', 'general']
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
      isAvailable: true,
      capabilities: ['general', 'coding']
    });
  }

  private setupFallbackOrder() {
    this.fallbackOrder = ['openai-gpt4o', 'claude', 'groq'];
  }

  private startHealthChecks() {
    setInterval(() => {
      this.checkProviderHealth();
    }, 30000); // Check every 30 seconds
  }

  private async checkProviderHealth() {
    for (const [id, provider] of this.providers) {
      try {
        const start = Date.now();
        // Simular health check (em produção, fazer ping real)
        await new Promise(resolve => setTimeout(resolve, 100));
        const responseTime = Date.now() - start;

        this.healthChecks.set(id, {
          id,
          status: 'healthy',
          responseTime,
          successRate: provider.reliability,
          lastCheck: new Date()
        });
      } catch (error) {
        this.healthChecks.set(id, {
          id,
          status: 'down',
          responseTime: Infinity,
          successRate: 0,
          lastCheck: new Date()
        });
        
        provider.isAvailable = false;
      }
    }
  }

  public async routeRequest(request: LLMRequest): Promise<LLMResponse> {
    const selectedProvider = this.selectOptimalProvider(request);
    
    try {
      const response = await this.executeRequest(selectedProvider, request);
      this.updateProviderStats(selectedProvider, true, response.responseTime);
      return response;
    } catch (error) {
      console.warn(`Provider ${selectedProvider} failed, trying fallback...`);
      this.updateProviderStats(selectedProvider, false);
      return await this.executeFallback(request, selectedProvider);
    }
  }

  private selectOptimalProvider(request: LLMRequest): string {
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.isAvailable && !this.isRateLimited(p.id))
      .filter(p => p.capabilities.includes(request.taskType))
      .sort((a, b) => this.calculateScore(b, request) - this.calculateScore(a, request));

    if (availableProviders.length === 0) {
      // Fallback para qualquer provider disponível
      const anyAvailable = Array.from(this.providers.values())
        .find(p => p.isAvailable);
      
      if (!anyAvailable) {
        throw new Error('No providers available');
      }
      
      return anyAvailable.id;
    }

    return availableProviders[0].id;
  }

  private calculateScore(provider: LLMProvider, request: LLMRequest): number {
    let score = 0;

    // Capability match
    if (provider.capabilities.includes(request.taskType)) {
      score += 50;
    }

    // Priority-based scoring
    switch (request.priority) {
      case 'critical':
        score += provider.reliability * 100;
        score += (1 / provider.responseTime) * 10000;
        break;
      case 'high':
        score += provider.reliability * 80;
        score += (1 / provider.responseTime) * 5000;
        break;
      case 'medium':
        score += provider.reliability * 60;
        score += (1 / provider.costPerToken) * 100;
        break;
      case 'low':
        score += (1 / provider.costPerToken) * 200;
        break;
    }

    // Health bonus
    const health = this.healthChecks.get(provider.id);
    if (health?.status === 'healthy') {
      score += 20;
    } else if (health?.status === 'degraded') {
      score += 5;
    }

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
    const tokensUsed = Math.ceil(request.prompt.length / 4) + 150;
    
    return {
      content: `Resposta do ${provider.name} para: ${request.prompt.substring(0, 50)}...`,
      provider: provider.name,
      model: provider.models[0],
      tokensUsed,
      responseTime,
      cost: tokensUsed * provider.costPerToken,
      confidence: provider.reliability,
      fallbackUsed: false
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
        response.fallbackUsed = true;
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
    
    return limit.count >= 100;
  }

  private updateProviderStats(providerId: string, success: boolean, responseTime?: number) {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    if (!success) {
      provider.reliability = Math.max(0.1, provider.reliability * 0.95);
      provider.isAvailable = provider.reliability > 0.3;
    } else {
      provider.reliability = Math.min(1.0, provider.reliability * 1.01);
      if (responseTime) {
        provider.responseTime = (provider.responseTime + responseTime) / 2;
      }
    }
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
      costPerToken: p.costPerToken,
      capabilities: p.capabilities
    }));
  }

  public getHealthStatus() {
    return Array.from(this.healthChecks.values());
  }

  public addToQueue(request: LLMRequest): Promise<LLMResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ ...request, resolve, reject } as any);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;

    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          const response = await this.routeRequest(request);
          (request as any).resolve(response);
        } catch (error) {
          (request as any).reject(error);
        }
      }
    }

    this.isProcessingQueue = false;
  }
}

export const multiLLMRouter = new MultiLLMRouter();
