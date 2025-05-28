
import { useState, useCallback } from 'react';
import { Conversation, Message } from './useConversationsData';

export interface ConversationState {
  isNavigating: boolean;
  isCreatingNew: boolean;
  isLoadingMessages: boolean;
  lastInteractionTime: string | null;
  hasUnsavedChanges: boolean;
}

export function useConversationsState() {
  const [conversationState, setConversationState] = useState<ConversationState>({
    isNavigating: false,
    isCreatingNew: false,
    isLoadingMessages: false,
    lastInteractionTime: null,
    hasUnsavedChanges: false
  });

  const setNavigating = useCallback((isNavigating: boolean) => {
    setConversationState(prev => ({ ...prev, isNavigating }));
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

  return {
    conversationState,
    setNavigating,
    setCreatingNew,
    setLoadingMessages,
    updateLastInteraction,
    markUnsavedChanges
  };
}
