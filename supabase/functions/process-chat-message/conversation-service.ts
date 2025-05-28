
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export interface ConversationHistory {
  user_message: string;
  ai_response: string;
  timestamp: string;
}

export async function getRecentConversationHistory(
  conversationId: string,
  limit: number = 3
): Promise<ConversationHistory[]> {
  console.log(`🗣️ Recuperando histórico das últimas ${limit} interações da conversa: ${conversationId}`);
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit * 2); // Multiplicar por 2 para garantir pares pergunta/resposta

  if (error) {
    console.error('Erro ao recuperar histórico da conversa:', error);
    return [];
  }

  // Organizar mensagens em pares pergunta/resposta
  const history: ConversationHistory[] = [];
  for (let i = 0; i < messages.length - 1; i += 2) {
    const aiMessage = messages[i];
    const userMessage = messages[i + 1];
    
    if (aiMessage?.role === 'assistant' && userMessage?.role === 'user') {
      history.push({
        user_message: userMessage.content,
        ai_response: aiMessage.content,
        timestamp: userMessage.created_at
      });
    }
  }

  console.log(`📋 Histórico recuperado: ${history.length} interações anteriores`);
  return history.slice(0, limit);
}

export function buildConversationContext(history: ConversationHistory[]): string {
  if (history.length === 0) return '';

  let context = '\n📝 Contexto da Conversa Anterior:\n';
  history.reverse().forEach((interaction, index) => {
    context += `---\n`;
    context += `[Interação ${index + 1}]\n`;
    context += `Usuário: ${interaction.user_message}\n`;
    context += `Alex iA: ${interaction.ai_response.substring(0, 200)}${interaction.ai_response.length > 200 ? '...' : ''}\n`;
  });
  context += '---\n\n';

  return context;
}

export function enhanceQueryWithContext(
  currentQuery: string, 
  history: ConversationHistory[]
): string {
  if (history.length === 0) return currentQuery;

  // Verificar se a pergunta atual é vaga ou contém pronomes/referências
  const vaguePatterns = [
    /\b(ele|ela|isso|este|esta|aquele|aquela|o mesmo|a mesma)\b/i,
    /\b(e sobre|e quanto a|e o|e a)\b/i,
    /\b(quem mais|que mais|onde mais)\b/i,
    /^(e\s+)/i
  ];

  const isVagueQuery = vaguePatterns.some(pattern => pattern.test(currentQuery));

  if (isVagueQuery && history.length > 0) {
    const lastInteraction = history[0];
    console.log(`🔍 Pergunta vaga detectada. Combinando com contexto anterior.`);
    
    // Combinar pergunta atual com contexto da última interação
    const enhancedQuery = `${lastInteraction.user_message} ${currentQuery}`;
    console.log(`🔍 Query aprimorada: "${enhancedQuery}"`);
    return enhancedQuery;
  }

  return currentQuery;
}
