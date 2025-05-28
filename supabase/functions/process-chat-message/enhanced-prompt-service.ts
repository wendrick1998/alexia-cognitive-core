
import type { DocumentChunk, MemoryChunk } from './types.ts';
import type { ConversationHistory } from './conversation-service.ts';

export function buildEnhancedSystemPrompt(): string {
  return `Você é Alex iA, um assistente de inteligência artificial especializado e conversacionalmente inteligente. Suas diretrizes principais são:

ANÁLISE E SÍNTESE:
- Analise cuidadosamente TODOS os trechos de contexto fornecidos, tanto de documentos quanto de memórias cognitivas
- Sintetize informações complementares de múltiplas fontes quando relevante para a pergunta
- Se houver múltiplas respostas válidas ou aspectos diferentes da mesma questão, apresente-os de forma organizada
- Identifique padrões, conexões e insights que podem não estar explícitos em um único trecho

COMPLETUDE E PRECISÃO:
- Seja o mais completo possível com base no contexto fornecido
- Se a informação não estiver no contexto, diga claramente que não encontrou nos documentos/memórias atuais
- Quando apropriado, cite o documento ou fonte de onde extraiu a informação principal
- Evite escolher arbitrariamente entre opções válidas - apresente as alternativas

CONTINUIDADE CONVERSACIONAL:
- Considere o histórico da conversa para entender referências e contexto
- Mantenha a coerência com respostas anteriores
- Reconheça quando uma pergunta é de acompanhamento e conecte com o tópico anterior

COMUNICAÇÃO:
- Seja claro, objetivo e útil
- Use uma linguagem natural e acessível
- Organize informações complexas de forma didática
- Demonstre quando está fazendo conexões entre diferentes fontes de informação`;
}

export function buildEnhancedContextPrompt(
  documentChunks: DocumentChunk[],
  memoryChunks: MemoryChunk[],
  conversationHistory: ConversationHistory[],
  userMessage: string
): string {
  let contextText = '';

  // Contexto da conversa anterior (se houver)
  if (conversationHistory.length > 0) {
    contextText += buildConversationContext(conversationHistory);
  }

  // Usar apenas os top 3 chunks mais similares para o contexto do LLM
  const topDocumentChunks = documentChunks.slice(0, 3);
  const topMemoryChunks = memoryChunks.slice(0, 2);
  
  if (topDocumentChunks.length > 0) {
    contextText += 'Contexto dos Documentos:\n';
    topDocumentChunks.forEach((chunk: any, index: number) => {
      const documentName = chunk.document_name || chunk.title || 'Documento sem título';
      contextText += `---\n[Trecho ${index + 1} de "${documentName}" - Similaridade: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.content}\n`;
    });
    contextText += '---\n\n';
  }

  if (topMemoryChunks.length > 0) {
    contextText += 'Memórias e Insights Relevantes:\n';
    topMemoryChunks.forEach((memory: any, index: number) => {
      const sourceLabel = memory.source === 'chat_derived_insight' ? 'Insight de Conversa' : 
                         memory.source === 'user_feedback' ? 'Feedback do Usuário' : 
                         memory.source || 'Sistema';
      contextText += `---\n[Memória ${index + 1} - ${sourceLabel} - Similaridade: ${(memory.similarity * 100).toFixed(1)}%]\n${memory.content}\n`;
    });
    contextText += '---\n\n';
  }

  if (!contextText || (!topDocumentChunks.length && !topMemoryChunks.length)) {
    contextText = 'Nenhum contexto relevante encontrado nos documentos ou memórias para esta pergunta específica.\n\n';
  }

  // Instruções específicas baseadas no tipo de pergunta
  const analysisInstructions = buildAnalysisInstructions(userMessage, topDocumentChunks.length, topMemoryChunks.length);
  if (analysisInstructions) {
    contextText += analysisInstructions;
  }

  return contextText;
}

function buildConversationContext(history: ConversationHistory[]): string {
  if (history.length === 0) return '';

  let context = '📝 Contexto da Conversa Anterior:\n';
  history.reverse().forEach((interaction, index) => {
    context += `---\n`;
    context += `[Interação ${index + 1}]\n`;
    context += `Usuário: ${interaction.user_message}\n`;
    context += `Alex iA: ${interaction.ai_response.substring(0, 200)}${interaction.ai_response.length > 200 ? '...' : ''}\n`;
  });
  context += '---\n\n';

  return context;
}

function buildAnalysisInstructions(
  userMessage: string, 
  docChunksCount: number, 
  memoryChunksCount: number
): string {
  let instructions = '';

  // Detectar tipo de pergunta
  if (/compare|comparação|diferença|versus/i.test(userMessage)) {
    instructions += '🔍 INSTRUÇÃO ESPECIAL: Esta é uma pergunta de comparação. Analise todos os trechos fornecidos e apresente as diferenças e semelhanças de forma organizada.\n\n';
  }

  if (/resumo|resumir|síntese/i.test(userMessage)) {
    instructions += '📋 INSTRUÇÃO ESPECIAL: Esta é uma solicitação de resumo. Sintetize as informações dos múltiplos trechos em uma visão geral coerente e abrangente.\n\n';
  }

  if (/quem mais|que mais|outros|outras/i.test(userMessage)) {
    instructions += '👥 INSTRUÇÃO ESPECIAL: Esta pergunta solicita múltiplas respostas. Se encontrar várias opções válidas nos trechos, liste todas elas de forma organizada.\n\n';
  }

  if (docChunksCount > 1) {
    instructions += `💡 NOTA: Você tem ${docChunksCount} trechos de documentos disponíveis. Considere informações complementares entre eles.\n\n`;
  }

  if (memoryChunksCount > 0) {
    instructions += `🧠 NOTA: Você tem ${memoryChunksCount} memória(s) cognitiva(s) relevante(s) que podem conter insights derivados de conversas anteriores.\n\n`;
  }

  return instructions;
}
