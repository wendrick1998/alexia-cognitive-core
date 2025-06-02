
// Mock completo do cliente Supabase para testes
export const mockSupabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          },
          access_token: 'mock-token'
        }
      },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' }, session: {} },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  },
  
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  
  functions: {
    invoke: jest.fn().mockResolvedValue({
      data: { response: 'Mock function response' },
      error: null
    })
  },

  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path: 'mock-file-path' },
        error: null
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://mock-url.com/file' }
      })
    })
  }
};

// Mock das queries do Tanstack Query
export const mockQueryResults = {
  conversations: {
    data: [
      {
        id: 'mock-conv-1',
        name: 'Test Conversation',
        message_count: 3,
        is_favorite: false,
        created_at: new Date().toISOString()
      }
    ],
    isLoading: false,
    error: null
  },
  
  messages: {
    data: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Test message',
        created_at: new Date().toISOString()
      }
    ],
    isLoading: false,
    error: null
  },
  
  memories: {
    data: [
      {
        id: 'memory-1',
        content: 'Test memory',
        type: 'fact',
        created_at: new Date().toISOString()
      }
    ],
    isLoading: false,
    error: null
  }
};
