
import { ProcessingLogger } from './logger.ts';
import { updateDocumentStatus } from './database-service.ts';

export interface ProcessingError {
  message: string;
  category: string;
  userMessage: string;
  statusCode: number;
}

export class ErrorHandler {
  private logger: ProcessingLogger;

  constructor(logger: ProcessingLogger) {
    this.logger = logger;
  }

  categorizeError(error: Error): ProcessingError {
    let errorCategory = 'unknown';
    let userMessage = error.message;
    let statusCode = 500;

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
      statusCode = 400;
    } else if (error.message?.includes('Document ID')) {
      errorCategory = 'validation';
      userMessage = error.message;
      statusCode = 400;
    }

    return {
      message: error.message,
      category: errorCategory,
      userMessage,
      statusCode
    };
  }

  async handleError(
    error: Error, 
    documentId: string | undefined, 
    processingTime: number, 
    requestId: string
  ): Promise<Response> {
    this.logger.logErrorHeader(processingTime, documentId);
    this.logger.error('Erro:', error);
    this.logger.error('Stack:', error.stack);

    // Update document status to failed with detailed error
    if (documentId) {
      try {
        await updateDocumentStatus(documentId, 'failed', error.message);
        this.logger.log('📝 Status atualizado para \'failed\'');
      } catch (statusError) {
        this.logger.error('Erro ao atualizar status:', statusError);
      }
    }

    const categorizedError = this.categorizeError(error);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    return new Response(
      JSON.stringify({ 
        error: categorizedError.userMessage,
        category: categorizedError.category,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString(),
        requestId,
        details: categorizedError.message
      }),
      { 
        status: categorizedError.statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
