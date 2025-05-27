
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
  
  console.log(`=== [${requestId}] PROCESSO INICIADO (VERSÃO CORRIGIDA) EM ${new Date().toISOString()} ===`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  
  try {
    // Enhanced environment validation
    if (!openAIApiKey) {
      console.error(`[${requestId}] ❌ OpenAI API key não configurada`);
      throw new Error('OpenAI API key não configurada no ambiente');
    }
    
    // Parse and validate request
    const requestBody = await req.json();
    documentId = requestBody.documentId;
    
    if (!documentId) {
      console.error(`[${requestId}] ❌ Document ID não fornecido`);
      return new Response(
        JSON.stringify({ error: 'Document ID é obrigatório', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] 🎯 Processando documento: ${documentId}`);
    
    // Update status to processing with enhanced feedback
    await updateDocumentStatus(documentId, 'processing');

    // Get document details with validation
    const document = await getDocument(documentId);
    if (!document) {
      throw new Error(`Documento ${documentId} não encontrado`);
    }
    
    console.log(`[${requestId}] 📋 Documento encontrado:`);
    console.log(`[${requestId}] - Nome: ${document.name}`);
    console.log(`[${requestId}] - Tipo: ${document.type}`);
    console.log(`[${requestId}] - URL: ${document.url}`);
    console.log(`[${requestId}] - Tamanho: ${document.file_size || 'unknown'} bytes`);
    console.log(`[${requestId}] - Fonte: ${document.source}`);

    if (!document.url) {
      throw new Error('URL do documento não encontrada');
    }

    // Extract text with comprehensive error handling
    console.log(`[${requestId}] 🔍 Iniciando extração de texto aprimorada...`);
    const extractionStartTime = Date.now();
    
    const text = await extractTextFromFile(document.url, document.type);
    
    const extractionTime = Date.now() - extractionStartTime;
    console.log(`[${requestId}] ✅ Extração concluída em ${extractionTime}ms`);
    console.log(`[${requestId}] 📊 Texto extraído: ${text.length} caracteres`);
    
    // Enhanced text validation
    if (!text || text.trim().length === 0) {
      throw new Error('Nenhum texto foi extraído do documento');
    }

    if (text.length < 5) {
      throw new Error('Texto extraído muito curto para processamento útil');
    }

    // Comprehensive text quality validation for PDFs
    if (document.type.toLowerCase() === 'pdf') {
      const words = text.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F]{2,}\b/g) || [];
      const readableChars = (text.match(/[a-zA-Z0-9À-ÿ\u00C0-\u017F\s\.\,\!\?\;\:\-\(\)\[\]\"\']/g) || []).length;
      const qualityRatio = readableChars / text.length;
      
      console.log(`[${requestId}] 📊 Análise de qualidade do PDF:`);
      console.log(`[${requestId}] - Palavras encontradas: ${words.length}`);
      console.log(`[${requestId}] - Caracteres legíveis: ${readableChars}/${text.length}`);
      console.log(`[${requestId}] - Qualidade do texto: ${(qualityRatio * 100).toFixed(1)}%`);
      
      if (qualityRatio < 0.2) {
        console.warn(`[${requestId}] ⚠️ Qualidade muito baixa detectada, mas prosseguindo...`);
      }
      
      if (words.length < 5) {
        throw new Error(`PDF pode estar corrompido: apenas ${words.length} palavras detectadas`);
      }
    }

    // Create and process chunks with enhanced monitoring
    console.log(`[${requestId}] 🔧 Criando chunks com processamento otimizado...`);
    const chunkingStartTime = Date.now();
    
    let processedChunks = 0;
    let totalEmbeddingTime = 0;
    let failedChunks = 0;
    const chunkGenerator = createChunksGenerator(text);
    
    for (const chunk of chunkGenerator) {
      try {
        const chunkStartTime = Date.now();
        
        console.log(`[${requestId}] 🔄 Processando chunk ${chunk.chunk_index + 1}: ${chunk.content.length} chars`);
        
        // Validate chunk content
        if (!chunk.content || chunk.content.trim().length < 10) {
          console.warn(`[${requestId}] ⚠️ Chunk ${chunk.chunk_index + 1} muito pequeno, pulando...`);
          continue;
        }
        
        // Generate embedding with retries
        const embeddingStartTime = Date.now();
        const embedding = await generateEmbedding(chunk.content, openAIApiKey);
        const embeddingTime = Date.now() - embeddingStartTime;
        totalEmbeddingTime += embeddingTime;
        
        // Validate embedding
        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
          throw new Error(`Embedding inválido gerado para chunk ${chunk.chunk_index}`);
        }
        
        // Save to database
        await saveChunkWithEmbedding(documentId!, chunk, embedding);
        
        processedChunks++;
        const chunkTime = Date.now() - chunkStartTime;
        console.log(`[${requestId}] ✅ Chunk ${chunk.chunk_index + 1} processado em ${chunkTime}ms (embedding: ${embeddingTime}ms)`);
        
        // Memory management and progress feedback
        if (processedChunks % 10 === 0) {
          console.log(`[${requestId}] 📈 Progresso: ${processedChunks} chunks processados...`);
          await new Promise(resolve => setTimeout(resolve, 50)); // Brief pause for memory
        }
        
      } catch (chunkError) {
        failedChunks++;
        console.error(`[${requestId}] ❌ Erro no chunk ${chunk.chunk_index}:`, chunkError);
        
        // Continue with other chunks unless too many failures
        if (failedChunks > 5) {
          throw new Error(`Muitas falhas de chunks (${failedChunks}). Último erro: ${chunkError.message}`);
        }
      }
    }

    const chunkingTime = Date.now() - chunkingStartTime;
    
    if (processedChunks === 0) {
      throw new Error('Nenhum chunk foi criado com sucesso a partir do texto extraído');
    }

    // Update status to completed
    await updateDocumentStatus(documentId, 'completed');

    const totalTime = Date.now() - startTime;
    const avgEmbeddingTime = processedChunks > 0 ? totalEmbeddingTime / processedChunks : 0;
    const processingRate = processedChunks / (totalTime / 1000);
    
    console.log(`=== [${requestId}] PROCESSAMENTO CONCLUÍDO COM SUCESSO ===`);
    console.log(`[${requestId}] 📋 Estatísticas finais:`);
    console.log(`[${requestId}] - Documento: ${documentId}`);
    console.log(`[${requestId}] - Chunks criados: ${processedChunks}`);
    console.log(`[${requestId}] - Chunks falharam: ${failedChunks}`);
    console.log(`[${requestId}] - Tempo total: ${totalTime}ms`);
    console.log(`[${requestId}] - Tempo de extração: ${extractionTime}ms`);
    console.log(`[${requestId}] - Tempo de chunking: ${chunkingTime}ms`);
    console.log(`[${requestId}] - Tempo médio por embedding: ${avgEmbeddingTime.toFixed(0)}ms`);
    console.log(`[${requestId}] - Taxa de processamento: ${processingRate.toFixed(2)} chunks/segundo`);
    console.log(`[${requestId}] - Caracteres originais: ${text.length}`);
    console.log(`[${requestId}] - Taxa de sucesso: ${((processedChunks / (processedChunks + failedChunks)) * 100).toFixed(1)}%`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Documento processado com sucesso`,
        chunksCreated: processedChunks,
        chunksFailed: failedChunks,
        processingTimeMs: totalTime,
        extractionTimeMs: extractionTime,
        chunkingTimeMs: chunkingTime,
        textLength: text.length,
        averageEmbeddingTimeMs: Math.round(avgEmbeddingTime),
        processingRate: parseFloat(processingRate.toFixed(2)),
        successRate: parseFloat(((processedChunks / (processedChunks + failedChunks)) * 100).toFixed(1)),
        requestId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`=== [${requestId}] ERRO CRÍTICO APÓS ${processingTime}ms ===`);
    console.error(`[${requestId}] Documento: ${documentId || 'unknown'}`);
    console.error(`[${requestId}] Erro:`, error);
    console.error(`[${requestId}] Stack:`, error.stack);
    
    // Update document status to failed with detailed error
    if (documentId) {
      try {
        await updateDocumentStatus(documentId, 'failed', error.message);
        console.log(`[${requestId}] 📝 Status atualizado para 'failed'`);
      } catch (statusError) {
        console.error(`[${requestId}] ❌ Erro ao atualizar status:`, statusError);
      }
    }

    // Enhanced error categorization for better user feedback
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
    } else if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('download')) {
      errorCategory = 'network';
      userMessage = 'Erro de rede ao baixar arquivo.';
    } else if (error.message?.includes('Memory') || error.message?.includes('memory')) {
      errorCategory = 'memory';
      userMessage = 'Documento muito grande. Considere dividir em arquivos menores.';
    } else if (error.message?.includes('decompression') || error.message?.includes('compressed')) {
      errorCategory = 'compression';
      userMessage = 'Erro na decompressão do PDF. Formato não suportado.';
    } else if (error.message?.includes('corrupted') || error.message?.includes('inválido')) {
      errorCategory = 'corruption';
      userMessage = 'Arquivo corrompido ou inválido.';
    }

    return new Response(
      JSON.stringify({ 
        error: userMessage,
        category: errorCategory,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        requestId,
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
