
import type { DocumentChunk, MemoryChunk } from './types.ts';
import type { ConversationHistory } from './conversation-service.ts';

export function buildEnhancedSystemPrompt(): string {
  return `Você é Alex iA, um assistente de inteligência artificial especializado e conversacionalmente inteligente. Suas diretrizes principais são:

PRIORIDADE DE CONTEXTO:
- SEMPRE priorize o "Histórico da Conversa Atual" ao formular suas respostas
- Use este histórico para entender referências, pronomes e continuações de tópicos
- Mantenha a coerência e continuidade com as respostas anteriores da sessão

ANÁLISE E SÍNTESE:
- Analise cuidadosamente TODOS os trechos de contexto fornecidos, tanto de documentos quanto de memórias cognitivas
- Sintetize informações complementares de múltiplas fontes quando relevante para a pergunta
- Se houver múltiplas respostas válidas ou aspectos diferentes da mesma questão, apresente-os de forma organizada
- Identifique padrões, conexões e insights que podem não estar explícitos em um único trecho

COMPLETUDE E PRECISÃO:
- Seja o mais completo possível com base no contexto fornecido
- Se a informação não estiver no contexto da conversa atual, documentos ou memórias, diga claramente que não encontrou nos recursos atuais
- Quando apropriado, cite o documento ou fonte de onde extraiu a informação principal
- Evite escolher arbitrariamente entre opções válidas - apresente as alternativas

CONTINUIDADE CONVERSACIONAL:
- Reconheça quando uma pergunta é de acompanhamento e conecte com o tópico anterior
- Use pronomes e referências do histórico da conversa para dar respostas mais naturais
- Demonstre que você "lembra" do que foi discutido na sessão atual

COMUNICAÇÃO:
- Seja claro, objetivo e útil
- Use uma linguagem natural e acessível
- Organize informações complexas de forma didática
- Demonstre quando está fazendo conexões entre diferentes fontes de informação`;
}

export function buildActiveSessionPrompt(
  documentChunks: DocumentChunk[],
  memoryChunks: MemoryChunk[],
  conversationHistory: ConversationHistory[],
  userMessage: string
): string {
  let contextText = '';

  // 1. PRIORIDADE MÁXIMA: Histórico da sessão atual
  if (conversationHistory.length > 0) {
    contextText += buildActiveSessionContext(conversationHistory);
  }

  // 2. Contexto adicional de documentos (top 3 mais relevantes)
  const topDocumentChunks = documentChunks.slice(0, 3);
  if (topDocumentChunks.length > 0) {
    contextText += '## Contexto Adicional de Documentos/Memória Longa (Resultado da Busca Semântica):\n';
    topDocumentChunks.forEach((chunk: any, index: number) => {
      const documentName = chunk.document_name || chunk.title || 'Documento sem título';
      contextText += `Fonte: ${documentName} - Similaridade: ${(chunk.similarity * 100).toFixed(1)}%\n`;
      contextText += `Conteúdo: ${chunk.content}\n---\n`;
    });
  }

  // 3. Contexto de memórias cognitivas (top 2 mais relevantes)
  const topMemoryChunks = memoryChunks.slice(0, 2);
  if (topMemoryChunks.length > 0) {
    if (topDocumentChunks.length === 0) {
      contextText += '## Contexto Adicional de Documentos/Memória Longa (Resultado da Busca Semântica):\n';
    }
    topMemoryChunks.forEach((memory: any, index: number) => {
      const sourceLabel = memory.source === 'chat_derived_insight' ? 'Insight de Conversa' : 
                         memory.source === 'user_feedback' ? 'Feedback do Usuário' : 
                         memory.source || 'Memória Cognitiva';
      contextText += `Fonte: ${sourceLabel} - Similaridade: ${(memory.similarity * 100).toFixed(1)}%\n`;
      contextText += `Conteúdo: ${memory.content}\n---\n`;
    });
  }

  if (!topDocumentChunks.length && !topMemoryChunks.length) {
    contextText += '## Contexto Adicional de Documentos/Memória Longa:\nNenhum contexto relevante encontrado nos documentos ou memórias para esta pergunta específica.\n\n';
  }

  // 4. Pergunta atual
  contextText += `## Pergunta Atual do Usuário:\n${userMessage}\n\n## Resposta de Alex iA:`;

  return contextText;
}

function buildActiveSessionContext(history: ConversationHistory[]): string {
  if (history.length === 0) return '';

  let context = '## Histórico da Conversa Atual:\n';
  
  // Reverter para ordem cronológica correta (mais antiga primeiro)
  history.reverse().forEach((interaction, index) => {
    context += `Usuário: ${interaction.user_message}\n`;
    context += `Alex iA: ${interaction.ai_response}\n`;
    if (index < history.length - 1) context += '\n';
  });
  
  context += '\n';
  return context;
}

function buildAnalysisInstructions(
  userMessage: string, 
  docChunksCount: number, 
  memoryChunksCount: number,
  hasConversationHistory: boolean
): string {
  let instructions = '';

  if (hasConversationHistory) {
    instructions += '🧠 INSTRUÇÃO ESPECIAL: Você tem acesso ao histórico da conversa atual. Use-o para entender referências e manter continuidade.\n\n';
  }

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
