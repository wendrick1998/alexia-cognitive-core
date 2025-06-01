
export interface ChatRequest {
  user_message: string;
  user_id: string;
  project_id?: string;
  conversation_id?: string;
  force_no_cache?: boolean; // Nova opção para forçar bypass do cache
}

export interface ChatResponse {
  response: string;
  context_used: boolean;
  chunks_found: number;
  memories_found: number;
  cached_response?: boolean; // Nova propriedade para indicar se veio do cache
  cache_similarity?: number; // Similarity score se veio do cache
  processing_time?: number; // Tempo de processamento em ms
  tokens_used?: number; // Tokens utilizados na resposta
}

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  similarity: number;
  document_id: string;
  metadata?: any;
}

export interface MemoryChunk {
  id: string;
  content: string;
  similarity: number;
  source: string;
  metadata?: any;
}

export interface CacheEntry {
  id: string;
  question: string;
  answer: string;
  similarity: number;
  model_name: string;
  provider: string;
  created_at: string;
}
