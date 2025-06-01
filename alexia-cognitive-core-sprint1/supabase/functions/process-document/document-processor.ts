
import { UltimatePDFExtractor, createChunks } from './pdf-extractor-ultimate.ts';
import { generateEmbedding } from './embedding-service.ts';
import { saveChunkWithEmbedding, getDocument } from './database-service.ts';
import { ProcessingLogger } from './logger.ts';
import { StatusManager } from './status-manager.ts';

export interface ProcessingResult {
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
  extractionQuality: number;
  extractionMethod: string;
}

export class DocumentProcessor {
  private logger: ProcessingLogger;
  private statusManager: StatusManager;
  private openAIApiKey: string;

  constructor(logger: ProcessingLogger, openAIApiKey: string) {
    this.logger = logger;
    this.statusManager = new StatusManager(logger);
    this.openAIApiKey = openAIApiKey;
  }

  async processDocument(documentId: string): Promise<ProcessingResult> {
    const startTime = Date.now();

    await this.statusManager.setProcessing(documentId);

    const document = await this.getAndValidateDocument(documentId);
    
    const { text, extractionTime, quality, method } = await this.extractTextWithUltimateExtractor(document);
    
    const { chunksCreated, chunksFailed, chunkingTime, totalEmbeddingTime } = 
      await this.processChunks(documentId, text, quality, method);

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
      extractionQuality: quality,
      extractionMethod: method
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
      extractionQuality: quality,
      extractionMethod: method
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

    return document;
  }

  private async extractTextWithUltimateExtractor(document: any): Promise<{
    text: string;
    extractionTime: number;
    quality: number;
    method: string;
  }> {
    this.logger.log('🚀 Starting Ultimate PDF Extractor...');
    const extractionStartTime = Date.now();
    
    try {
      // Validate document type
      if (!document.type || document.type.toLowerCase() !== 'pdf') {
        throw new Error(`Unsupported document type: ${document.type}. Only PDF files are supported.`);
      }

      this.logger.log(`📥 Downloading PDF from: ${document.url}`);
      
      // Download the file with enhanced error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        this.logger.warn('Download timeout reached, aborting...');
        controller.abort();
      }, 300000); // 5 minutes timeout
      
      const response = await fetch(document.url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Alex-IA-Ultimate-Processor/1.0',
          'Accept': 'application/pdf,*/*',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength) : 'unknown';
      this.logger.log(`📊 PDF downloaded: ${fileSize} bytes`);

      // Validate file size
      if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('PDF file too large (>50MB). Please use a smaller file.');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = new Uint8Array(arrayBuffer);
      
      this.logger.log(`🔍 Starting Ultimate PDF extraction on ${pdfBuffer.length} bytes...`);
      
      // Use Ultimate PDF Extractor
      const extractor = new UltimatePDFExtractor();
      const result = await extractor.extractText(pdfBuffer);
      
      const extractionTime = Date.now() - extractionStartTime;
      
      this.logger.success(`✅ Ultimate extraction completed in ${extractionTime}ms`);
      this.logger.stats(`🎯 Method: ${result.method}`);
      this.logger.stats(`📊 Quality: ${result.quality.toFixed(2)}%`);
      this.logger.stats(`📝 Text extracted: ${result.text.length} characters`);
      this.logger.stats(`📄 Pages detected: ${result.metadata.pages}`);
      this.logger.stats(`💭 Valid words: ${result.metadata.validWords}`);
      
      // Validate extracted text quality
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('Ultimate extractor returned empty text');
      }

      if (result.text.length < 10) {
        throw new Error('Extracted text too short for processing (minimum 10 characters)');
      }

      if (result.quality < 15) {
        this.logger.warn(`⚠️ Low quality extraction: ${result.quality.toFixed(2)}%`);
      }

      return {
        text: result.text,
        extractionTime,
        quality: result.quality,
        method: result.method
      };
      
    } catch (error) {
      this.logger.error('❌ Ultimate PDF extraction failed:', error);
      
      // Enhanced error categorization
      let errorMessage = error.message;
      
      if (error.name === 'AbortError') {
        errorMessage = 'PDF download timeout (5 minutes). File may be too large or network issues.';
      } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
        errorMessage = `Network error downloading PDF: ${error.message}`;
      } else if (error.message?.includes('PDF') || error.message?.includes('pdf')) {
        errorMessage = `PDF processing error: ${error.message}`;
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Processing timeout. PDF may be too complex.';
      } else if (error.message?.includes('memory') || error.message?.includes('Memory')) {
        errorMessage = 'PDF too large for processing. Try a smaller file.';
      }
      
      throw new Error(errorMessage);
    }
  }

  private async processChunks(
    documentId: string,
    text: string,
    quality: number,
    method: string
  ): Promise<{
    chunksCreated: number;
    chunksFailed: number;
    chunkingTime: number;
    totalEmbeddingTime: number;
  }> {
    this.logger.log('🔧 Creating optimized chunks...');
    const chunkingStartTime = Date.now();
    
    let processedChunks = 0;
    let totalEmbeddingTime = 0;
    let failedChunks = 0;
    
    // Use optimized chunk size based on quality
    const chunkSize = quality >= 70 ? 1200 : quality >= 50 ? 1000 : 800;
    this.logger.log(`📏 Using chunk size: ${chunkSize} (based on quality: ${quality.toFixed(1)}%)`);
    
    const chunks = createChunks(text, chunkSize);
    this.logger.log(`📦 Created ${chunks.length} chunks for processing`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const chunkStartTime = Date.now();
        
        this.logger.log(`🔄 Processing chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
        
        // Validate chunk quality
        if (!chunk || chunk.trim().length < 20) {
          this.logger.warn(`⚠️ Chunk ${i + 1} too small (${chunk.length} chars), skipping...`);
          continue;
        }
        
        // Generate embedding with retry logic
        let embedding;
        let embeddingTime = 0;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const embeddingStartTime = Date.now();
            embedding = await generateEmbedding(chunk, this.openAIApiKey);
            embeddingTime = Date.now() - embeddingStartTime;
            break;
          } catch (embeddingError) {
            this.logger.warn(`⚠️ Embedding attempt ${attempt}/3 failed for chunk ${i + 1}: ${embeddingError.message}`);
            if (attempt === 3) throw embeddingError;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Progressive delay
          }
        }
        
        totalEmbeddingTime += embeddingTime;
        
        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
          throw new Error(`Invalid embedding generated for chunk ${i + 1}`);
        }
        
        // Enhanced chunk metadata
        const chunkData = {
          chunk_index: i,
          content: chunk,
          metadata: {
            extraction_quality: quality,
            extraction_method: method,
            chunk_size: chunk.length,
            word_count: chunk.split(/\s+/).length,
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
          
          // Small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (chunkError) {
        failedChunks++;
        this.logger.error(`❌ Error processing chunk ${i + 1}:`, chunkError);
        
        // Stop processing if too many failures
        if (failedChunks > Math.max(3, chunks.length * 0.1)) { // Max 10% failure rate
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
}
