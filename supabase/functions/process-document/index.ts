
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractTextFromFile } from './file-extractor.ts';
import { createChunksGenerator } from './text-chunker.ts';
import { generateEmbedding } from './embedding-service.ts';
import { saveChunkWithEmbedding, updateDocumentStatus, getDocument } from './database-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const startTime = Date.now();
  console.log(`=== PROCESSAMENTO DE DOCUMENTO INICIADO EM ${new Date().toISOString()} ===`);
  
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

    const document = await getDocument(documentId);
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

    console.log('Creating and processing chunks with memory optimization...');
    let processedChunks = 0;
    const chunkGenerator = createChunksGenerator(text);
    
    for (const chunk of chunkGenerator) {
      try {
        console.log(`Processing chunk ${chunk.chunk_index + 1} (${chunk.content.length} chars)`);
        
        const embedding = await generateEmbedding(chunk.content, openAIApiKey);
        await saveChunkWithEmbedding(documentId!, chunk, embedding);
        
        processedChunks++;
        console.log(`Progress: ${processedChunks} chunks processed`);
        
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
