
import { useConversationsData } from './useConversationsData';
import { useConversationsActions } from './useConversationsActions';
import { useConversationCategories } from './useConversationCategories';
import { useConversationFilters } from './useConversationFilters';
import { useConversationsState } from './useConversationsState';
import { useCallback, useRef } from 'react';

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
    markUnsavedChanges,
    clearPendingNavigation
  } = useConversationsState();

  // Referência para evitar navegações duplicadas
  const navigationInProgress = useRef<string | null>(null);

  // Navegação otimizada e segura para conversa específica
  const navigateToConversation = useCallback(async (conversation: any) => {
    // Evitar navegação duplicada ou para a mesma conversa
    if (navigationInProgress.current === conversation.id || 
        currentConversation?.id === conversation.id) {
      console.log(`🚫 Navegação ignorada: já na conversa ${conversation.id}`);
      return;
    }
    
    console.log(`🧭 Iniciando navegação para conversa: ${conversation.id}`);
    navigationInProgress.current = conversation.id;
    
    try {
      setNavigating(true, conversation.id);
      
      // Limpar mensagens atuais imediatamente para UX responsiva
      setMessages([]);
      
      // Definir conversa atual
      setCurrentConversation(conversation);
      
      // Carregar mensagens da nova conversa
      setLoadingMessages(true);
      await loadMessages(conversation.id);
      
      updateLastInteraction();
      console.log(`✅ Navegação concluída para: ${conversation.id}`);
      
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      // Em caso de erro, voltar para estado consistente
      setCurrentConversation(null);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      setNavigating(false);
      navigationInProgress.current = null;
    }
  }, [currentConversation, setCurrentConversation, setMessages, loadMessages, setNavigating, setLoadingMessages, updateLastInteraction]);

  // Criação otimizada de nova conversa com navegação automática
  const createAndNavigateToNewConversation = useCallback(async () => {
    if (conversationState.isCreatingNew) {
      console.log('🚫 Criação já em andamento, ignorando...');
      return;
    }
    
    setCreatingNew(true);
    
    try {
      console.log('🆕 Criando nova conversa e navegando automaticamente...');
      
      // Criar nova conversa
      const newConversation = await createConversation();
      
      if (newConversation) {
        // Limpar estado de mensagens e navegar automaticamente
        setMessages([]);
        setCurrentConversation(newConversation);
        updateLastInteraction();
        
        console.log(`✅ Nova conversa criada e ativada: ${newConversation.id}`);
        return newConversation;
      } else {
        console.error('❌ Falha ao criar nova conversa');
      }
    } catch (error) {
      console.error('❌ Erro ao criar nova conversa:', error);
    } finally {
      setCreatingNew(false);
    }
  }, [conversationState.isCreatingNew, createConversation, setMessages, setCurrentConversation, updateLastInteraction, setCreatingNew]);

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
    markUnsavedChanges,
    clearPendingNavigation
  };
}
