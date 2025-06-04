
/**
 * Utility for retry with exponential backoff for LLM API calls
 * Provides resilience against temporary failures, rate limits, and network issues
 */

export interface RetryOptions {
  retries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: Error) => boolean;
}

export class RetryError extends Error {
  constructor(message: string, public lastError: Error, public attempts: number) {
    super(message);
    this.name = 'RetryError';
  }
}

export async function callWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = (error) => {
      // Retry on network errors, rate limits, and server errors
      return error.message.includes('fetch') || 
             error.message.includes('429') || 
             error.message.includes('500') ||
             error.message.includes('502') ||
             error.message.includes('503') ||
             error.message.includes('timeout');
    }
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 LLM Call attempt ${attempt + 1}/${retries + 1}`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ LLM Call attempt ${attempt + 1} failed:`, error.message);

      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === retries || !shouldRetry(lastError)) {
        break;
      }

      // Calculate delay with jitter to avoid thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const currentDelay = Math.min(delay + jitter, maxDelay);
      
      console.log(`⏳ Retrying in ${currentDelay / 1000}s... (attempt ${attempt + 2}/${retries + 1})`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw new RetryError(
    `LLM call failed after ${retries + 1} attempts`,
    lastError!,
    retries + 1
  );
}

/**
 * Specialized retry for OpenAI API calls
 */
export async function callOpenAIWithRetry(
  apiCall: () => Promise<Response>,
  options: RetryOptions = {}
): Promise<any> {
  return callWithRetry(async () => {
    const response = await apiCall();
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Enhanced error handling for different HTTP status codes
      switch (response.status) {
        case 429:
          throw new Error(`Rate limit exceeded: ${errorText}`);
        case 401:
          throw new Error(`Authentication failed: ${errorText}`);
        case 403:
          throw new Error(`Access forbidden: ${errorText}`);
        case 500:
        case 502:
        case 503:
          throw new Error(`Server error (${response.status}): ${errorText}`);
        default:
          throw new Error(`API error (${response.status}): ${errorText}`);
      }
    }
    
    return response.json();
  }, {
    retries: 3,
    initialDelay: 1000,
    shouldRetry: (error) => {
      // Retry on rate limits and server errors, but not on auth errors
      return error.message.includes('429') || 
             error.message.includes('500') ||
             error.message.includes('502') ||
             error.message.includes('503') ||
             error.message.includes('timeout');
    },
    ...options
  });
}

/**
 * Circuit breaker pattern for LLM calls
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private resetTimeout = 60000 // 1 minute
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Circuit breaker transitioning to HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN - too many failures');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
    console.log('✅ Circuit breaker reset to CLOSED');
  }

  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(`🚨 Circuit breaker opened after ${this.failures} failures`);
    }
  }

  getState() {
    return this.state;
  }
}
