
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
    
    const { text, extractionTime, quality, method } = await this.extractTextUltimate(document);
    
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

  private async extractTextUltimate(document: any): Promise<{
    text: string;
    extractionTime: number;
    quality: number;
    method: string;
  }> {
    this.logger.log('🔍 Starting ultimate PDF extraction...');
    const extractionStartTime = Date.now();
    
    try {
      // Download the file
      const response = await fetch(document.url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const pdfBuffer = new Uint8Array(arrayBuffer);
      
      // Use ultimate extractor
      const extractor = new UltimatePDFExtractor();
      const result = await extractor.extractText(pdfBuffer);
      
      const extractionTime = Date.now() - extractionStartTime;
      
      this.logger.success(`Extraction completed in ${extractionTime}ms`);
      this.logger.stats(`Method: ${result.method}, Quality: ${result.quality.toFixed(2)}%`);
      this.logger.stats(`Text extracted: ${result.text.length} characters`);
      
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('No text was extracted from the document');
      }

      if (result.text.length < 10) {
        throw new Error('Extracted text too short for useful processing');
      }

      return {
        text: result.text,
        extractionTime,
        quality: result.quality,
        method: result.method
      };
    } catch (error) {
      this.logger.error('Ultimate extraction failed, trying fallback...', error);
      
      // Fallback to basic extraction if ultimate fails
      const fallbackResult = await this.basicFallbackExtraction(document.url);
      const extractionTime = Date.now() - extractionStartTime;
      
      return {
        text: fallbackResult,
        extractionTime,
        quality: 30, // Low quality for fallback
        method: 'fallback'
      };
    }
  }

  private async basicFallbackExtraction(url: string): Promise<string> {
    this.logger.warn('Using basic fallback extraction...');
    
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Very basic text extraction as last resort
    const decoder = new TextDecoder('latin1');
    const content = decoder.decode(uint8Array);
    
    const textMatches = content.match(/\(([^)]+)\)/g);
    let text = '';
    
    if (textMatches) {
      for (const match of textMatches) {
        const extracted = match.slice(1, -1);
        if (extracted.length > 3 && /[a-zA-Z]/.test(extracted)) {
          text += extracted + ' ';
        }
      }
    }
    
    if (text.length < 10) {
      throw new Error('Fallback extraction also failed to extract readable text');
    }
    
    return text.trim();
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
    this.logger.log('🔧 Creating chunks with optimized processing...');
    const chunkingStartTime = Date.now();
    
    let processedChunks = 0;
    let totalEmbeddingTime = 0;
    let failedChunks = 0;
    
    const chunks = createChunks(text, 1000);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const chunkStartTime = Date.now();
        
        this.logger.log(`🔄 Processing chunk ${i + 1}/${chunks.length}: ${chunk.length} chars`);
        
        if (!chunk || chunk.trim().length < 10) {
          this.logger.warn(`Chunk ${i + 1} too small, skipping...`);
          continue;
        }
        
        const embeddingStartTime = Date.now();
        const embedding = await generateEmbedding(chunk, this.openAIApiKey);
        const embeddingTime = Date.now() - embeddingStartTime;
        totalEmbeddingTime += embeddingTime;
        
        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
          throw new Error(`Invalid embedding generated for chunk ${i}`);
        }
        
        const chunkData = {
          chunk_index: i,
          content: chunk,
          metadata: {
            extraction_quality: quality,
            extraction_method: method,
            chunk_size: chunk.length
          }
        };
        
        await saveChunkWithEmbedding(documentId, chunkData, embedding);
        
        processedChunks++;
        const chunkTime = Date.now() - chunkStartTime;
        this.logger.success(`Chunk ${i + 1} processed in ${chunkTime}ms (embedding: ${embeddingTime}ms)`);
        
        if (processedChunks % 5 === 0) {
          this.logger.progress(`Progress: ${processedChunks}/${chunks.length} chunks processed...`);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
      } catch (chunkError) {
        failedChunks++;
        this.logger.error(`Error in chunk ${i}:`, chunkError);
        
        if (failedChunks > 3) {
          throw new Error(`Too many chunk failures (${failedChunks}). Last error: ${chunkError.message}`);
        }
      }
    }

    const chunkingTime = Date.now() - chunkingStartTime;
    
    if (processedChunks === 0) {
      throw new Error('No chunks were successfully created from the extracted text');
    }

    return {
      chunksCreated: processedChunks,
      chunksFailed: failedChunks,
      chunkingTime,
      totalEmbeddingTime
    };
  }
}
