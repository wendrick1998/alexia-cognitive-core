
# 📚 Supabase Endpoints Documentation

## Project Information
- **Project ID**: wmxscmwtaqyduotuectx
- **URL**: https://wmxscmwtaqyduotuectx.supabase.co
- **Region**: Auto-assigned

## 🔑 Authentication Endpoints

### User Management
```typescript
// Sign up new user
await supabase.auth.signUp({ email, password })

// Sign in user
await supabase.auth.signIn({ email, password })

// Sign out user
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## 🗄️ Database Tables

### Core Tables

#### `conversations`
- **Purpose**: Store chat conversations
- **RLS**: Enabled (user-scoped)
- **Key Fields**: `id`, `user_id`, `title`, `created_at`

#### `messages`
- **Purpose**: Store individual chat messages
- **RLS**: Enabled (user-scoped)
- **Key Fields**: `id`, `conversation_id`, `role`, `content`, `created_at`

#### `memories`
- **Purpose**: Store user memories and knowledge
- **RLS**: Enabled (user-scoped)
- **Key Fields**: `id`, `user_id`, `content`, `type`, `embedding`

#### `documents`
- **Purpose**: Store uploaded documents
- **RLS**: Enabled (user-scoped)
- **Key Fields**: `id`, `user_id`, `filename`, `content`, `processed_at`

### Analytics Tables

#### `llm_feedback`
- **Purpose**: Store LLM response feedback
- **RLS**: Enabled (user-scoped)
- **Key Fields**: `id`, `rating`, `question`, `answer`, `model_name`

#### `llm_call_logs`
- **Purpose**: Log all LLM API calls
- **RLS**: Enabled (user-scoped)
- **Key Fields**: `id`, `model_name`, `provider`, `tokens_used`, `response_time`

#### `llm_response_cache`
- **Purpose**: Cache semantic responses for performance
- **RLS**: Enabled (user-scoped)
- **Key Fields**: `id`, `question`, `answer`, `embedding`, `task_type`

## 🔧 Edge Functions

### Core Functions

#### `process-chat-message`
- **Purpose**: Process chat messages with LLM integration
- **Endpoint**: `/functions/v1/process-chat-message`
- **Method**: POST
- **Body**: `{ message: string, conversation_id?: string }`

#### `process-document`
- **Purpose**: Process and extract text from uploaded documents
- **Endpoint**: `/functions/v1/process-document`
- **Method**: POST
- **Body**: File upload with metadata

#### `semantic-search`
- **Purpose**: Perform semantic search across memories and documents
- **Endpoint**: `/functions/v1/semantic-search`
- **Method**: POST
- **Body**: `{ query: string, limit?: number }`

### AI/ML Functions

#### `generate-embeddings`
- **Purpose**: Generate embeddings for text content
- **Endpoint**: `/functions/v1/generate-embeddings`
- **Method**: POST
- **Body**: `{ text: string }`

#### `cognitive-search`
- **Purpose**: Advanced cognitive search with context
- **Endpoint**: `/functions/v1/cognitive-search`
- **Method**: POST
- **Body**: `{ query: string, context?: any }`

#### `route-optimal-llm`
- **Purpose**: Route requests to optimal LLM based on task
- **Endpoint**: `/functions/v1/route-optimal-llm`
- **Method**: POST
- **Body**: `{ task_type: string, content: string }`

## 📊 Common Query Patterns

### Fetch User Conversations
```typescript
const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

### Search Memories
```typescript
const { data: memories } = await supabase
  .from('memories')
  .select('*')
  .eq('user_id', user.id)
  .textSearch('content', query);
```

### Log LLM Call
```typescript
const { error } = await supabase
  .from('llm_call_logs')
  .insert({
    user_id: user.id,
    model_name: 'gpt-4',
    provider: 'openai',
    tokens_used: 150,
    response_time: 1200
  });
```

## 🔒 Row Level Security (RLS) Policies

All tables implement user-scoped RLS policies:

- **SELECT**: Users can only view their own records
- **INSERT**: Users can only create records for themselves
- **UPDATE**: Users can only update their own records
- **DELETE**: Users can only delete their own records

## 🚀 Performance Optimizations

### Indexes
- `conversations`: Index on `user_id`, `created_at`
- `messages`: Index on `conversation_id`, `created_at`
- `memories`: Vector index on `embedding` for similarity search
- `documents`: Index on `user_id`, `processed_at`

### Caching
- Semantic cache for frequently asked questions
- Response caching for repeated document queries
- Memory activation optimization for faster retrieval

## 📝 Usage Examples

### Complete Chat Flow
```typescript
// 1. Create conversation
const { data: conversation } = await supabase
  .from('conversations')
  .insert({ user_id: user.id, title: 'New Chat' })
  .select()
  .single();

// 2. Process message via Edge Function
const response = await supabase.functions.invoke('process-chat-message', {
  body: { 
    message: 'Hello!', 
    conversation_id: conversation.id 
  }
});

// 3. Store messages
await supabase.from('messages').insert([
  { 
    conversation_id: conversation.id, 
    role: 'user', 
    content: 'Hello!' 
  },
  { 
    conversation_id: conversation.id, 
    role: 'assistant', 
    content: response.data.answer 
  }
]);
```

---

**Last Updated**: December 2024
**Version**: 1.0
**Maintained by**: Alex iA Development Team
