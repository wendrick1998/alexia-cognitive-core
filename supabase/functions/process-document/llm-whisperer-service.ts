
// LLMWhisperer API integration service
export interface LLMWhispererRequest {
  file_url: string;
  output_format: 'markdown' | 'text';
  language: string;
  ocr: boolean;
}

export interface LLMWhispererResponse {
  status: string;
  result?: {
    text?: string;
    markdown?: string;
    metadata: {
      pages: number;
      ocr_used: boolean;
      processing_time_ms: number;
      [key: string]: any;
    };
  };
  message?: string;
  whisper_hash?: string; // For async flow detection
}

export interface LLMWhispererStatusResponse {
  status: 'processing' | 'processed' | 'failed';
  message?: string;
  whisper_hash: string;
}

export interface LLMWhispererRetrieveResponse {
  result_text: string;
  metadata: {
    pages: number;
    processing_time_ms: number;
    [key: string]: any;
  };
  whisper_hash: string;
}

export class LLMWhispererService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://llmwhisperer-api.us-central.unstract.com/api/v2') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async processDocument(fileUrl: string): Promise<LLMWhispererResponse> {
    console.log(`🔄 Iniciando processamento LLMWhisperer para: ${fileUrl}`);
    
    // Debug: Verificar se a chave API está disponível (mascarada)
    if (!this.apiKey) {
      console.error('❌ Chave API do LLMWhisperer não encontrada');
      throw new Error('LLMWhisperer API key não configurada');
    }
    
    const maskedKey = this.apiKey.substring(0, 8) + '...' + this.apiKey.substring(this.apiKey.length - 4);
    console.log(`🔑 Usando chave API (mascarada): ${maskedKey}`);
    console.log(`🌐 URL da API: ${this.baseUrl}/whisper`);
    
    const request: LLMWhispererRequest = {
      file_url: fileUrl,
      output_format: 'markdown',
      language: 'pt',
      ocr: true
    };

    console.log('📋 Payload LLMWhisperer:', JSON.stringify(request, null, 2));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout LLMWhisperer, abortando...');
        controller.abort();
      }, 180000); // 3 minutos timeout

      const headers = {
        'unstract-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      console.log('📤 Headers da requisição (chave mascarada):', {
        'unstract-key': maskedKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });

      const response = await fetch(`${this.baseUrl}/whisper`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📥 Status da resposta: ${response.status} ${response.statusText}`);
      console.log(`📋 Headers da resposta:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro LLMWhisperer: ${response.status} ${response.statusText}`);
        console.error(`📄 Resposta de erro: ${errorText}`);
        
        // Tentar parsear o erro para obter mais detalhes
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorText;
        } catch (parseError) {
          console.log('⚠️ Não foi possível parsear a resposta de erro como JSON');
        }
        
        // Tratamento específico para diferentes tipos de erro
        if (response.status === 401) {
          throw new Error(`Chave API inválida ou inativa. Verifique sua assinatura do LLMWhisperer. Detalhes: ${errorDetails}`);
        } else if (response.status === 403) {
          throw new Error(`Acesso negado. Verifique as permissões da sua chave API. Detalhes: ${errorDetails}`);
        } else if (response.status === 429) {
          throw new Error(`Limite de taxa excedido. Aguarde antes de tentar novamente. Detalhes: ${errorDetails}`);
        } else if (response.status >= 500) {
          throw new Error(`Erro interno do servidor LLMWhisperer. Tente novamente mais tarde. Detalhes: ${errorDetails}`);
        } else {
          throw new Error(`LLMWhisperer API error: ${response.status} ${response.statusText} - ${errorDetails}`);
        }
      }

      const result: LLMWhispererResponse = await response.json();
      console.log(`✅ LLMWhisperer requisição enviada com sucesso`);
      
      // Check for async flow (status 202 with whisper_hash)
      if (response.status === 202 && result.whisper_hash) {
        console.log(`🔄 Fluxo assíncrono detectado com whisper_hash: ${result.whisper_hash}`);
        console.log(`📝 Resposta completa:`, JSON.stringify(result, null, 2));
        
        // Poll for completion
        const finalResult = await this.pollForCompletion(result.whisper_hash);
        return finalResult;
      }

      // Direct result (synchronous flow)
      console.log(`📊 Metadados: ${JSON.stringify(result.result?.metadata || {}, null, 2)}`);

      if (!result.result?.markdown && !result.result?.text) {
        throw new Error('LLMWhisperer não retornou texto válido');
      }

      return result;

    } catch (error) {
      console.error('❌ Erro no processamento LLMWhisperer:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout no processamento LLMWhisperer (3 minutos)');
      }
      
      // Re-throw com a mensagem original se já for um erro tratado
      throw error;
    }
  }

  async pollForCompletion(whisperHash: string): Promise<LLMWhispererResponse> {
    console.log(`🔄 Iniciando polling para whisper_hash: ${whisperHash}`);
    
    const maxAttempts = 60; // 10 minutos máximo (10 segundos entre tentativas)
    const pollInterval = 10000; // 10 segundos
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📊 Polling tentativa ${attempt}/${maxAttempts} para ${whisperHash}`);
        
        const statusResponse = await this.getStatus(whisperHash);
        console.log(`📋 Status atual: ${statusResponse.status}`);
        
        if (statusResponse.status === 'processed') {
          console.log(`✅ Processamento concluído! Retrieving resultado...`);
          const retrieveResponse = await this.retrieveResult(whisperHash);
          
          return {
            status: 'completed',
            result: {
              markdown: retrieveResponse.result_text,
              text: retrieveResponse.result_text,
              metadata: {
                pages: retrieveResponse.metadata.pages || 0,
                ocr_used: true,
                processing_time_ms: retrieveResponse.metadata.processing_time_ms || 0,
                ...retrieveResponse.metadata
              }
            },
            whisper_hash: whisperHash
          };
        } else if (statusResponse.status === 'failed') {
          throw new Error(`Processamento LLMWhisperer falhou: ${statusResponse.message || 'Erro desconhecido'}`);
        }
        
        // Still processing, wait before next attempt
        if (attempt < maxAttempts) {
          console.log(`⏳ Aguardando ${pollInterval/1000}s antes da próxima verificação...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
      } catch (error) {
        console.error(`❌ Erro no polling tentativa ${attempt}:`, error);
        
        if (attempt === maxAttempts) {
          throw new Error(`Timeout no polling após ${maxAttempts} tentativas: ${error.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    throw new Error(`Timeout no processamento LLMWhisperer após ${maxAttempts * pollInterval / 1000}s`);
  }

  async getStatus(whisperHash: string): Promise<LLMWhispererStatusResponse> {
    const response = await fetch(`${this.baseUrl}/whisper-status?whisper_hash=${whisperHash}`, {
      method: 'GET',
      headers: {
        'unstract-key': this.apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao verificar status: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  async retrieveResult(whisperHash: string): Promise<LLMWhispererRetrieveResponse> {
    const response = await fetch(`${this.baseUrl}/whisper-retrieve?whisper_hash=${whisperHash}&text_only=false`, {
      method: 'GET',
      headers: {
        'unstract-key': this.apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao recuperar resultado: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }
}
