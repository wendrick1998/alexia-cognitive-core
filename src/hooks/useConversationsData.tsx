import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ConversationCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  project_id?: string;
  session_id: string;
  name?: string;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  category_id?: string;
  last_message_preview?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  category?: ConversationCategory;
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
  metadata?: {
    fromCache?: boolean;
    usedFallback?: boolean;
    originalModel?: string;
    currentModel?: string;
    responseTime?: number;
  };
}

export function useConversationsData() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [categories, setCategories] = useState<ConversationCategory[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversation_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) throw error;
      setCategories(data as ConversationCategory[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          category:conversation_categories(*)
        `)
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConversations(data as Conversation[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas",
        variant: "destructive",
      });
    }
  };

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      console.log(`📥 Carregando mensagens para conversa: ${conversationId}`);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log(`✅ ${data.length} mensagens carregadas para a conversa`);
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
  }, [toast]);

  // Carregar dados do usuário quando ele fizer login
  useEffect(() => {
    if (user) {
      loadCategories();
      loadConversations();
    } else {
      // Limpar dados quando usuário sair
      setConversations([]);
      setCategories([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [user]);

  return {
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
  };
}
