
import type { DocumentChunk, MemoryChunk } from './types.ts';

export function logRetrievedChunks(
  documentChunks: DocumentChunk[],
  memoryChunks: MemoryChunk[],
  userMessage: string
): void {
  console.log('\n🔍 ===== INÍCIO CHUNKS RECUPERADOS =====');
  
  const retrievedChunksData = {
    query: userMessage,
    total_chunks_found: documentChunks.length + memoryChunks.length,
    document_chunks_found: documentChunks.length,
    memory_chunks_found: memoryChunks.length,
    search_parameters: {
      similarity_threshold: 0.5,
      max_document_chunks: 10,
      max_memory_chunks: 5,
      context_chunks_used: Math.min(3, documentChunks.length)
    },
    document_chunks: documentChunks.map((chunk: any, index: number) => {
      const documentName = chunk.document_name || chunk.title || 'Documento sem título';
      return {
        rank: index + 1,
        document_name: documentName,
        document_id: chunk.document_id,
        similarity_score: chunk.similarity,
        similarity_percentage: `${(chunk.similarity * 100).toFixed(2)}%`,
        content_preview: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
        content_length: chunk.content.length,
        chunk_type: 'document',
        used_in_context: index < 3 ? 'YES' : 'NO'
      };
    }),
    memory_chunks: memoryChunks.map((memory: any, index: number) => ({
      rank: index + 1,
      source: memory.source || 'Sistema',
      similarity_score: memory.similarity,
      similarity_percentage: `${(memory.similarity * 100).toFixed(2)}%`,
      content_preview: memory.content.substring(0, 200) + (memory.content.length > 200 ? '...' : ''),
      content_length: memory.content.length,
      chunk_type: 'memory',
      used_in_context: index < 2 ? 'YES' : 'NO'
    }))
  };
  
  console.log(JSON.stringify(retrievedChunksData, null, 2));
  
  // Log adicional com análise de relevância
  if (documentChunks.length > 0) {
    console.log('\n📊 ANÁLISE DE RELEVÂNCIA DOS CHUNKS:');
    console.log(`Chunk mais similar: ${(documentChunks[0].similarity * 100).toFixed(2)}% - ${documentChunks[0].document_name || documentChunks[0].title || 'Documento sem título'}`);
    
    if (documentChunks.length > 1) {
      console.log(`Diferença para 2º chunk: ${((documentChunks[0].similarity - documentChunks[1].similarity) * 100).toFixed(2)}%`);
    }
    
    // Verificar se há chunks do "Texto 3.pdf" ou documentos similares
    const texto3Chunks = documentChunks.filter((chunk: any) => {
      const docName = (chunk.document_name || chunk.title || '').toLowerCase();
      return docName.includes('texto 3') || docName.includes('texto3');
    });
    
    if (texto3Chunks.length > 0) {
      console.log(`\n🎯 CHUNKS DO TEXTO 3 ENCONTRADOS: ${texto3Chunks.length}`);
      texto3Chunks.forEach((chunk: any, index: number) => {
        console.log(`   Texto 3 - Chunk ${index + 1}: Similaridade ${(chunk.similarity * 100).toFixed(2)}% (Rank geral: ${documentChunks.findIndex(c => c === chunk) + 1})`);
      });
    } else {
      console.log('\n⚠️  NENHUM CHUNK DO TEXTO 3 ENCONTRADO NA BUSCA');
    }
    
    // Log dos documentos únicos encontrados
    const uniqueDocuments = [...new Set(documentChunks.map((chunk: any) => 
      chunk.document_name || chunk.title || 'Documento sem título'
    ))];
    console.log(`\n📄 DOCUMENTOS ÚNICOS ENCONTRADOS (${uniqueDocuments.length}):`, uniqueDocuments);
  }
  
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
    context_length: contextText.length,
    model_used: 'gpt-4o-mini',
    context_analysis: {
      has_context: contextText.trim() !== 'Nenhum contexto relevante encontrado nos documentos ou memórias.',
      context_sources: extractContextSources(contextText)
    }
  };
  
  console.log(JSON.stringify(promptData, null, 2));
  console.log('🤖 ===== FIM PROMPT COMPLETO PARA LLM =====\n');
}

function extractContextSources(contextText: string): string[] {
  const sources: string[] = [];
  const lines = contextText.split('\n');
  
  for (const line of lines) {
    if (line.includes('[Trecho') && line.includes('de "')) {
      const match = line.match(/de "([^"]+)"/);
      if (match) {
        sources.push(match[1]);
      }
    }
  }
  
  return [...new Set(sources)]; // Remove duplicatas
}
