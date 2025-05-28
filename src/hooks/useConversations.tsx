
import { useState, useEffect } from 'react';
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
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [categories, setCategories] = useState<ConversationCategory[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const createConversation = async (projectId?: string, categoryId?: string): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          project_id: projectId,
          category_id: categoryId,
          session_id: crypto.randomUUID(),
          name: `Nova Conversa`,
          message_count: 0
        })
        .select(`
          *,
          category:conversation_categories(*)
        `)
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

  const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, ...updates }
            : conv
        )
      );

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Sucesso",
        description: "Conversa atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conversa",
        variant: "destructive",
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }

      toast({
        title: "Sucesso",
        description: "Conversa excluída com sucesso",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa",
        variant: "destructive",
      });
    }
  };

  const archiveConversation = async (conversationId: string) => {
    await updateConversation(conversationId, { is_archived: true });
  };

  const favoriteConversation = async (conversationId: string, isFavorite: boolean) => {
    await updateConversation(conversationId, { is_favorite: isFavorite });
  };

  const createCategory = async (name: string, color: string = '#3B82F6', icon: string = 'folder') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversation_categories')
        .insert({
          user_id: user.id,
          name,
          color,
          icon,
          position: categories.length
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory = data as ConversationCategory;
      setCategories(prev => [...prev, newCategory]);
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria",
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

  const updateConversationTimestamp = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, updated_at: new Date().toISOString() }
            : conv
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
    } catch (error) {
      console.error('Error updating conversation timestamp:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      conv.name?.toLowerCase().includes(query) ||
      conv.last_message_preview?.toLowerCase().includes(query) ||
      conv.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    if (user) {
      loadCategories();
      loadConversations();
    }
  }, [user]);

  return {
    conversations: filteredConversations,
    categories,
    currentConversation,
    messages,
    loading,
    searchQuery,
    setSearchQuery,
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
    setCurrentConversation,
    updateConversationTimestamp
  };
}
