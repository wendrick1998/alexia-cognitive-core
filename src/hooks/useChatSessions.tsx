
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  auto_title: boolean;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  is_favorite: boolean;
  message_count: number;
  last_message_preview?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  tokens_used?: number;
  llm_model?: string;
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Carregar todas as sessões do usuário
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
        description: "Não foi possível carregar as conversas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Carregar mensagens de uma sessão específica
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setMessagesLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);

  // Criar nova sessão
  const createSession = useCallback(async (): Promise<ChatSession | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'Novo Chat',
          auto_title: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession = data as ChatSession;
      setSessions(prev => [newSession, ...prev]);
      
      return newSession;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar nova conversa",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Selecionar sessão atual
  const selectSession = useCallback(async (session: ChatSession) => {
    setCurrentSession(session);
    await loadMessages(session.id);
  }, [loadMessages]);

  // Enviar mensagem
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!currentSession || !user) return false;

    try {
      // Adicionar mensagem do usuário temporariamente
      const tempUserMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        session_id: currentSession.id,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, tempUserMessage]);

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke('process-chat-message-yaa', {
        body: {
          session_id: currentSession.id,
          user_message: content,
          user_id: user.id,
        }
      });

      if (error) throw error;

      // Remover mensagem temporária e recarregar mensagens atualizadas
      await loadMessages(currentSession.id);

      // Atualizar lista de sessões para refletir mudanças
      await loadSessions();

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Remover mensagem temporária em caso de erro
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
      return false;
    }
  }, [currentSession, user, toast, loadMessages, loadSessions]);

  // Renomear sessão
  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          title: newTitle, 
          auto_title: false, // Desabilitar auto-renomeação
          updated_at: new Date().toISOString() 
        })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle, auto_title: false } : s
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle, auto_title: false } : null);
      }

      toast({
        title: "Sucesso",
        description: "Conversa renomeada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao renomear sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renomear a conversa",
        variant: "destructive",
      });
    }
  }, [currentSession, toast]);

  // Excluir sessão
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }

      toast({
        title: "Sucesso",
        description: "Conversa excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa",
        variant: "destructive",
      });
    }
  }, [currentSession, toast]);

  // Favoritar/desfavoritar sessão
  const toggleFavorite = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          is_favorite: !session.is_favorite,
          updated_at: new Date().toISOString() 
        })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, is_favorite: !s.is_favorite } : s
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, is_favorite: !session.is_favorite } : null);
      }
    } catch (error) {
      console.error('Erro ao favoritar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível favoritar a conversa",
        variant: "destructive",
      });
    }
  }, [sessions, currentSession, toast]);

  // Carregar sessões quando usuário mudar
  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
    }
  }, [user, loadSessions]);

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
    loadSessions,
  };
}
