
import { useConversationsData } from './useConversationsData';
import { useConversationsActions } from './useConversationsActions';
import { useConversationCategories } from './useConversationCategories';
import { useConversationFilters } from './useConversationFilters';

export * from './useConversationsData';

export function useConversations() {
  const {
    conversations,
    categories,
    currentConversation,
    messages,
    loading,
    setConversations,
    setCategories,
    setCurrentConversation,
    setMessages,
    loadCategories,
    loadConversations,
    loadMessages,
  } = useConversationsData();

  const {
    createConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    favoriteConversation,
    getCurrentOrCreateConversation,
    updateConversationTimestamp,
  } = useConversationsActions(
    setConversations,
    setCurrentConversation,
    setMessages,
    currentConversation
  );

  const { createCategory } = useConversationCategories(categories, setCategories);

  const {
    searchQuery,
    setSearchQuery,
    filteredConversations,
  } = useConversationFilters(conversations);

  return {
    conversations: filteredConversations,
    categories,
    currentConversation,
    messages,
    loading,
    searchQuery,
    setSearchQuery,
    setMessages,
    setCurrentConversation,
    loadConversations,
    loadCategories,
    createConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    favoriteConversation,
    createCategory,
    loadMessages,
    getCurrentOrCreateConversation,
    updateConversationTimestamp
  };
}
