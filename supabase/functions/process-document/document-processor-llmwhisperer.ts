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
  pages: number;
  ocrUsed: boolean;
  whisperHash?: string; // For async flow detection
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
    
    const { text, extractionTime, metadata, whisperHash } = await this.extractTextWithLLMWhisperer(document);
    
    // If we got a whisper_hash instead of direct text, we need to handle async flow
    if (whisperHash && !text) {
      this.logger.warn(`⚠️ Received whisper_hash: ${whisperHash} - Async flow detected, will need to implement polling`);
      
      // For now, mark as processing and return the whisper_hash for further investigation
      return {
        success: false,
        chunksCreated: 0,
        chunksFailed: 0,
        processingTimeMs: Date.now() - startTime,
        extractionTimeMs: extractionTime,
        chunkingTimeMs: 0,
        textLength: 0,
        averageEmbeddingTimeMs: 0,
        processingRate: 0,
        successRate: 0,
        extractionMethod: 'LLMWhisperer',
        pages: metadata.pages || 0,
        ocrUsed: metadata.ocr_used || false,
        whisperHash
      };
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
      extractionQuality: 95, // LLMWhisperer provides high quality
      extractionMethod: 'LLMWhisperer'
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
      extractionMethod: 'LLMWhisperer',
      pages: metadata.pages || 0,
      ocrUsed: metadata.ocr_used || false,
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

  private async extractTextWithLLMWhisperer(document: any): Promise<{
    text: string;
    extractionTime: number;
    metadata: any;
    whisperHash?: string;
  }> {
    this.logger.log('🚀 Starting LLMWhisperer extraction...');
    const extractionStartTime = Date.now();
    
    try {
      this.logger.log(`📥 Processing PDF with LLMWhisperer V2: ${document.url}`);
      
      const result = await this.llmWhispererService.processDocument(document.url);
      
      const extractionTime = Date.now() - extractionStartTime;
      
      // Check if we got a whisper_hash (async flow)
      if (result.whisper_hash) {
        this.logger.warn(`⚠️ LLMWhisperer returned whisper_hash: ${result.whisper_hash}`);
        this.logger.warn(`📝 This indicates async processing flow - will need to implement polling`);
        
        return {
          text: '',
          extractionTime,
          metadata: result.result?.metadata || {},
          whisperHash: result.whisper_hash
        };
      }
      
      // Get text from markdown or text field
      const extractedText = result.result.markdown || result.result.text || '';
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('LLMWhisperer returned empty text');
      }

      if (extractedText.length < 10) {
        throw new Error('Extracted text too short for processing (minimum 10 characters)');
      }

      this.logger.success(`✅ LLMWhisperer extraction completed in ${extractionTime}ms`);
      this.logger.stats(`📝 Text extracted: ${extractedText.length} characters`);
      this.logger.stats(`📄 Pages processed: ${result.result.metadata.pages || 'unknown'}`);
      this.logger.stats(`🔍 OCR used: ${result.result.metadata.ocr_used ? 'Yes' : 'No'}`);
      
      // Update document with extraction info
      await this.updateDocumentExtractionInfo(
        document.id, 
        'LLMWhisperer', 
        95, // High quality score for LLMWhisperer
        result.result.metadata
      );

      return {
        text: extractedText,
        extractionTime,
        metadata: result.result.metadata
      };
      
    } catch (error) {
      this.logger.error('❌ LLMWhisperer extraction failed:', error);
      
      let errorMessage = error.message;
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'LLMWhisperer processing timeout (3 minutes). Document may be too complex.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Invalid LLMWhisperer API key or authentication method. Please check configuration.';
      } else if (error.message?.includes('429')) {
        errorMessage = 'LLMWhisperer rate limit exceeded. Please try again later.';
      } else if (error.message?.includes('file_url')) {
        errorMessage = 'Document URL not accessible by LLMWhisperer. Check file permissions.';
      }
      
      throw new Error(errorMessage);
    }
  }

  private async updateDocumentExtractionInfo(
    documentId: string, 
    method: string, 
    quality: number,
    metadata: any
  ) {
    try {
      const { updateDocumentExtractionInfo } = await import('./database-service.ts');
      await updateDocumentExtractionInfo(documentId, method, quality);
      
      // Update document metadata with LLMWhisperer info
      const { supabase } = await import('https://esm.sh/@supabase/supabase-js@2.49.8');
      const client = supabase(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await client
        .from('documents')
        .update({
          metadata: {
            llmwhisperer: metadata,
            extraction_timestamp: new Date().toISOString()
          }
        })
        .eq('id', documentId);

    } catch (error) {
      this.logger.warn('Failed to update document extraction info:', error);
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
    this.logger.log('🔧 Creating optimized chunks from LLMWhisperer output...');
    const chunkingStartTime = Date.now();
    
    // Clean existing chunks first
    await this.cleanExistingChunks(documentId);
    
    let processedChunks = 0;
    let totalEmbeddingTime = 0;
    let failedChunks = 0;
    
    // Use larger chunk size for high-quality LLMWhisperer output
    const chunks = splitTextIntoChunks(text, 1500, 200);
    this.logger.log(`📦 Created ${chunks.length} chunks for processing`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const chunkStartTime = Date.now();
        
        this.logger.log(`🔄 Processing chunk ${i + 1}/${chunks.length}: ${chunk.content.length} chars`);
        
        // Generate embedding with retry logic
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
        
        // Enhanced chunk metadata with LLMWhisperer info
        const chunkData = {
          chunk_index: i,
          content: chunk.content,
          metadata: {
            ...chunk.metadata,
            extraction_method: 'LLMWhisperer',
            extraction_quality: 95,
            llmwhisperer_metadata: metadata,
            processing_timestamp: new Date().toISOString(),
            embedding_time_ms: embeddingTime
          }
        };
        
        await saveChunkWithEmbedding(documentId, chunkData, embedding);
        
        processedChunks++;
        const chunkTime = Date.now() - chunkStartTime;
        this.logger.success(`✅ Chunk ${i + 1} processed in ${chunkTime}ms (embedding: ${embeddingTime}ms)`);
        
        // Progress logging every 5 chunks
        if (processedChunks % 5 === 0) {
          const progress = ((processedChunks / chunks.length) * 100).toFixed(1);
          this.logger.progress(`📈 Progress: ${processedChunks}/${chunks.length} chunks (${progress}%)`);
        }
        
      } catch (chunkError) {
        failedChunks++;
        this.logger.error(`❌ Error processing chunk ${i + 1}:`, chunkError);
        
        // Continue processing other chunks, don't fail completely
        if (failedChunks > chunks.length * 0.5) { // Stop if >50% failures
          throw new Error(`Too many chunk failures (${failedChunks}/${chunks.length}). Last error: ${chunkError.message}`);
        }
      }
    }

    const chunkingTime = Date.now() - chunkingStartTime;
    
    if (processedChunks === 0) {
      throw new Error('No chunks were successfully created from the extracted text');
    }

    this.logger.success(`🎉 Chunking completed: ${processedChunks} successful, ${failedChunks} failed`);

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

      this.logger.log('🧹 Cleaning existing chunks...');
      
      await supabase
        .from('document_sections')
        .delete()
        .eq('document_id', documentId);

      this.logger.log('✅ Existing chunks cleaned');
    } catch (error) {
      this.logger.warn('Failed to clean existing chunks:', error);
    }
  }
}
