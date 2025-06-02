
import { http, HttpResponse } from 'msw';

// Mock responses para Supabase Edge Functions
export const handlers = [
  // Mock para process-chat-message function
  http.post('*/functions/v1/process-chat-message', async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      response: `Mock response for: ${body.user_message}`,
      context_used: true,
      chunks_found: 2,
      model_used: 'gpt-4o-mini',
      tokens_used: 150
    });
  }),

  // Mock para generate-embeddings function
  http.post('*/functions/v1/generate-embeddings', async ({ request }) => {
    return HttpResponse.json({
      success: true,
      chunks_processed: 5,
      embeddings_created: 5
    });
  }),

  // Mock para semantic search
  http.post('*/functions/v1/cognitive-search', async ({ request }) => {
    const body = await request.json() as any;
    
    return HttpResponse.json({
      results: [
        {
          id: '1',
          content: `Mock search result for: ${body.query}`,
          similarity: 0.95,
          metadata: { source: 'test_document.pdf' }
        }
      ],
      total_results: 1
    });
  }),

  // Mock para Supabase REST API (conversations)
  http.get('*/rest/v1/conversations*', () => {
    return HttpResponse.json([
      {
        id: 'mock-conv-1',
        user_id: 'test-user',
        name: 'Test Conversation',
        message_count: 5,
        is_favorite: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }),

  // Mock para messages
  http.get('*/rest/v1/messages*', () => {
    return HttpResponse.json([
      {
        id: 'mock-msg-1',
        conversation_id: 'mock-conv-1',
        role: 'user',
        content: 'Hello, this is a test message',
        created_at: new Date().toISOString()
      },
      {
        id: 'mock-msg-2',
        conversation_id: 'mock-conv-1',
        role: 'assistant',
        content: 'Hello! This is a mock response.',
        created_at: new Date().toISOString()
      }
    ]);
  }),

  // Mock para memories
  http.get('*/rest/v1/memories*', () => {
    return HttpResponse.json([
      {
        id: 'mock-memory-1',
        user_id: 'test-user',
        content: 'This is a test memory',
        type: 'fact',
        created_at: new Date().toISOString()
      }
    ]);
  }),

  // Mock para documents
  http.get('*/rest/v1/documents*', () => {
    return HttpResponse.json([
      {
        id: 'mock-doc-1',
        user_id: 'test-user',
        name: 'test-document.pdf',
        file_size: 1024,
        processing_status: 'completed',
        created_at: new Date().toISOString()
      }
    ]);
  })
];
