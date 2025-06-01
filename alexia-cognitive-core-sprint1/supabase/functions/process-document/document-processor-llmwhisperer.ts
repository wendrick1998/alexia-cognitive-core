import { LLMWhispererService } from './llm-whisperer-service.ts';
import { splitTextIntoChunks } from './text-chunker-optimized.ts';
import { saveChunkWithEmbedding, getDocument } from './database-service.ts';
import { generateEmbedding } from './embedding-service.ts';
import { ProcessingLogger } from './logger.ts';
import { StatusManager } from './status-manager.ts';

export interface LLMWhispererProcessingResult {
  success: boolean;
  chunksCreated: number;
  chunksFailed: number;
  processingTimeMs: number;
  extractionTimeMs: number;
  chunkingTimeMs: number;
  textLength: number;
  averageEmbeddingTimeMs: number;
  processingRate: number;
  successRate: number;
  extractionMethod: string;
  extractionQuality: number;
  pages: number;
  ocrUsed: boolean;
  whisperHash: string;
}

export class DocumentProcessorLLMWhisperer {
  private logger: ProcessingLogger;
  private statusManager: StatusManager;
  private openAIApiKey: string;
  private llmWhispererService: LLMWhispererService;

  constructor(logger: ProcessingLogger, openAIApiKey: string, llmWhispererApiKey: string) {
    this.logger = logger;
    this.statusManager = new StatusManager(logger);
    this.openAIApiKey = openAIApiKey;
    this.llmWhispererService = new LLMWhispererService(llmWhispererApiKey);
  }

  async processDocument(documentId: string): Promise<LLMWhispererProcessingResult> {
    const startTime = Date.now();

    await this.statusManager.setProcessing(documentId);

    const document = await this.getAndValidateDocument(documentId);
    
    // Download do arquivo do Supabase Storage
    const fileBuffer = await this.downloadFileFromStorage(document.url);
    
    // Salvar whisper_hash inicial e atualizar status
    await this.updateDocumentStatus(documentId, 'aguardando_llmwhisperer', null);
    
    // Processar com LLMWhisperer usando fluxo assíncrono completo
    const { text, extractionTime, metadata, whisperHash } = await this.processWithLLMWhispererV2(
      fileBuffer, 
      document.title || 'document.pdf'
    );
    
    // Salvar whisper_hash final no documento
    await this.updateDocumentMetadata(documentId, { 
      llmwhisperer_hash: whisperHash,
      llmwhisperer_metadata: metadata
    });
    
    // Verificar se obtivemos texto válido
    if (!text || text.trim().length === 0) {
      throw new Error('LLMWhisperer não retornou texto válido após processamento completo');
    }
    
    const { chunksCreated, chunksFailed, chunkingTime, totalEmbeddingTime } = 
      await this.processChunks(documentId, text, metadata);

    await this.statusManager.setCompleted(documentId);

    const totalTime = Date.now() - startTime;
    const avgEmbeddingTime = chunksCreated > 0 ? totalEmbeddingTime / chunksCreated : 0;
    const processingRate = chunksCreated / (totalTime / 1000);
    const successRate = ((chunksCreated / (chunksCreated + chunksFailed)) * 100);

    this.logger.logCompletionHeader();
    this.logger.logFinalStats({
      documentId,
      chunksCreated,
      chunksFailed,
      totalTime,
      extractionTime,
      chunkingTime,
      avgEmbeddingTime,
      processingRate,
      textLength: text.length,
      successRate,
      extractionQuality: 95,
      extractionMethod: 'LLMWhisperer V2'
    });

    return {
      success: true,
      chunksCreated,
      chunksFailed,
      processingTimeMs: totalTime,
      extractionTimeMs: extractionTime,
      chunkingTimeMs: chunkingTime,
      textLength: text.length,
      averageEmbeddingTimeMs: Math.round(avgEmbeddingTime),
      processingRate: parseFloat(processingRate.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(1)),
      extractionMethod: 'LLMWhisperer V2',
      extractionQuality: 95,
      pages: metadata.pages || 0,
      ocrUsed: true,
      whisperHash
    };
  }

