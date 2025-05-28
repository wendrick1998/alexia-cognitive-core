
import type { DocumentChunk, MemoryChunk } from './types.ts';

export function logRetrievedChunks(
  documentChunks: DocumentChunk[],
  memoryChunks: MemoryChunk[],
  userMessage: string
): void {
  console.log('\n🔍 ===== INÍCIO CHUNKS RECUPERADOS =====');
  
  const retrievedChunksData = {
    document_chunks: documentChunks.map((chunk: any) => ({
      content: chunk.content,
      document_name: chunk.document_name || 'Documento sem nome',
      similarity_score: chunk.similarity,
      chunk_type: 'document'
    })),
    memory_chunks: memoryChunks.map((memory: any) => ({
      content: memory.content,
      source: memory.source || 'Sistema',
      similarity_score: memory.similarity,
      chunk_type: 'memory'
    })),
    total_chunks: documentChunks.length + memoryChunks.length,
    query: userMessage
  };
  
  console.log(JSON.stringify(retrievedChunksData, null, 2));
  console.log('🔍 ===== FIM CHUNKS RECUPERADOS =====\n');
}

export function logPromptData(
  contextText: string,
  userMessage: string,
  fullPrompt: string
): void {
  console.log('\n🤖 ===== INÍCIO PROMPT COMPLETO PARA LLM =====');
  
  const promptData = {
    system_message: 'Você é Alex iA, um assistente IA prestativo. Responda à pergunta do usuário baseando-se estritamente no contexto fornecido. Se a informação não estiver no contexto, diga que não encontrou a informação nos documentos atuais. Seja claro, conciso e útil.',
    retrieved_context: contextText,
    user_question: userMessage,
    full_prompt: fullPrompt,
    prompt_length: fullPrompt.length,
    model_used: 'gpt-4o-mini'
  };
  
  console.log(JSON.stringify(promptData, null, 2));
  console.log('🤖 ===== FIM PROMPT COMPLETO PARA LLM =====\n');

  console.log('=== PROMPT COMPLETO PARA LLM ===');
  console.log('Tamanho total do prompt:', fullPrompt.length, 'caracteres');
}
