
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ConversationCategory } from './useConversationsData';

export function useConversationCategories(
  categories: ConversationCategory[],
  setCategories: React.Dispatch<React.SetStateAction<ConversationCategory[]>>
) {
  const { user } = useAuth();
  const { toast } = useToast();

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

  return {
    createCategory,
  };
}
