
// LLMWhisperer V2 API integration service following official documentation
export interface LLMWhispererSubmissionResponse {
  whisper_hash: string;
  status: string;
  message?: string;
}

export interface LLMWhispererStatusResponse {
  status: 'processing' | 'processed' | 'failed' | 'accepted';
  message?: string;
  whisper_hash: string;
}

export interface LLMWhispererRetrieveResponse {
  result_text: string;
  metadata?: {
    pages?: number;
    processing_time_ms?: number;
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

  async submitDocument(fileBuffer: ArrayBuffer, fileName: string = 'document.pdf'): Promise<LLMWhispererSubmissionResponse> {
    console.log(`🔄 Submetendo documento para LLMWhisperer V2: ${fileName}`);
    
    if (!this.apiKey) {
      console.error('❌ Chave API do LLMWhisperer não encontrada');
      throw new Error('LLMWhisperer API key não configurada');
    }
    
    const maskedKey = this.apiKey.substring(0, 8) + '...' + this.apiKey.substring(this.apiKey.length - 4);
    console.log(`🔑 Usando chave API (mascarada): ${maskedKey}`);
    console.log(`🌐 URL da API: ${this.baseUrl}/whisper`);
    console.log(`📄 Tamanho do arquivo: ${fileBuffer.byteLength} bytes`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout na submissão LLMWhisperer, abortando...');
        controller.abort();
      }, 60000); // 1 minuto timeout para submissão

      // Preparar URL com query parameters conforme documentação oficial
      const url = new URL(`${this.baseUrl}/whisper`);
      url.searchParams.set('output_format', 'markdown');
      url.searchParams.set('lang', 'pt');
      url.searchParams.set('ocr', 'true');

      console.log('📤 URL completa:', url.toString());
      console.log('📋 Query parameters:', Object.fromEntries(url.searchParams));

      const headers = {
        'unstract-key': this.apiKey,
        'Content-Type': 'application/octet-stream'
      };

      console.log('📤 Headers da requisição (chave mascarada):', {
        'unstract-key': maskedKey,
        'Content-Type': 'application/octet-stream'
      });

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: fileBuffer,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📥 Status da resposta: ${response.status} ${response.statusText}`);
      console.log(`📋 Headers da resposta:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro LLMWhisperer: ${response.status} ${response.statusText}`);
        console.error(`📄 Resposta de erro: ${errorText}`);
        
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorText;
        } catch (parseError) {
          console.log('⚠️ Não foi possível parsear a resposta de erro como JSON');
        }
        
        if (response.status === 401) {
          throw new Error(`Chave API inválida ou inativa. Detalhes: ${errorDetails}`);
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

      // Verificar se o status é 202 (Accepted) conforme documentação
      if (response.status !== 202) {
        throw new Error(`Resposta inesperada da API LLMWhisperer. Esperado status 202, recebido: ${response.status}`);
      }

      const result: LLMWhispererSubmissionResponse = await response.json();
      console.log(`✅ Documento submetido com sucesso`);
      console.log(`🔗 Whisper hash: ${result.whisper_hash}`);
      console.log(`📝 Resposta completa:`, JSON.stringify(result, null, 2));

      if (!result.whisper_hash) {
        throw new Error('LLMWhisperer não retornou whisper_hash válido');
      }

      return result;

    } catch (error) {
      console.error('❌ Erro na submissão LLMWhisperer:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout na submissão LLMWhisperer (1 minuto)');
      }
      
      throw error;
    }
  }

  async checkStatus(whisperHash: string): Promise<LLMWhispererStatusResponse> {
    console.log(`📊 Verificando status para whisper_hash: ${whisperHash}`);
    
    try {
      const url = new URL(`${this.baseUrl}/whisper-status`);
      url.searchParams.set('whisper_hash', whisperHash);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'unstract-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao verificar status: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(`Erro ao verificar status: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: LLMWhispererStatusResponse = await response.json();
      console.log(`📋 Status atual: ${result.status}`);
      
      if (result.message) {
        console.log(`💬 Mensagem: ${result.message}`);
      }

      return result;

    } catch (error) {
      console.error(`❌ Erro ao verificar status:`, error);
      throw error;
    }
  }

  async retrieveResult(whisperHash: string, textOnly: boolean = true): Promise<LLMWhispererRetrieveResponse> {
    console.log(`📥 Recuperando resultado para whisper_hash: ${whisperHash}`);
    
    try {
      const url = new URL(`${this.baseUrl}/whisper-retrieve`);
      url.searchParams.set('whisper_hash', whisperHash);
      url.searchParams.set('text_only', textOnly.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'unstract-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro ao recuperar resultado: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(`Erro ao recuperar resultado: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: LLMWhispererRetrieveResponse = await response.json();
      console.log(`✅ Resultado recuperado com sucesso`);
      console.log(`📝 Tamanho do texto: ${result.result_text?.length || 0} caracteres`);
      
      if (result.metadata) {
        console.log(`📊 Metadados:`, JSON.stringify(result.metadata, null, 2));
      }

      if (!result.result_text) {
        throw new Error('LLMWhisperer não retornou texto válido');
      }

      return result;

    } catch (error) {
      console.error(`❌ Erro ao recuperar resultado:`, error);
      throw error;
    }
  }

  async processDocumentWithPolling(
    fileBuffer: ArrayBuffer, 
    fileName: string = 'document.pdf',
    maxPollingAttempts: number = 12,
    pollingInterval: number = 5000
  ): Promise<{ text: string; metadata: any; whisperHash: string }> {
    console.log(`🚀 Iniciando processamento completo com polling para: ${fileName}`);
    console.log(`⚙️ Configurações: maxTentativas=${maxPollingAttempts}, intervalo=${pollingInterval}ms`);
    
    // 1. Submeter documento
    const submission = await this.submitDocument(fileBuffer, fileName);
    const whisperHash = submission.whisper_hash;
    
    console.log(`🔄 Iniciando polling para whisper_hash: ${whisperHash}`);
    
    // 2. Polling de status
    for (let attempt = 1; attempt <= maxPollingAttempts; attempt++) {
      console.log(`📊 Polling tentativa ${attempt}/${maxPollingAttempts}`);
      
      const status = await this.checkStatus(whisperHash);
      
      if (status.status === 'processed') {
        console.log(`✅ Processamento concluído! Recuperando resultado...`);
        
        // 3. Recuperar resultado
        const result = await this.retrieveResult(whisperHash, false); // false para obter metadados
        
        return {
          text: result.result_text,
          metadata: result.metadata || {},
          whisperHash
        };
      } else if (status.status === 'failed') {
        throw new Error(`Processamento LLMWhisperer falhou: ${status.message || 'Erro desconhecido'}`);
      } else if (status.status === 'processing' || status.status === 'accepted') {
        if (attempt < maxPollingAttempts) {
          console.log(`⏳ Status: ${status.status}. Aguardando ${pollingInterval/1000}s antes da próxima verificação...`);
          await new Promise(resolve => setTimeout(resolve, pollingInterval));
        }
      } else {
        console.warn(`⚠️ Status desconhecido: ${status.status}`);
        if (attempt < maxPollingAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollingInterval));
        }
      }
    }
    
    // Timeout no polling
    throw new Error(`Timeout no processamento LLMWhisperer após ${maxPollingAttempts} tentativas (${(maxPollingAttempts * pollingInterval) / 1000}s)`);
  }
}
