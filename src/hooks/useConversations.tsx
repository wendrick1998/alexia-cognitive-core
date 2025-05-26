
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  user_id: string;
  project_id?: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  llm_used?: string;
  created_at: string;
  updated_at: string;
  tokens_used?: number;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createConversation = async (projectId?: string): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          project_id: projectId,
          session_id: crypto.randomUUID()
        })
        .select()
        .single();

      if (error) throw error;

      const newConversation = data as Conversation;
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova conversa",
        variant: "destructive",
      });
      return null;
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentOrCreateConversation = async (projectId?: string): Promise<Conversation | null> => {
    if (currentConversation) {
      return currentConversation;
    }
    return await createConversation(projectId);
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    createConversation,
    loadMessages,
    getCurrentOrCreateConversation,
    setCurrentConversation
  };
}
