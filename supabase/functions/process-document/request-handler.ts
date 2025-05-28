
import { DocumentProcessorLLMWhisperer } from './document-processor-llmwhisperer.ts';
import { ProcessingLogger } from './logger.ts';
import { ErrorHandler } from './error-handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export class RequestHandler {
  private openAIApiKey: string;
  private llmWhispererApiKey: string;

  constructor() {
    this.openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';
    this.llmWhispererApiKey = Deno.env.get('LLM_WHISPERER_API_KEY') || '';
  }

  async handleRequest(req: Request): Promise<Response> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID().substring(0, 8);
    const logger = new ProcessingLogger(requestId);
    const errorHandler = new ErrorHandler(logger);
    
    logger.logStartHeader();
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    let documentId: string | undefined;
    
    try {
      // Enhanced environment validation
      if (!this.openAIApiKey) {
        logger.error('OpenAI API key não configurada');
        throw new Error('OpenAI API key não configurada no ambiente');
      }

      if (!this.llmWhispererApiKey) {
        logger.error('LLMWhisperer API key não configurada');
        throw new Error('LLMWhisperer API key não configurada no ambiente');
      }
      
      // Parse and validate request
      const requestBody = await req.json();
      documentId = requestBody.documentId;
      
      if (!documentId) {
        logger.error('Document ID não fornecido');
        return new Response(
          JSON.stringify({ error: 'Document ID é obrigatório', requestId }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      logger.log(`🎯 Processando documento com LLMWhisperer: ${documentId}`);
      
      // Process the document with LLMWhisperer
      const processor = new DocumentProcessorLLMWhisperer(logger, this.openAIApiKey, this.llmWhispererApiKey);
      const result = await processor.processDocument(documentId);

      return new Response(
        JSON.stringify({ 
          ...result,
          message: `Documento processado com sucesso via LLMWhisperer`,
          requestId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      const processingTime = Date.now() - startTime;
      return await errorHandler.handleError(error as Error, documentId, processingTime, requestId);
    }
  }
}
