import { validateInput, validateFileSize, validatePDFHeader, validatePDFSize } from './file-validator.ts';
import { cleanAndValidateText, calculateTextQuality } from './text-processor.ts';
import { 
  extractWithNativePDFParser, 
  extractWithEnhancedPdfParse, 
  extractWithStreamDecompression, 
  extractWithRawTextSearch,
  ExtractionResult 
} from './extraction-strategies.ts';

// Enhanced file text extraction with comprehensive PDF support
export async function extractTextFromFile(url: string, type: string): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO APRIMORADA DE ARQUIVO ===`);
  console.log(`URL: ${url}`);
  console.log(`Tipo: ${type}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Validate input parameters
  validateInput(url, type);
  
  try {
    console.log('📥 Iniciando download do arquivo...');
    
    // Enhanced fetch with optimized timeout and headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout atingido, abortando download...');
      controller.abort();
    }, 300000); // 5 minutes for large files
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Alex-IA-Document-Processor/3.0',
        'Accept': '*/*',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Falha no download: ${response.status} ${response.statusText}`);
    }

    // Enhanced content validation
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const fileSize = contentLength ? parseInt(contentLength) : 'unknown';
    
    console.log(`📋 Informações do arquivo:`);
    console.log(`- Content-Type: ${contentType}`);
    console.log(`- Tamanho: ${fileSize} bytes`);
    console.log(`- Tipo detectado: ${type}`);
    
    // Validate file size
    validateFileSize(contentLength);

    // Process based on file type with enhanced logic
    const normalizedType = type.toLowerCase().trim();
    
    if (normalizedType === 'txt' || normalizedType === 'md') {
      return await extractTextFile(response);
    } else if (normalizedType === 'pdf') {
      return await extractPDFFile(response, url);
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${type}. Tipos suportados: txt, md, pdf`);
    }
    
  } catch (error) {
    console.error(`=== ERRO NA EXTRAÇÃO DE ARQUIVO ===`);
    console.error(`URL: ${url}`);
    console.error(`Tipo: ${type}`);
    console.error(`Erro:`, error);
    
    // Enhanced error categorization
    if (error.name === 'AbortError') {
      throw new Error(`Timeout no download do arquivo (5 minutos). Arquivo pode ser muito grande.`);
    }
    
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      throw new Error(`Erro de rede ao baixar arquivo: ${error.message}`);
    }
    
    if (error.message?.includes('PDF') || error.message?.includes('pdf')) {
      throw new Error(`Erro específico de PDF: ${error.message}`);
    }
    
    throw error;
  }
}

// Extract text from simple text files with validation
async function extractTextFile(response: Response): Promise<string> {
  console.log('📄 Extraindo arquivo de texto...');
  
  try {
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Arquivo de texto está vazio');
    }
    
    // Enhanced text cleaning and validation
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\0/g, '') // Remove null characters
      .trim();
    
    console.log(`📊 Estatísticas do texto:`);
    console.log(`- Caracteres totais: ${cleanText.length}`);
    console.log(`- Linhas: ${cleanText.split('\n').length}`);
    console.log(`- Palavras estimadas: ${cleanText.split(/\s+/).length}`);
    console.log(`- Primeiros 200 chars: "${cleanText.substring(0, 200)}"`);
    
    if (cleanText.length < 5) {
      throw new Error('Arquivo de texto muito curto (mínimo 5 caracteres)');
    }
    
    return cleanText;
    
  } catch (error) {
    console.error('❌ Erro na extração de texto:', error);
    throw new Error(`Falha ao processar arquivo de texto: ${error.message}`);
  }
}

// Extract text from PDF files with comprehensive approach
async function extractPDFFile(response: Response, url: string): Promise<string> {
  console.log('📕 Extraindo arquivo PDF...');
  
  try {
    // Get PDF as ArrayBuffer with validation
    const arrayBuffer = await response.arrayBuffer();
    
    validatePDFSize(arrayBuffer);
    
    console.log(`📊 PDF carregado:`);
    console.log(`- Tamanho: ${arrayBuffer.byteLength} bytes`);
    console.log(`- Tamanho em MB: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
    
    // Enhanced PDF validation
    const uint8Array = new Uint8Array(arrayBuffer);
    const headerValidation = validatePDFHeader(uint8Array);
    if (!headerValidation.isValid) {
      throw new Error(`Arquivo inválido: ${headerValidation.error}`);
    }
    
    console.log(`✅ PDF válido detectado: ${headerValidation.version}`);
    
    // Try multiple extraction strategies with improved implementations
    const strategies = [
      { name: 'native-pdf-parser', method: extractWithNativePDFParser },
      { name: 'pdf-parse-enhanced', method: extractWithEnhancedPdfParse },
      { name: 'stream-decompression', method: extractWithStreamDecompression },
      { name: 'raw-text-search', method: extractWithRawTextSearch }
    ];

    let bestResult: ExtractionResult | null = null;
    let lastError: Error | null = null;

    for (const strategy of strategies) {
      try {
        console.log(`🔍 Tentando estratégia: ${strategy.name}`);
        const startTime = Date.now();
        
        const result = await strategy.method(arrayBuffer);
        const processingTime = Date.now() - startTime;
        
        if (result && result.text.length > 10) {
          const quality = calculateTextQuality(result.text);
          result.quality = quality;
          
          console.log(`✅ Estratégia ${strategy.name} - Tempo: ${processingTime}ms, Qualidade: ${(quality * 100).toFixed(1)}%`);
          
          // Accept high quality results immediately
          if (quality >= 0.7) {
            console.log(`🎯 Extração bem-sucedida com ${strategy.name} (qualidade alta)`);
            return cleanAndValidateText(result.text);
          }
          
          // Keep track of best result
          if (!bestResult || quality > bestResult.quality) {
            bestResult = result;
          }
        }
      } catch (error) {
        console.error(`❌ Estratégia ${strategy.name} falhou:`, error);
        lastError = error;
      }
    }

    // Use best available result if it meets minimum quality
    if (bestResult && bestResult.quality >= 0.3) {
      console.log(`⚠️ Usando melhor resultado disponível: ${bestResult.method} (qualidade: ${(bestResult.quality * 100).toFixed(1)}%)`);
      return cleanAndValidateText(bestResult.text);
    }

    // All strategies failed
    console.error('💥 Todas as estratégias de extração falharam');
    throw new Error(`Falha na extração de texto: ${lastError?.message || 'Métodos esgotados'}`);
    
  } catch (error) {
    console.error('❌ Erro na extração de PDF:', error);
    
    // Enhanced error categorization for better user feedback
    if (error.message?.includes('pdf-parse')) {
      throw new Error(`Erro na biblioteca PDF: ${error.message}. Tente um PDF diferente ou converta para texto.`);
    }
    
    if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      throw new Error('Timeout na extração de PDF. Arquivo muito complexo ou grande.');
    }
    
    if (error.message?.includes('Memory') || error.message?.includes('memory')) {
      throw new Error('PDF muito grande para processamento. Considere dividir em partes menores.');
    }
    
    if (error.message?.includes('compressed') || error.message?.includes('FlateDecode')) {
      throw new Error('Erro na decompressão do PDF. O arquivo pode ter compressão não suportada.');
    }
    
    if (error.message?.includes('header') || error.message?.includes('inválido')) {
      throw new Error('PDF corrompido ou inválido. Verifique se o arquivo não está danificado.');
    }
    
    throw new Error(`Falha na extração de PDF: ${error.message}`);
  }
}
