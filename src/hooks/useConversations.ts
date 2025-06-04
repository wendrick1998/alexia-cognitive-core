
import { useState } from 'react';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    fromCache?: boolean;
    usedFallback?: boolean;
    originalModel?: string;
    currentModel?: string;
    responseTime?: number;
  };
}

export interface Conversation {
  id: string;
  name?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  last_message_preview?: string;
  message_count?: number;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationState, setConversationState] = useState({
    isCreating: false,
    isNavigating: false,
    isLoading: false
  });

  const createAndNavigateToNewConversation = async (): Promise<Conversation | null> => {
    setConversationState(prev => ({ ...prev, isCreating: true }));
    
    // Simular criação de nova conversa
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      name: 'Nova Conversa',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user_1',
      message_count: 0
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
    setMessages([]);
    
    setConversationState(prev => ({ ...prev, isCreating: false }));
    return newConversation;
  };

  const navigateToConversation = async (conversation: Conversation) => {
    setConversationState(prev => ({ ...prev, isNavigating: true }));
    setCurrentConversation(conversation);
    setMessages([]); // Aqui você carregaria as mensagens da conversa
    setConversationState(prev => ({ ...prev, isNavigating: false }));
  };

  const updateConversationTimestamp = async (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, updated_at: new Date().toISOString() }
          : conv
      )
    );
  };

  return {
    conversations,
    currentConversation,
    messages,
    conversationState,
    setMessages,
    createAndNavigateToNewConversation,
    navigateToConversation,
    updateConversationTimestamp
  };
};
