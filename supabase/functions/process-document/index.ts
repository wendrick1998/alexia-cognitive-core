
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

// Memory-optimized PDF text extraction
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log(`Processing PDF with ${arrayBuffer.byteLength} bytes`);
  
  try {
    // Convert to Uint8Array for more efficient processing
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Simple text extraction approach that's memory-efficient
    // This avoids loading complex PDF parsing libraries that consume lots of memory
    let text = '';
    let textFound = false;
    
    // Look for text objects in PDF (simplified approach)
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const pdfString = decoder.decode(uint8Array);
    
    // Extract text between common PDF text markers
    const textPatterns = [
      /BT\s*.*?ET/gs,  // Text objects
      /\(([^)]+)\)/g,  // Text in parentheses
      /\[([^\]]+)\]/g  // Text in brackets
    ];
    
    for (const pattern of textPatterns) {
      const matches = pdfString.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleanText = match
            .replace(/BT|ET|Tj|TJ|Tm|Td|TD/g, '')
            .replace(/[()[\]]/g, '')
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .trim();
          
          if (cleanText.length > 3) {
            text += cleanText + ' ';
            textFound = true;
          }
        }
      }
    }
    
    // Fallback: extract any readable ASCII text
    if (!textFound || text.length < 50) {
      text = pdfString
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    console.log(`Extracted ${text.length} characters from PDF`);
    
    if (text.length < 10) {
      throw new Error('Unable to extract meaningful text from PDF. Consider converting to text format.');
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

async function extractTextFromFile(url: string, type: string): Promise<string> {
  console.log(`Starting text extraction from ${type} file: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
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
      const arrayBuffer = await response.arrayBuffer();
      const text = await extractTextFromPDF(arrayBuffer);
      // Clear the arrayBuffer reference to free memory
      return text;
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

// Memory-optimized chunking function
function* createChunksGenerator(text: string, chunkSize: number = 800, overlap: number = 150): Generator<ChunkData> {
  console.log(`Creating chunks from text of length: ${text.length} characters`);
  
  if (text.length === 0) {
    throw new Error('Cannot create chunks from empty text');
  }
  
  let startIndex = 0;
  let chunkIndex = 0;
  const maxChunks = 100; // Limit chunks per document

  while (startIndex < text.length && chunkIndex < maxChunks) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex).trim();
    
    if (content.length > 10) {
      yield {
        content,
        chunk_index: chunkIndex,
        metadata: {
          start_index: startIndex,
          end_index: endIndex,
          chunk_size: content.length,
          created_at: new Date().toISOString()
        }
      };
      chunkIndex++;
    }
    
    startIndex = endIndex - overlap;
    
    if (startIndex >= endIndex) {
      break;
    }
  }

  console.log(`Created ${chunkIndex} chunks successfully`);
}

async function generateEmbedding(text: string, retries: number = 3): Promise<number[]> {
  const truncatedText = text.substring(0, 6000);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt}/${retries} for text length: ${truncatedText.length}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
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
        
        if (response.status === 401 || response.status === 429) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        if (attempt === retries) {
          throw new Error(`OpenAI API error after ${retries} attempts: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
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
        embedding: JSON.stringify(embedding),
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
  }
}

serve(async (req) => {
  const startTime = Date.now();
  console.log(`=== Processing document request started at ${new Date().toISOString()} ===`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  
  try {
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
    await updateDocumentStatus(documentId, 'processing');

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

    if (!document.url) {
      throw new Error('Document URL is missing');
    }

    console.log('Starting text extraction...');
    const text = await extractTextFromFile(document.url, document.type);
    
    if (!text || text.length < 10) {
      throw new Error('No meaningful text extracted from document');
    }

    console.log(`Successfully extracted ${text.length} characters of text`);

    // Process chunks one by one to optimize memory usage
    console.log('Creating and processing chunks with memory optimization...');
    let processedChunks = 0;
    const chunkGenerator = createChunksGenerator(text);
    
    // Process chunks individually to minimize memory usage
    for (const chunk of chunkGenerator) {
      try {
        console.log(`Processing chunk ${chunk.chunk_index + 1} (${chunk.content.length} chars)`);
        
        const embedding = await generateEmbedding(chunk.content);
        await saveChunkWithEmbedding(documentId!, chunk, embedding);
        
        processedChunks++;
        console.log(`Progress: ${processedChunks} chunks processed`);
        
        // Small delay to prevent overwhelming the system
        if (processedChunks % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (chunkError) {
        console.error(`Error processing chunk ${chunk.chunk_index}:`, chunkError);
        throw chunkError;
      }
    }

    if (processedChunks === 0) {
      throw new Error('No chunks were created from the document text');
    }

    await updateDocumentStatus(documentId, 'completed');

    const processingTime = Date.now() - startTime;
    console.log(`=== Successfully processed document ${documentId} in ${processingTime}ms with ${processedChunks} chunks ===`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Document processed successfully with ${processedChunks} chunks`,
        chunksCreated: processedChunks,
        processingTimeMs: processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`=== Error processing document after ${processingTime}ms ===`);
    console.error('Error details:', error);
    
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
