
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import type { DocumentChunk, MemoryChunk } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function searchDocuments(
  queryEmbedding: number[],
  userId: string
): Promise<DocumentChunk[]> {
  console.log('=== DOCUMENT SEARCH ===');
  
  const { data: documentResults, error: docError } = await supabase.rpc('match_document_sections', {
    p_query_embedding: queryEmbedding,
    p_match_similarity_threshold: 0.7,
    p_match_count: 3,
    p_user_id_filter: userId
  });

  if (docError) {
    console.error('Error in document search:', docError);
  }

  return documentResults || [];
}

export async function searchMemories(
  queryEmbedding: number[],
  userId: string
): Promise<MemoryChunk[]> {
  console.log('=== MEMORY SEARCH ===');
  
  const { data: memoryResults, error: memError } = await supabase.rpc('search_cognitive_memories', {
    p_query_embedding: queryEmbedding,
    p_match_similarity_threshold: 0.7,
    p_match_count: 2,
    p_user_id_filter: userId
  });

  if (memError) {
    console.error('Error in memory search:', memError);
  }

  return memoryResults || [];
}

export function buildContextText(
  documentChunks: DocumentChunk[],
  memoryChunks: MemoryChunk[]
): string {
  let contextText = '';
  
  if (documentChunks.length > 0) {
    contextText += 'Contexto dos Documentos:\n';
    documentChunks.forEach((chunk: any, index: number) => {
      contextText += `---\n[Trecho ${index + 1} - Similaridade: ${(chunk.similarity * 100).toFixed(1)}%]\n${chunk.content}\n`;
    });
    contextText += '---\n\n';
  }

  if (memoryChunks.length > 0) {
    contextText += 'Memórias Relevantes:\n';
    memoryChunks.forEach((memory: any, index: number) => {
      contextText += `---\n[Memória ${index + 1} - ${memory.source || 'Sistema'} - Similaridade: ${(memory.similarity * 100).toFixed(1)}%]\n${memory.content}\n`;
    });
    contextText += '---\n\n';
  }

  if (!contextText) {
    contextText = 'Nenhum contexto relevante encontrado nos documentos ou memórias.\n\n';
  }

  return contextText;
}
