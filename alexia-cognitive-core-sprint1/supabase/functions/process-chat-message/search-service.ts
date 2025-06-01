
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
  
  // Buscar 10 chunks para diagnóstico completo
  const { data: documentResults, error: docError } = await supabase.rpc('match_document_sections_enhanced', {
    p_query_embedding: queryEmbedding,
    p_match_similarity_threshold: 0.5, // Reduzir threshold para capturar mais resultados
    p_match_count: 10, // Aumentar para diagnóstico
    p_user_id_filter: userId
  });

  if (docError) {
    console.error('Error in document search:', docError);
    
    // Fallback para a função original se a enhanced não existir
    const { data: fallbackResults, error: fallbackError } = await supabase.rpc('match_document_sections', {
      p_query_embedding: queryEmbedding,
      p_match_similarity_threshold: 0.5,
      p_match_count: 10,
      p_user_id_filter: userId
    });

    if (fallbackError) {
      console.error('Error in fallback document search:', fallbackError);
      return [];
    }

    // Para fallback, buscar títulos dos documentos separadamente
    if (fallbackResults && fallbackResults.length > 0) {
      const documentIds = [...new Set(fallbackResults.map((chunk: any) => chunk.document_id))];
      const { data: documentsData, error: docsError } = await supabase
        .from('documents')
        .select('id, title')
        .in('id', documentIds);

      if (!docsError && documentsData) {
        const documentTitles = documentsData.reduce((acc: any, doc: any) => {
          acc[doc.id] = doc.title;
          return acc;
        }, {});

        return fallbackResults.map((chunk: any) => ({
          ...chunk,
          document_name: documentTitles[chunk.document_id] || 'Documento sem título'
        }));
      }
    }

    return fallbackResults || [];
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
    p_match_similarity_threshold: 0.5, // Reduzir threshold para capturar mais resultados
    p_match_count: 5, // Aumentar para diagnóstico
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
    contextText += 'Memórias Relevantes:\n';
    topMemoryChunks.forEach((memory: any, index: number) => {
      contextText += `---\n[Memória ${index + 1} - ${memory.source || 'Sistema'} - Similaridade: ${(memory.similarity * 100).toFixed(1)}%]\n${memory.content}\n`;
    });
    contextText += '---\n\n';
  }

  if (!contextText) {
    contextText = 'Nenhum contexto relevante encontrado nos documentos ou memórias.\n\n';
  }

  return contextText;
}
