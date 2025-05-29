
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAutoNaming() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateConversationName = async (messageContent: string): Promise<string> => {
    if (!messageContent.trim()) return 'Nova Conversa';

    setIsGenerating(true);
    
    try {
      // Usar primeiras palavras como fallback inteligente
      const words = messageContent.trim().split(' ').slice(0, 6);
      let name = words.join(' ');
      
      // Remover caracteres especiais e limitar tamanho
      name = name.replace(/[^\w\s]/gi, '').trim();
      
      if (name.length > 50) {
        name = name.substring(0, 47) + '...';
      }
      
      if (name.length < 5) {
        name = 'Nova Conversa';
      }

      // Capitalizar primeira letra
      name = name.charAt(0).toUpperCase() + name.slice(1);
      
      return name;
    } catch (error) {
      console.error('Erro ao gerar nome da conversa:', error);
      return 'Nova Conversa';
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateConversationName,
    isGenerating
  };
}
