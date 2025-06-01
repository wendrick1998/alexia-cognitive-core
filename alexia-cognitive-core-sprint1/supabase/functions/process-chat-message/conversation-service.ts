
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
  limit: number = 10
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

  // Organizar mensagens em pares pergunta/resposta (ordem cronológica reversa)
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

export function buildActiveSessionContext(history: ConversationHistory[]): string {
  if (history.length === 0) return '';

  let context = '\n## Histórico da Conversa Atual:\n';
  
  // Reverter para ordem cronológica correta (mais antiga primeiro)
  history.reverse().forEach((interaction, index) => {
    context += `Usuário: ${interaction.user_message}\n`;
    context += `Alex iA: ${interaction.ai_response}\n`;
    if (index < history.length - 1) context += '\n';
  });
  
  context += '\n';
  return context;
}

export function enhanceQueryWithSessionContext(
  currentQuery: string, 
  history: ConversationHistory[]
): string {
  if (history.length === 0) return currentQuery;

  // Detectar perguntas contextuais/de acompanhamento
  const contextualPatterns = [
    /\b(ele|ela|isso|este|esta|aquele|aquela|o mesmo|a mesma|dele|dela)\b/i,
    /\b(e sobre|e quanto a|e o|e a|mais sobre|continue|prossiga)\b/i,
    /\b(quem mais|que mais|onde mais|quando mais|como mais)\b/i,
    /^(e\s+|mais\s+|também\s+)/i,
    /\b(me diga mais|conte mais|explique melhor|detalhe)\b/i
  ];

  const isContextualQuery = contextualPatterns.some(pattern => pattern.test(currentQuery));

  if (isContextualQuery && history.length > 0) {
    const lastInteraction = history[0]; // Mais recente
    console.log(`🔍 Pergunta contextual detectada. Enriquecendo com contexto da sessão.`);
    
    // Combinar pergunta atual com contexto da última interação
    const enhancedQuery = `Contexto anterior: ${lastInteraction.user_message} - ${lastInteraction.ai_response.substring(0, 200)}... | Pergunta atual: ${currentQuery}`;
    console.log(`🔍 Query enriquecida: "${enhancedQuery.substring(0, 150)}..."`);
    return enhancedQuery;
  }

  return currentQuery;
}
