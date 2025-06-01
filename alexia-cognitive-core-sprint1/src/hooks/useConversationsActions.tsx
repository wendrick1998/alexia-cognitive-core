
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from './useConversationsData';

export function useConversationsActions(
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>,
  setCurrentConversation: React.Dispatch<React.SetStateAction<Conversation | null>>,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  currentConversation: Conversation | null
) {
  const { user } = useAuth();
  const { toast } = useToast();

  const createConversation = async (projectId?: string, categoryId?: string): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      console.log('🔥 Criando nova conversa no backend...');
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          project_id: projectId,
          category_id: categoryId,
          session_id: crypto.randomUUID(),
          name: `Nova Conversa`,
          message_count: 0,
          is_favorite: false,
          is_archived: false,
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          category:conversation_categories(*)
        `)
        .single();

      if (error) throw error;

      const newConversation = data as Conversation;
      console.log(`✅ Nova conversa criada no backend: ${newConversation.id}`);
      
      // Atualizar lista de conversas imediatamente
      setConversations(prev => [newConversation, ...prev]);
      
      // Limpar mensagens e definir como conversa atual
      setMessages([]);
      setCurrentConversation(newConversation);
      
      toast({
        title: "Nova conversa criada",
        description: "Sua nova conversa está pronta para uso!",
      });
      
      return newConversation;
    } catch (error) {
      console.error('❌ Erro ao criar conversa:', error);
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
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, ...updates, updated_at: new Date().toISOString() }
            : conv
        ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, ...updates } : null);
      }

      console.log(`✅ Conversa ${conversationId} atualizada`);
    } catch (error) {
      console.error('❌ Erro ao atualizar conversa:', error);
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
      console.error('❌ Erro ao deletar conversa:', error);
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
      console.error('❌ Erro ao atualizar timestamp:', error);
    }
  };

  return {
    createConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    favoriteConversation,
    getCurrentOrCreateConversation,
    updateConversationTimestamp,
  };
}
