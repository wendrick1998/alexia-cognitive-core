
// Mock para serviços OpenAI e outros LLMs
export const mockOpenAIResponse = {
  id: 'chatcmpl-mock',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-4o-mini',
  choices: [{
    index: 0,
    message: {
      role: 'assistant',
      content: 'This is a mock response from OpenAI'
    },
    finish_reason: 'stop'
  }],
  usage: {
    prompt_tokens: 50,
    completion_tokens: 100,
    total_tokens: 150
  }
};

export const mockLLMService = {
  processMessage: jest.fn().mockResolvedValue({
    response: 'Mock LLM response',
    model_used: 'gpt-4o-mini',
    tokens_used: 150,
    context_used: true
  }),
  
  generateEmbedding: jest.fn().mockResolvedValue([
    0.1, 0.2, 0.3, // ... mock embedding vector
  ]),
  
  semanticSearch: jest.fn().mockResolvedValue([
    {
      content: 'Mock search result',
      similarity: 0.95,
      metadata: { source: 'test.pdf' }
    }
  ])
};
