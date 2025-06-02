
import { faker } from '@faker-js/faker';

// Factory para criar dados de teste consistentes
export const createMockConversation = (overrides = {}) => ({
  id: faker.string.uuid(),
  user_id: 'test-user',
  session_id: faker.string.uuid(),
  name: faker.lorem.words(3),
  tags: [faker.word.noun(), faker.word.noun()],
  is_favorite: faker.datatype.boolean(),
  is_archived: false,
  message_count: faker.number.int({ min: 1, max: 10 }),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides
});

export const createMockMessage = (overrides = {}) => ({
  id: faker.string.uuid(),
  conversation_id: faker.string.uuid(),
  role: faker.helpers.arrayElement(['user', 'assistant']) as 'user' | 'assistant',
  content: faker.lorem.paragraphs(2),
  llm_used: 'gpt-4o-mini',
  tokens_used: faker.number.int({ min: 50, max: 500 }),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides
});

export const createMockMemory = (overrides = {}) => ({
  id: faker.string.uuid(),
  user_id: 'test-user',
  content: faker.lorem.paragraph(),
  type: faker.helpers.arrayElement(['fact', 'preference', 'context']) as 'fact' | 'preference' | 'context',
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides
});

export const createMockDocument = (overrides = {}) => ({
  id: faker.string.uuid(),
  user_id: 'test-user',
  name: faker.system.fileName({ extensionCount: 1 }),
  file_size: faker.number.int({ min: 1024, max: 1048576 }),
  file_type: faker.helpers.arrayElement(['application/pdf', 'text/plain', 'application/docx']),
  processing_status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed']),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  created_at: faker.date.recent().toISOString(),
  ...overrides
});

// Helper para criar conjuntos de dados relacionados
export const createConversationWithMessages = (messageCount = 3) => {
  const conversation = createMockConversation();
  const messages = Array.from({ length: messageCount }, (_, index) =>
    createMockMessage({
      conversation_id: conversation.id,
      role: index % 2 === 0 ? 'user' : 'assistant'
    })
  );
  
  return { conversation, messages };
};
