
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
  const requestId = crypto.randomUUID().substring(0, 8);
  
  console.log(`=== [${requestId}] PROCESSO INICIADO EM ${new Date().toISOString()} ===`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  
  try {
    // Validate environment
    if (!openAIApiKey) {
      console.error(`[${requestId}] OpenAI API key não configurada`);
      throw new Error('OpenAI API key não configurada');
    }
    
    // Parse request
    const requestBody = await req.json();
    documentId = requestBody.documentId;
    
    if (!documentId) {
      console.error(`[${requestId}] Document ID não fornecido`);
      return new Response(
        JSON.stringify({ error: 'Document ID é obrigatório', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Processando documento: ${documentId}`);
    
    // Update status to processing
    await updateDocumentStatus(documentId, 'processing');

    // Get document details
    const document = await getDocument(documentId);
    console.log(`[${requestId}] Documento encontrado: ${document.name} (${document.type})`);
    console.log(`[${requestId}] URL: ${document.url}`);
    console.log(`[${requestId}] Tamanho: ${document.file_size || 'unknown'} bytes`);

    if (!document.url) {
      throw new Error('URL do documento não encontrada');
    }

    // Extract text with enhanced error handling
    console.log(`[${requestId}] Iniciando extração de texto...`);
    const extractionStartTime = Date.now();
    
    const text = await extractTextFromFile(document.url, document.type);
    
    const extractionTime = Date.now() - extractionStartTime;
    console.log(`[${requestId}] Extração concluída em ${extractionTime}ms`);
    console.log(`[${requestId}] Texto extraído: ${text.length} caracteres`);
    
    // Validate extracted text
    if (!text || text.trim().length === 0) {
      throw new Error('Nenhum texto foi extraído do documento');
    }

    if (text.length < 10) {
      throw new Error('Texto extraído muito curto para processamento');
    }

    // Validate text quality for PDFs
    if (document.type.toLowerCase() === 'pdf') {
      const readableChars = (text.match(/[a-zA-Z0-9À-ÿ\u00C0-\u017F]/g) || []).length;
      const qualityRatio = readableChars / text.length;
      
      console.log(`[${requestId}] Qualidade do texto PDF: ${(qualityRatio * 100).toFixed(1)}%`);
      
      if (qualityRatio < 0.3) {
        console.warn(`[${requestId}] ⚠️ Qualidade baixa detectada, mas prosseguindo...`);
      }
    }

    // Create and process chunks
    console.log(`[${requestId}] Criando chunks com otimização de memória...`);
    const chunkingStartTime = Date.now();
    
    let processedChunks = 0;
    let totalEmbeddingTime = 0;
    const chunkGenerator = createChunksGenerator(text);
    
    for (const chunk of chunkGenerator) {
      try {
        const chunkStartTime = Date.now();
        
        console.log(`[${requestId}] Processando chunk ${chunk.chunk_index + 1}: ${chunk.content.length} chars`);
        
        // Generate embedding
        const embeddingStartTime = Date.now();
        const embedding = await generateEmbedding(chunk.content, openAIApiKey);
        const embeddingTime = Date.now() - embeddingStartTime;
        totalEmbeddingTime += embeddingTime;
        
        // Save to database
        await saveChunkWithEmbedding(documentId!, chunk, embedding);
        
        processedChunks++;
        const chunkTime = Date.now() - chunkStartTime;
        console.log(`[${requestId}] Chunk ${chunk.chunk_index + 1} processado em ${chunkTime}ms`);
        
        // Memory management: small pause every 5 chunks
        if (processedChunks % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (chunkError) {
        console.error(`[${requestId}] Erro no chunk ${chunk.chunk_index}:`, chunkError);
        throw new Error(`Falha no processamento do chunk ${chunk.chunk_index}: ${chunkError.message}`);
      }
    }

    const chunkingTime = Date.now() - chunkingStartTime;
    
    if (processedChunks === 0) {
      throw new Error('Nenhum chunk foi criado a partir do texto extraído');
    }

    // Update status to completed
    await updateDocumentStatus(documentId, 'completed');

    const totalTime = Date.now() - startTime;
    const avgEmbeddingTime = totalEmbeddingTime / processedChunks;
    
    console.log(`=== [${requestId}] PROCESSAMENTO CONCLUÍDO COM SUCESSO ===`);
    console.log(`[${requestId}] Documento: ${documentId}`);
    console.log(`[${requestId}] Chunks criados: ${processedChunks}`);
    console.log(`[${requestId}] Tempo total: ${totalTime}ms`);
    console.log(`[${requestId}] Tempo de extração: ${extractionTime}ms`);
    console.log(`[${requestId}] Tempo de chunking: ${chunkingTime}ms`);
    console.log(`[${requestId}] Tempo médio por embedding: ${avgEmbeddingTime.toFixed(0)}ms`);
    console.log(`[${requestId}] Taxa de processamento: ${(processedChunks / (totalTime / 1000)).toFixed(2)} chunks/segundo`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Documento processado com sucesso`,
        chunksCreated: processedChunks,
        processingTimeMs: totalTime,
        extractionTimeMs: extractionTime,
        textLength: text.length,
        averageEmbeddingTimeMs: Math.round(avgEmbeddingTime),
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`=== [${requestId}] ERRO APÓS ${processingTime}ms ===`);
    console.error(`[${requestId}] Documento: ${documentId || 'unknown'}`);
    console.error(`[${requestId}] Erro:`, error);
    console.error(`[${requestId}] Stack:`, error.stack);
    
    // Update document status to failed
    if (documentId) {
      try {
        await updateDocumentStatus(documentId, 'failed', error.message);
        console.log(`[${requestId}] Status atualizado para 'failed'`);
      } catch (statusError) {
        console.error(`[${requestId}] Erro ao atualizar status:`, statusError);
      }
    }

    // Categorize error for better user feedback
    let errorCategory = 'unknown';
    let userMessage = error.message;
    
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      errorCategory = 'timeout';
      userMessage = 'Timeout no processamento. Documento muito grande ou complexo.';
    } else if (error.message?.includes('PDF') || error.message?.includes('pdf')) {
      errorCategory = 'pdf_extraction';
      userMessage = `Erro na extração de PDF: ${error.message}`;
    } else if (error.message?.includes('OpenAI') || error.message?.includes('embedding')) {
      errorCategory = 'openai';
      userMessage = 'Erro na geração de embeddings. Verifique configuração da API.';
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      errorCategory = 'network';
      userMessage = 'Erro de rede ao baixar arquivo.';
    } else if (error.message?.includes('Memory') || error.message?.includes('memory')) {
      errorCategory = 'memory';
      userMessage = 'Documento muito grande. Considere dividir em arquivos menores.';
    }

    return new Response(
      JSON.stringify({ 
        error: userMessage,
        category: errorCategory,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        requestId
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
