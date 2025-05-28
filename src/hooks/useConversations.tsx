
import { useConversationsData } from './useConversationsData';
import { useConversationsActions } from './useConversationsActions';
import { useConversationCategories } from './useConversationCategories';
import { useConversationFilters } from './useConversationFilters';
import { useConversationsState } from './useConversationsState';
import { useCallback } from 'react';

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

  const {
    conversationState,
    setNavigating,
    setCreatingNew,
    setLoadingMessages,
    updateLastInteraction,
    markUnsavedChanges
  } = useConversationsState();

  // Navegação otimizada para conversa específica
  const navigateToConversation = useCallback(async (conversation: any) => {
    if (currentConversation?.id === conversation.id) return;
    
    setNavigating(true);
    setCurrentConversation(conversation);
    
    try {
      setLoadingMessages(true);
      await loadMessages(conversation.id);
      updateLastInteraction();
    } finally {
      setLoadingMessages(false);
      setNavigating(false);
    }
  }, [currentConversation, setCurrentConversation, loadMessages, setNavigating, setLoadingMessages, updateLastInteraction]);

  // Criação otimizada de nova conversa
  const createAndNavigateToNewConversation = useCallback(async () => {
    setCreatingNew(true);
    
    try {
      console.log('🆕 Criando nova conversa e navegando automaticamente...');
      const newConversation = await createConversation();
      
      if (newConversation) {
        // Limpar estado atual
        setMessages([]);
        setCurrentConversation(newConversation);
        updateLastInteraction();
        console.log(`✅ Nova conversa criada e ativada: ${newConversation.id}`);
        return newConversation;
      }
    } finally {
      setCreatingNew(false);
    }
  }, [createConversation, setMessages, setCurrentConversation, updateLastInteraction, setCreatingNew]);

  return {
    // Dados principais
    conversations: filteredConversations,
    categories,
    currentConversation,
    messages,
    loading,
    
    // Estados de UX
    conversationState,
    
    // Pesquisa
    searchQuery,
    setSearchQuery,
    
    // Ações básicas
    setMessages,
    setCurrentConversation,
    loadConversations,
    loadCategories,
    loadMessages,
    
    // Ações de CRUD
    createConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    favoriteConversation,
    createCategory,
    getCurrentOrCreateConversation,
    updateConversationTimestamp,
    
    // Navegação premium
    navigateToConversation,
    createAndNavigateToNewConversation,
    
    // Controles de estado
    markUnsavedChanges
  };
}
