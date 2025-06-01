
export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  metadata: any;
  similarity: number;
  document_name?: string;
}

export interface MemoryChunk {
  id: string;
  user_id: string;
  content: string;
  source: string;
  metadata: any;
  similarity: number;
}

export interface ChatRequest {
  user_message: string;
  user_id: string;
  project_id?: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  context_used: boolean;
  chunks_found: number;
  memories_found: number;
}
