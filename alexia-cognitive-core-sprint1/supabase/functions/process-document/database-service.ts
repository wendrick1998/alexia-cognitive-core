
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { ChunkData } from './text-chunker.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function saveChunkWithEmbedding(documentId: string, chunk: ChunkData, embedding: number[]) {
  console.log(`Saving section ${chunk.chunk_index} for document ${documentId} (${chunk.content.length} chars)`);
  
  try {
    const { error } = await supabase
      .from('document_sections')
      .insert({
        document_id: documentId,
        section_number: chunk.chunk_index,
        content: chunk.content,
        embedding: JSON.stringify(embedding),
        metadata: chunk.metadata
      });

    if (error) {
      console.error(`Database error saving section ${chunk.chunk_index}:`, error);
      throw error;
    }
    
    console.log(`Successfully saved section ${chunk.chunk_index}`);
  } catch (error) {
    console.error(`Error saving section ${chunk.chunk_index}:`, error);
    throw error;
  }
}

export async function updateDocumentStatus(documentId: string, status: string, errorMessage?: string) {
  console.log(`Updating document ${documentId} status to: ${status}`);
  
  const updateData: any = { 
    status_processing: status,
    updated_at: new Date().toISOString()
  };
  
  if (errorMessage) {
    updateData.metadata = { error: errorMessage, error_timestamp: new Date().toISOString() };
  }

  try {
    const { error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId);

    if (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
    
    console.log(`Successfully updated document status to ${status}`);
  } catch (error) {
    console.error('Failed to update document status:', error);
  }
}

export async function updateDocumentExtractionInfo(
  documentId: string, 
  extractionMethod: string, 
  extractionQuality: number
) {
  console.log(`Updating document ${documentId} extraction info: ${extractionMethod} (${extractionQuality}%)`);
  
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        extraction_method: extractionMethod,
        extraction_quality: extractionQuality,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      console.error('Error updating document extraction info:', error);
      throw error;
    }
    
    console.log('Successfully updated document extraction info');
  } catch (error) {
    console.error('Failed to update document extraction info:', error);
  }
}

export async function getDocument(documentId: string) {
  console.log('Fetching document details from database...');
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    const errorMsg = `Document not found: ${docError?.message || 'Unknown error'}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return document;
}

export async function cleanupFailedDocument(documentId: string) {
  console.log(`Cleaning up failed document ${documentId}`);
  
  try {
    // Remove document sections
    await supabase
      .from('document_sections')
      .delete()
      .eq('document_id', documentId);

    // Remove embeddings
    await supabase
      .from('embeddings')
      .delete()
      .eq('document_id', documentId);

    console.log('Successfully cleaned up failed document');
  } catch (error) {
    console.error('Error cleaning up failed document:', error);
  }
}
