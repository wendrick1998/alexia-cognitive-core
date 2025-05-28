
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
}

export class LLMWhispererService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.llmwhisperer.unstract.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async processDocument(fileUrl: string): Promise<LLMWhispererResponse> {
    console.log(`🔄 Iniciando processamento LLMWhisperer para: ${fileUrl}`);
    
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

      const response = await fetch(`${this.baseUrl}/whisper`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro LLMWhisperer: ${response.status} ${response.statusText}`);
        console.error(`📄 Resposta de erro: ${errorText}`);
        throw new Error(`LLMWhisperer API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: LLMWhispererResponse = await response.json();
      console.log(`✅ LLMWhisperer processamento concluído`);
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
      
      throw error;
    }
  }
}
