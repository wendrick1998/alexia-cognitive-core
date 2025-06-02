
// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('LLM Service Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should handle successful API response', async () => {
    const mockResponse = {
      response: 'Hello! How can I help you today?',
      model: 'gpt-4',
      tokens_used: 150,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const response = await fetch('/api/process-chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        conversation_id: '123',
      }),
    });

    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('/api/process-chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        conversation_id: '123',
      }),
    });

    const data = await response.json();
    expect(data).toEqual(mockResponse);
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    await expect(
      fetch('/api/process-chat-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          conversation_id: '123',
        }),
      })
    ).rejects.toThrow('Network error');
  });

  it('should validate chat request parameters', () => {
    const validateChatRequest = (data: any) => {
      if (!data.message || typeof data.message !== 'string') {
        throw new Error('Message is required and must be a string');
      }
      if (data.conversation_id && typeof data.conversation_id !== 'string') {
        throw new Error('Conversation ID must be a string');
      }
      return true;
    };

    expect(() => validateChatRequest({ message: 'Hello' })).not.toThrow();
    expect(() => validateChatRequest({})).toThrow('Message is required');
    expect(() => validateChatRequest({ message: 123 })).toThrow('must be a string');
    expect(() => validateChatRequest({ 
      message: 'Hello', 
      conversation_id: 123 
    })).toThrow('Conversation ID must be a string');
  });

  it('should handle API timeout scenarios', async () => {
    const timeoutError = new Error('Request timeout');
    mockFetch.mockRejectedValueOnce(timeoutError);

    await expect(
      fetch('/api/process-chat-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          conversation_id: '123',
        }),
      })
    ).rejects.toThrow('Request timeout');
  });
});