  private async getAndValidateDocument(documentId: string) {
    const document = await getDocument(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    this.logger.info('Document found:');
    this.logger.log(`- Title: ${document.title}`);
    this.logger.log(`- Type: ${document.type}`);
    this.logger.log(`- URL: ${document.url}`);
    this.logger.log(`- Size: ${document.file_size || 'unknown'} bytes`);
    this.logger.log(`- Source: ${document.source}`);

    if (!document.url) {
      throw new Error('Document URL not found');
    }

    if (!document.type || document.type.toLowerCase() !== 'pdf') {
      throw new Error(`Unsupported document type: ${document.type}. Only PDF files are supported.`);
    }

    return document;
  }

  private async downloadFileFromStorage(fileUrl: string): Promise<ArrayBuffer> {
    this.logger.log(`📥 Baixando arquivo do Supabase Storage: ${fileUrl}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout no download, abortando...');
        controller.abort();
      }, 120000); // 2 minutos timeout para download
      
      const response = await fetch(fileUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Alex-IA-Document-Processor/3.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Falha no download: ${response.status} ${response.statusText}`);
      }

      const fileBuffer = await response.arrayBuffer();
      this.logger.log(`✅ Arquivo baixado: ${fileBuffer.byteLength} bytes`);
      
      return fileBuffer;
      
    } catch (error) {
      this.logger.error('❌ Erro no download do arquivo:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout no download do arquivo (2 minutos)');
      }
      
