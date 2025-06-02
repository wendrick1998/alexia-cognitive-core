
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AlexChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  updated_at: string;
  llm_model?: string;
  tokens_used?: number;
  metadata?: any;
}

export interface AlexChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  last_message_preview?: string;
  is_favorite?: boolean;
  pinned?: boolean;
  message_count?: number;
}

export function useAlexChatSessions() {
  const [sessions, setSessions] = useState<AlexChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AlexChatSession | null>(null);
  const [messages, setMessages] = useState<AlexChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sessões",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createSession = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'Nova Conversa'
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadSessions();
      return data;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar nova sessão",
        variant: "destructive",
      });
      return null;
    }
  }, [user, loadSessions, toast]);

  const selectSession = useCallback(async (session: AlexChatSession) => {
    setCurrentSession(session);
    
    try {
      setMessagesLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession) return false;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSession.id,
          role: 'user',
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      
      setMessages(prev => [...prev, data]);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }, [currentSession]);

  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('id', sessionId);

      if (error) throw error;
      await loadSessions();
    } catch (error) {
      console.error('Erro ao renomear sessão:', error);
    }
  }, [loadSessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      
      await loadSessions();
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
    }
  }, [currentSession, loadSessions]);

  const toggleFavorite = useCallback(async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const { error } = await supabase
        .from('chat_sessions')
        .update({ is_favorite: !session.is_favorite })
        .eq('id', sessionId);

      if (error) throw error;
      await loadSessions();
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  }, [sessions, loadSessions]);

  const togglePin = useCallback(async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const { error } = await supabase
        .from('chat_sessions')
        .update({ pinned: !session.pinned })
        .eq('id', sessionId);

      if (error) throw error;
      await loadSessions();
    } catch (error) {
      console.error('Erro ao alterar pin:', error);
    }
  }, [sessions, loadSessions]);

  const resetAllSessions = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
      
      toast({
        title: "Reset Completo",
        description: "Todas as conversas foram removidas",
      });
    } catch (error) {
      console.error('Erro ao resetar sessões:', error);
    }
  }, [user, toast]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    messagesLoading,
    createSession,
    selectSession,
    sendMessage,
    renameSession,
    deleteSession,
    toggleFavorite,
    togglePin,
    resetAllSessions,
    loadSessions
  };
}
