
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
  console.log(`Starting text extraction from ${type} file: ${url}`);
  
  try {
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Alex-IA-Document-Processor/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    console.log(`File fetched successfully, size: ${response.headers.get('content-length') || 'unknown'} bytes`);

    if (type === 'txt' || type === 'md') {
      const text = await response.text();
      console.log(`Extracted ${text.length} characters from ${type} file`);
      return text;
    } else if (type === 'pdf') {
      // For PDF, we'll use a simple approach for now
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      console.log(`Processing PDF with ${uint8Array.length} bytes`);
      
      // Simple text extraction attempt - this is basic and may not work for all PDFs
      const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
      
      // Extract readable text (basic approach)
      const cleanText = text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep printable ASCII, newlines, and tabs
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log(`Extracted ${cleanText.length} characters from PDF`);
      
      if (cleanText.length < 10) {
        throw new Error('Unable to extract meaningful text from PDF. Consider using a different PDF or converting to text format.');
      }
      
      return cleanText;
    } else {
      throw new Error(`Unsupported file type: ${type}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${type}:`, error);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout while fetching file: ${url}`);
    }
    throw error;
  }
}

function createChunks(text: string, chunkSize: number = 800, overlap: number = 150): ChunkData[] {
  console.log(`Creating chunks from text of length: ${text.length} characters`);
  
  if (text.length === 0) {
    throw new Error('Cannot create chunks from empty text');
  }
  
  const chunks: ChunkData[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length && chunkIndex < 100) { // Limit to 100 chunks per document
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex).trim();
    
    if (content.length > 10) { // Only create chunks with meaningful content
      chunks.push({
        content,
        chunk_index: chunkIndex,
        metadata: {
          start_index: startIndex,
          end_index: endIndex,
          chunk_size: content.length,
          created_at: new Date().toISOString()
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

  console.log(`Created ${chunks.length} chunks successfully`);
  return chunks;
}

async function generateEmbedding(text: string, retries: number = 3): Promise<number[]> {
  console.log(`Generating embedding for text of length: ${text.length} characters`);
  
  // Truncate text to fit OpenAI's token limit (approximately 8191 tokens)
  const truncatedText = text.substring(0, 6000); // Conservative limit
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt}/${retries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: truncatedText,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (attempt ${attempt}): ${response.status} ${response.statusText} - ${errorText}`);
        
        // Don't retry on certain errors
        if (response.status === 401 || response.status === 429) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        if (attempt === retries) {
          throw new Error(`OpenAI API error after ${retries} attempts: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      const data = await response.json();
      console.log(`Successfully generated embedding with ${data.data[0].embedding.length} dimensions`);
      return data.data[0].embedding;
      
    } catch (error) {
      console.error(`Error generating embedding (attempt ${attempt}):`, error);
      
      if (error.name === 'AbortError') {
        console.error('OpenAI API request timed out');
      }
      
      if (attempt === retries) {
        throw new Error(`Failed to generate embedding after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Unexpected error in embedding generation');
}

async function saveChunkWithEmbedding(documentId: string, chunk: ChunkData, embedding: number[]) {
  console.log(`Saving chunk ${chunk.chunk_index} for document ${documentId} (${chunk.content.length} chars)`);
  
  try {
    const { error } = await supabase
      .from('document_chunks')
      .insert({
        document_id: documentId,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        embedding: JSON.stringify(embedding), // Use JSON.stringify instead of manual array join
        metadata: chunk.metadata
      });

    if (error) {
      console.error(`Database error saving chunk ${chunk.chunk_index}:`, error);
      throw error;
    }
    
    console.log(`Successfully saved chunk ${chunk.chunk_index}`);
  } catch (error) {
    console.error(`Error saving chunk ${chunk.chunk_index}:`, error);
    throw error;
  }
}

async function updateDocumentStatus(documentId: string, status: string, errorMessage?: string) {
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
    // Don't throw here to avoid masking the original error
  }
}

serve(async (req) => {
  const startTime = Date.now();
  console.log(`=== Processing document request started at ${new Date().toISOString()} ===`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  
  try {
    // Validate environment variables
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const requestBody = await req.json();
    documentId = requestBody.documentId;
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing document: ${documentId}`);

    // Update status to processing
    await updateDocumentStatus(documentId, 'processing');

    // Get document details with timeout
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

    console.log(`Found document: ${document.name} (${document.type}) - URL: ${document.url}`);

    // Validate document URL
    if (!document.url) {
      throw new Error('Document URL is missing');
    }

    // Extract text from file
    console.log('Starting text extraction...');
    const text = await extractTextFromFile(document.url, document.type);
    
    if (!text || text.length < 10) {
      throw new Error('No meaningful text extracted from document');
    }

    console.log(`Successfully extracted ${text.length} characters of text`);

    // Create chunks
    console.log('Creating text chunks...');
    const chunks = createChunks(text);
    
    if (chunks.length === 0) {
      throw new Error('No chunks created from document text');
    }

    console.log(`Created ${chunks.length} chunks, processing embeddings...`);

    // Process chunks with progress tracking
    let processedChunks = 0;
    const maxConcurrentRequests = 2; // Limit concurrent OpenAI requests
    
    for (let i = 0; i < chunks.length; i += maxConcurrentRequests) {
      const batch = chunks.slice(i, i + maxConcurrentRequests);
      
      console.log(`Processing batch ${Math.floor(i / maxConcurrentRequests) + 1}/${Math.ceil(chunks.length / maxConcurrentRequests)} (chunks ${i + 1}-${i + batch.length})`);
      
      const batchPromises = batch.map(async (chunk) => {
        try {
          const embedding = await generateEmbedding(chunk.content);
          await saveChunkWithEmbedding(documentId!, chunk, embedding);
          processedChunks++;
          console.log(`Progress: ${processedChunks}/${chunks.length} chunks processed`);
        } catch (chunkError) {
          console.error(`Error processing chunk ${chunk.chunk_index}:`, chunkError);
          throw chunkError; // Fail fast if any chunk fails
        }
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches to avoid rate limits
      if (i + maxConcurrentRequests < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Update status to completed
    await updateDocumentStatus(documentId, 'completed');

    const processingTime = Date.now() - startTime;
    console.log(`=== Successfully processed document ${documentId} in ${processingTime}ms with ${chunks.length} chunks ===`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Document processed successfully with ${chunks.length} chunks`,
        chunksCreated: chunks.length,
        processingTimeMs: processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`=== Error processing document after ${processingTime}ms ===`);
    console.error('Error details:', error);
    
    // Update document status to failed if we have documentId
    if (documentId) {
      try {
        await updateDocumentStatus(documentId, 'failed', error.message);
      } catch (statusError) {
        console.error('Error updating status to failed:', statusError);
      }
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
