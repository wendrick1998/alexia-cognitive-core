
import { extractTextFromFile } from './file-extractor.ts';
import { createChunksGenerator } from './text-chunker.ts';
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

    // Update status to processing
    await this.statusManager.setProcessing(documentId);

    // Get document details with validation
    const document = await this.getAndValidateDocument(documentId);
    
    // Extract text with comprehensive error handling
    const { text, extractionTime } = await this.extractText(document);
    
    // Create and process chunks
    const { chunksCreated, chunksFailed, chunkingTime, totalEmbeddingTime } = 
      await this.processChunks(documentId, text);

    // Update status to completed
    await this.statusManager.setCompleted(documentId);

    const totalTime = Date.now() - startTime;
    const avgEmbeddingTime = chunksCreated > 0 ? totalEmbeddingTime / chunksCreated : 0;
    const processingRate = chunksCreated / (totalTime / 1000);
    const successRate = ((chunksCreated / (chunksCreated + chunksFailed)) * 100);

    // Log final statistics
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
      successRate
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
      successRate: parseFloat(successRate.toFixed(1))
    };
  }

  private async getAndValidateDocument(documentId: string) {
    const document = await getDocument(documentId);
    if (!document) {
      throw new Error(`Documento ${documentId} não encontrado`);
    }
    
    this.logger.info('Documento encontrado:');
    this.logger.log(`- Nome: ${document.name}`);
    this.logger.log(`- Tipo: ${document.type}`);
    this.logger.log(`- URL: ${document.url}`);
    this.logger.log(`- Tamanho: ${document.file_size || 'unknown'} bytes`);
    this.logger.log(`- Fonte: ${document.source}`);

    if (!document.url) {
      throw new Error('URL do documento não encontrada');
    }

    return document;
  }

  private async extractText(document: any): Promise<{ text: string; extractionTime: number }> {
    this.logger.log('🔍 Iniciando extração de texto aprimorada...');
    const extractionStartTime = Date.now();
    
    const text = await extractTextFromFile(document.url, document.type);
    
    const extractionTime = Date.now() - extractionStartTime;
    this.logger.success(`Extração concluída em ${extractionTime}ms`);
    this.logger.stats(`Texto extraído: ${text.length} caracteres`);
    
    // Enhanced text validation
    if (!text || text.trim().length === 0) {
      throw new Error('Nenhum texto foi extraído do documento');
    }

    if (text.length < 5) {
      throw new Error('Texto extraído muito curto para processamento útil');
    }

    // Comprehensive text quality validation for PDFs
    if (document.type.toLowerCase() === 'pdf') {
      this.validatePDFQuality(text);
    }

    return { text, extractionTime };
  }

  private validatePDFQuality(text: string) {
    const words = text.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F]{2,}\b/g) || [];
    const readableChars = (text.match(/[a-zA-Z0-9À-ÿ\u00C0-\u017F\s\.\,\!\?\;\:\-\(\)\[\]\"\']/g) || []).length;
    const qualityRatio = readableChars / text.length;
    
    this.logger.stats('Análise de qualidade do PDF:');
    this.logger.log(`- Palavras encontradas: ${words.length}`);
    this.logger.log(`- Caracteres legíveis: ${readableChars}/${text.length}`);
    this.logger.log(`- Qualidade do texto: ${(qualityRatio * 100).toFixed(1)}%`);
    
    if (qualityRatio < 0.2) {
      this.logger.warn('Qualidade muito baixa detectada, mas prosseguindo...');
    }
    
    if (words.length < 5) {
      throw new Error(`PDF pode estar corrompido: apenas ${words.length} palavras detectadas`);
    }
  }

  private async processChunks(documentId: string, text: string): Promise<{
    chunksCreated: number;
    chunksFailed: number;
    chunkingTime: number;
    totalEmbeddingTime: number;
  }> {
    this.logger.log('🔧 Criando chunks com processamento otimizado...');
    const chunkingStartTime = Date.now();
    
    let processedChunks = 0;
    let totalEmbeddingTime = 0;
    let failedChunks = 0;
    const chunkGenerator = createChunksGenerator(text);
    
    for (const chunk of chunkGenerator) {
      try {
        const chunkStartTime = Date.now();
        
        this.logger.log(`🔄 Processando chunk ${chunk.chunk_index + 1}: ${chunk.content.length} chars`);
        
        // Validate chunk content
        if (!chunk.content || chunk.content.trim().length < 10) {
          this.logger.warn(`Chunk ${chunk.chunk_index + 1} muito pequeno, pulando...`);
          continue;
        }
        
        // Generate embedding with retries
        const embeddingStartTime = Date.now();
        const embedding = await generateEmbedding(chunk.content, this.openAIApiKey);
        const embeddingTime = Date.now() - embeddingStartTime;
        totalEmbeddingTime += embeddingTime;
        
        // Validate embedding
        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
          throw new Error(`Embedding inválido gerado para chunk ${chunk.chunk_index}`);
        }
        
        // Save to database
        await saveChunkWithEmbedding(documentId, chunk, embedding);
        
        processedChunks++;
        const chunkTime = Date.now() - chunkStartTime;
        this.logger.success(`Chunk ${chunk.chunk_index + 1} processado em ${chunkTime}ms (embedding: ${embeddingTime}ms)`);
        
        // Memory management and progress feedback
        if (processedChunks % 10 === 0) {
          this.logger.progress(`Progresso: ${processedChunks} chunks processados...`);
          await new Promise(resolve => setTimeout(resolve, 50)); // Brief pause for memory
        }
        
      } catch (chunkError) {
        failedChunks++;
        this.logger.error(`Erro no chunk ${chunk.chunk_index}:`, chunkError);
        
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

    return {
      chunksCreated: processedChunks,
      chunksFailed: failedChunks,
      chunkingTime,
      totalEmbeddingTime
    };
  }
}
