
import { useState, useCallback } from 'react';
import { Conversation, Message } from './useConversationsData';

export interface ConversationState {
  isNavigating: boolean;
  isCreatingNew: boolean;
  isLoadingMessages: boolean;
  lastInteractionTime: string | null;
  hasUnsavedChanges: boolean;
  pendingConversationId: string | null;
}

export function useConversationsState() {
  const [conversationState, setConversationState] = useState<ConversationState>({
    isNavigating: false,
    isCreatingNew: false,
    isLoadingMessages: false,
    lastInteractionTime: null,
    hasUnsavedChanges: false,
    pendingConversationId: null
  });

  const setNavigating = useCallback((isNavigating: boolean, conversationId?: string) => {
    setConversationState(prev => ({ 
      ...prev, 
      isNavigating,
      pendingConversationId: isNavigating ? (conversationId || null) : null
    }));
  }, []);

  const setCreatingNew = useCallback((isCreatingNew: boolean) => {
    setConversationState(prev => ({ ...prev, isCreatingNew }));
  }, []);

  const setLoadingMessages = useCallback((isLoadingMessages: boolean) => {
    setConversationState(prev => ({ ...prev, isLoadingMessages }));
  }, []);

  const updateLastInteraction = useCallback(() => {
    setConversationState(prev => ({ 
      ...prev, 
      lastInteractionTime: new Date().toISOString(),
      hasUnsavedChanges: false
    }));
  }, []);

  const markUnsavedChanges = useCallback((hasChanges: boolean = true) => {
    setConversationState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
  }, []);

  const clearPendingNavigation = useCallback(() => {
    setConversationState(prev => ({ 
      ...prev, 
      isNavigating: false, 
      pendingConversationId: null 
    }));
  }, []);

  return {
    conversationState,
    setNavigating,
    setCreatingNew,
    setLoadingMessages,
    updateLastInteraction,
    markUnsavedChanges,
    clearPendingNavigation
  };
}
