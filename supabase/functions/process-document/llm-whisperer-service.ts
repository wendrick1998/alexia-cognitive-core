
// LLMWhisperer API integration service
export interface LLMWhispererRequest {
  file_url: string;
  output_format: 'markdown' | 'text';
  language: string;
  ocr: boolean;
}

export interface LLMWhispererResponse {
  status: string;
  result: {
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
      console.log(`✅ LLMWhisperer processamento concluído`);
      console.log(`📊 Metadados: ${JSON.stringify(result.result?.metadata || {}, null, 2)}`);
      
      // Check for async flow
      if (result.whisper_hash) {
        console.log(`🔄 Detected async flow with whisper_hash: ${result.whisper_hash}`);
        console.log(`📝 Full response for debugging:`, JSON.stringify(result, null, 2));
      }

      if (!result.result?.markdown && !result.result?.text && !result.whisper_hash) {
        throw new Error('LLMWhisperer não retornou texto válido nem whisper_hash');
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
}
