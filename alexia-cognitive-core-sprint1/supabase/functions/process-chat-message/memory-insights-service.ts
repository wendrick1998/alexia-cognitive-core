
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { generateEmbedding } from './openai-service.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function saveConversationInsight(
  userMessage: string,
  aiResponse: string,
  userId: string,
  conversationId: string
): Promise<void> {
  try {
    // Determinar se vale a pena salvar como insight
    const shouldSave = await shouldSaveAsInsight(userMessage, aiResponse);
    
    if (!shouldSave) {
      console.log('💭 Interação não qualificada para salvar como insight cognitivo');
      return;
    }

    console.log('🧠 Salvando insight derivado da conversa...');

    // Criar o conteúdo do insight
    const insightContent = `Conversa sobre: ${userMessage}\nConclusão/Insight: ${aiResponse}`;
    
    // Gerar embedding para o insight
    const embedding = await generateEmbedding(insightContent);

    // Salvar na tabela memory_embeddings
    const { error } = await supabase
      .from('memory_embeddings')
      .insert({
        content: insightContent,
        source: 'chat_derived_insight',
        user_id: userId,
        metadata: {
          conversation_id: conversationId,
          original_question: userMessage,
          derived_at: new Date().toISOString(),
          insight_type: 'conversation_synthesis'
        },
        embedding: JSON.stringify(embedding)
      });

    if (error) {
      console.error('Erro ao salvar insight cognitivo:', error);
    } else {
      console.log('✅ Insight cognitivo salvo com sucesso');
    }
  } catch (error) {
    console.error('Erro no processo de salvamento de insight:', error);
  }
}

async function shouldSaveAsInsight(userMessage: string, aiResponse: string): Promise<boolean> {
  // Critérios para salvar como insight:
  // 1. Resposta contém síntese de múltiplas fontes
  // 2. Pergunta envolve análise ou comparação
  // 3. Resposta contém conclusões derivadas
  
  const analyticalPatterns = [
    /compare|comparação|diferença|similar/i,
    /análise|análise/i,
    /resumo|síntese/i,
    /conclusão|concluir/i,
    /relaciona|relação/i
  ];

  const responseIndicatesInsight = [
    /com base nos documentos.*podemos concluir/i,
    /a análise dos dados mostra/i,
    /comparando.*com/i,
    /a síntese das informações/i
  ];

  const hasAnalyticalQuestion = analyticalPatterns.some(pattern => pattern.test(userMessage));
  const hasInsightfulResponse = responseIndicatesInsight.some(pattern => pattern.test(aiResponse)) ||
                               aiResponse.length > 300; // Respostas mais longas tendem a ter mais síntese

  return hasAnalyticalQuestion || hasInsightfulResponse;
}
