
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

  const navigationInProgress = useRef<string | null>(null);

  // Navegação otimizada para conversa específica
  const navigateToConversation = useCallback(async (conversation: any) => {
    if (navigationInProgress.current === conversation.id || 
        currentConversation?.id === conversation.id) {
      console.log(`🚫 Navegação ignorada: já na conversa ${conversation.id}`);
      return;
    }
    
    console.log(`🧭 Navegando para conversa: ${conversation.id}`);
    navigationInProgress.current = conversation.id;
    
    try {
      setNavigating(true, conversation.id);
      
      // Definir conversa atual imediatamente
      setCurrentConversation(conversation);
      
      // Limpar mensagens atuais
      setMessages([]);
      
      // Carregar mensagens da conversa
      setLoadingMessages(true);
      await loadMessages(conversation.id);
      
      updateLastInteraction();
      console.log(`✅ Navegação concluída para: ${conversation.id}`);
      
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      setCurrentConversation(null);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
      setNavigating(false);
      navigationInProgress.current = null;
    }
  }, [currentConversation, setCurrentConversation, setMessages, loadMessages, setNavigating, setLoadingMessages, updateLastInteraction]);

  // ✅ FUNÇÃO PRINCIPAL - Nova Conversa com UX Premium
  const createAndNavigateToNewConversation = useCallback(async () => {
    if (conversationState.isCreatingNew) {
      console.log('🚫 Criação já em andamento, ignorando...');
      return null;
    }
    
    console.log('🔥 INICIANDO NOVA CONVERSA - UX PREMIUM');
    setCreatingNew(true);
    
    try {
      // 1. Criar conversa imediatamente no backend
      const newConversation = await createConversation();
      
      if (newConversation) {
        console.log(`✅ Nova conversa criada: ${newConversation.id}`);
        
        // 2. Limpar ambiente de chat e abrir conversa nova
        setMessages([]);
        setCurrentConversation(newConversation);
        
        // 3. Atualizar interação
        updateLastInteraction();
        
        console.log('🎯 NOVA CONVERSA PRONTA PARA USO!');
        return newConversation;
      } else {
        console.error('❌ Falha ao criar nova conversa');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao criar nova conversa:', error);
      return null;
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
    
    // 🔥 NAVEGAÇÃO PREMIUM
    navigateToConversation,
    createAndNavigateToNewConversation,
    
    // Controles de estado
    markUnsavedChanges,
    clearPendingNavigation
  };
}
