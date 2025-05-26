
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface ChunkData {
  content: string;
  chunk_index: number;
  metadata: Record<string, any>;
}

async function extractTextFromFile(url: string, type: string): Promise<string> {
  console.log(`Extracting text from ${type} file: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    if (type === 'txt' || type === 'md') {
      return await response.text();
    } else if (type === 'pdf') {
      // For PDF, we'll use a simple approach for now
      // In production, you might want to use a more robust PDF parser
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Simple text extraction attempt - this is basic and may not work for all PDFs
      // For production use, consider using pdf-parse or similar library
      const text = new TextDecoder().decode(uint8Array);
      
      // Extract readable text (basic approach)
      const cleanText = text
        .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (cleanText.length < 50) {
        throw new Error('Unable to extract meaningful text from PDF');
      }
      
      return cleanText;
    } else {
      throw new Error(`Unsupported file type: ${type}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${type}:`, error);
    throw error;
  }
}

function createChunks(text: string, chunkSize: number = 1000, overlap: number = 200): ChunkData[] {
  console.log(`Creating chunks from text of length: ${text.length}`);
  
  const chunks: ChunkData[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex).trim();
    
    if (content.length > 0) {
      chunks.push({
        content,
        chunk_index: chunkIndex,
        metadata: {
          start_index: startIndex,
          end_index: endIndex,
          chunk_size: content.length
        }
      });
      chunkIndex++;
    }
    
    // Move start index forward, accounting for overlap
    startIndex = endIndex - overlap;
    
    // Avoid infinite loop
    if (startIndex >= endIndex) {
      break;
    }
  }

  console.log(`Created ${chunks.length} chunks`);
  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  console.log(`Generating embedding for text of length: ${text.length}`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8191), // OpenAI has a token limit
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function saveChunkWithEmbedding(documentId: string, chunk: ChunkData, embedding: number[]) {
  console.log(`Saving chunk ${chunk.chunk_index} for document ${documentId}`);
  
  try {
    const { error } = await supabase
      .from('document_chunks')
      .insert({
        document_id: documentId,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        embedding: `[${embedding.join(',')}]`,
        metadata: chunk.metadata
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving chunk:', error);
    throw error;
  }
}

async function updateDocumentStatus(documentId: string, status: string, errorMessage?: string) {
  console.log(`Updating document ${documentId} status to: ${status}`);
  
  const updateData: any = { status_processing: status };
  if (errorMessage) {
    updateData.metadata = { error: errorMessage };
  }

  const { error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId);

  if (error) {
    console.error('Error updating document status:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing document: ${documentId}`);

    // Update status to processing
    await updateDocumentStatus(documentId, 'processing');

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    console.log(`Found document: ${document.name} (${document.type})`);

    // Extract text from file
    const text = await extractTextFromFile(document.url, document.type);
    
    if (!text || text.length < 10) {
      throw new Error('No meaningful text extracted from document');
    }

    // Create chunks
    const chunks = createChunks(text);
    
    if (chunks.length === 0) {
      throw new Error('No chunks created from document text');
    }

    // Process each chunk: generate embedding and save
    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.content);
        await saveChunkWithEmbedding(documentId, chunk, embedding);
      } catch (chunkError) {
        console.error(`Error processing chunk ${chunk.chunk_index}:`, chunkError);
        // Continue with other chunks even if one fails
      }
    }

    // Update status to completed
    await updateDocumentStatus(documentId, 'completed');

    console.log(`Successfully processed document ${documentId} with ${chunks.length} chunks`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Document processed successfully with ${chunks.length} chunks`,
        chunksCreated: chunks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-document function:', error);
    
    // Try to update document status to failed if we have documentId
    try {
      const { documentId } = await req.json();
      if (documentId) {
        await updateDocumentStatus(documentId, 'failed', error.message);
      }
    } catch (statusError) {
      console.error('Error updating status to failed:', statusError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