      throw new Error(`Erro ao baixar arquivo: ${error.message}`);
    }
  }

  private async processWithLLMWhispererV2(
    fileBuffer: ArrayBuffer, 
    fileName: string
  ): Promise<{
    text: string;
    extractionTime: number;
    metadata: any;
    whisperHash: string;
  }> {
    this.logger.log('🚀 Iniciando processamento LLMWhisperer V2 com fluxo assíncrono completo...');
    const extractionStartTime = Date.now();
    
    try {
      this.logger.log(`📄 Processando PDF: ${fileName} (${fileBuffer.byteLength} bytes)`);
      
      // Usar configurações otimizadas para Edge Function
      const maxPollingAttempts = 10; // 10 tentativas
      const pollingInterval = 6000; // 6 segundos entre tentativas (total ~60s de polling)
      
      const result = await this.llmWhispererService.processDocumentWithPolling(
        fileBuffer,
        fileName,
        maxPollingAttempts,
        pollingInterval
      );
      
      const extractionTime = Date.now() - extractionStartTime;
      
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('LLMWhisperer V2 retornou texto vazio');
      }

      if (result.text.length < 10) {
        throw new Error('Texto extraído muito curto para processamento (mínimo 10 caracteres)');
      }

      this.logger.success(`✅ LLMWhisperer V2 processamento concluído em ${extractionTime}ms`);
      this.logger.stats(`📝 Texto extraído: ${result.text.length} caracteres`);
      this.logger.stats(`📄 Páginas processadas: ${result.metadata.pages || 'desconhecido'}`);
      this.logger.stats(`🔗 Whisper hash: ${result.whisperHash}`);
      
      return {
        text: result.text,
        extractionTime,
        metadata: result.metadata,
        whisperHash: result.whisperHash
      };
      
    } catch (error) {
      this.logger.error('❌ LLMWhisperer V2 processamento falhou:', error);
      
      let errorMessage = error.message;
      
      if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = 'LLMWhisperer V2 timeout. Documento pode ser muito complexo ou servidor sobrecarregado.';
      } else if (error.message?.includes('401') || error.message?.includes('inválida')) {
        errorMessage = 'Chave API LLMWhisperer inválida. Verifique a configuração da chave API.';
      } else if (error.message?.includes('429') || error.message?.includes('limite')) {
        errorMessage = 'Limite de taxa LLMWhisperer excedido. Tente novamente mais tarde.';
      } else if (error.message?.includes('falhou')) {
        errorMessage = 'Processamento LLMWhisperer falhou. Documento pode estar corrompido ou em formato não suportado.';
      }
      
      throw new Error(errorMessage);
    }
  }

  private async updateDocumentStatus(documentId: string, status: string, whisperHash: string | null) {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.8');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const updateData: any = {
        status_processing: status,
        updated_at: new Date().toISOString()
      };

      if (whisperHash) {
        updateData.metadata = {
          llmwhisperer_hash: whisperHash
        };
      }

      await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId);

      this.logger.log(`📝 Status atualizado para: ${status}`);
    } catch (error) {
      this.logger.warn('Falha ao atualizar status do documento:', error);
    }
  }

  private async updateDocumentMetadata(documentId: string, metadata: any) {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.8');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase
        .from('documents')
        .update({
          metadata: {
            ...metadata,
            extraction_timestamp: new Date().toISOString()
          }
        })
        .eq('id', documentId);

      this.logger.log(`📝 Metadados atualizados`);
    } catch (error) {
      this.logger.warn('Falha ao atualizar metadados do documento:', error);
    }
  }

  private async processChunks(
    documentId: string,
    text: string,
    metadata: any
  ): Promise<{
    chunksCreated: number;
    chunksFailed: number;
    chunkingTime: number;
    totalEmbeddingTime: number;
  }> {
    this.logger.log('🔧 Criando chunks otimizados do resultado LLMWhisperer V2...');
    const chunkingStartTime = Date.now();
    
    await this.cleanExistingChunks(documentId);
    
    let processedChunks = 0;
    let totalEmbeddingTime = 0;
    let failedChunks = 0;
    
    const chunks = splitTextIntoChunks(text, 1500, 200);
    this.logger.log(`📦 Criados ${chunks.length} chunks para processamento`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const chunkStartTime = Date.now();
        
        this.logger.log(`🔄 Processando chunk ${i + 1}/${chunks.length}: ${chunk.content.length} chars`);
        
        let embedding;
        let embeddingTime = 0;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const embeddingStartTime = Date.now();
            embedding = await generateEmbedding(chunk.content, this.openAIApiKey);
            embeddingTime = Date.now() - embeddingStartTime;
            break;
          } catch (embeddingError) {
            this.logger.warn(`⚠️ Embedding attempt ${attempt}/3 failed for chunk ${i + 1}: ${embeddingError.message}`);
            if (attempt === 3) throw embeddingError;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
        
        totalEmbeddingTime += embeddingTime;
        
        const chunkData = {
          chunk_index: i,
          content: chunk.content,
          metadata: {
            ...chunk.metadata,
            extraction_method: 'LLMWhisperer V2',
            extraction_quality: 95,
            llmwhisperer_metadata: metadata,
            processing_timestamp: new Date().toISOString(),
            embedding_time_ms: embeddingTime
          }
        };
        
        await saveChunkWithEmbedding(documentId, chunkData, embedding);
        
        processedChunks++;
        const chunkTime = Date.now() - chunkStartTime;
        this.logger.success(`✅ Chunk ${i + 1} processado em ${chunkTime}ms (embedding: ${embeddingTime}ms)`);
        
        if (processedChunks % 5 === 0) {
          const progress = ((processedChunks / chunks.length) * 100).toFixed(1);
          this.logger.progress(`📈 Progresso: ${processedChunks}/${chunks.length} chunks (${progress}%)`);
        }
        
      } catch (chunkError) {
        failedChunks++;
        this.logger.error(`❌ Erro processando chunk ${i + 1}:`, chunkError);
        
        if (failedChunks > chunks.length * 0.5) {
          throw new Error(`Muitas falhas de chunks (${failedChunks}/${chunks.length}). Último erro: ${chunkError.message}`);
        }
      }
    }

    const chunkingTime = Date.now() - chunkingStartTime;
    
    if (processedChunks === 0) {
      throw new Error('Nenhum chunk foi criado com sucesso do texto extraído');
    }

    this.logger.success(`🎉 Chunking concluído: ${processedChunks} sucessos, ${failedChunks} falhas`);

    return {
      chunksCreated: processedChunks,
      chunksFailed: failedChunks,
      chunkingTime,
      totalEmbeddingTime
    };
  }

  private async cleanExistingChunks(documentId: string) {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.8');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      this.logger.log('🧹 Limpando chunks existentes...');
      
      await supabase
        .from('document_sections')
        .delete()
        .eq('document_id', documentId);

      this.logger.log('✅ Chunks existentes limpos');
    } catch (error) {
      this.logger.warn('Falha ao limpar chunks existentes:', error);
    }
  }
}
