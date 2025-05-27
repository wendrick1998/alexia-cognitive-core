
import { extractTextFromPDF } from './pdf-extractor.ts';

// Enhanced file text extraction with comprehensive PDF support
export async function extractTextFromFile(url: string, type: string): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO APRIMORADA DE ARQUIVO ===`);
  console.log(`URL: ${url}`);
  console.log(`Tipo: ${type}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Validate input parameters
  if (!url || typeof url !== 'string') {
    throw new Error('URL do arquivo é obrigatória');
  }
  
  if (!type || typeof type !== 'string') {
    throw new Error('Tipo do arquivo é obrigatório');
  }
  
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
    
    // Validate file size (max 100MB for improved handling)
    if (typeof fileSize === 'number' && fileSize > 100 * 1024 * 1024) {
      throw new Error('Arquivo muito grande (máximo 100MB)');
    }

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
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('PDF está vazio ou corrompido');
    }
    
    console.log(`📊 PDF carregado:`);
    console.log(`- Tamanho: ${arrayBuffer.byteLength} bytes`);
    console.log(`- Tamanho em MB: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
    
    // Enhanced PDF validation
    const uint8Array = new Uint8Array(arrayBuffer);
    if (uint8Array.length < 1024) {
      throw new Error('PDF muito pequeno, possivelmente corrompido');
    }
    
    // Validate PDF signature
    const header = new TextDecoder().decode(uint8Array.slice(0, 10));
    if (!header.startsWith('%PDF-')) {
      throw new Error('Arquivo não é um PDF válido (header inválido)');
    }
    
    console.log(`✅ PDF válido detectado: ${header.trim()}`);
    
    // Extract text using enhanced PDF extractor
    const extractionStartTime = Date.now();
    const extractedText = await extractTextFromPDF(arrayBuffer);
    const extractionTime = Date.now() - extractionStartTime;
    
    // Final comprehensive validation
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Nenhum texto foi extraído do PDF');
    }
    
    if (extractedText.length < 5) {
      throw new Error('Texto extraído do PDF muito curto');
    }
    
    // Calculate and log quality metrics
    const words = extractedText.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F]{2,}\b/g) || [];
    const sentences = extractedText.match(/[.!?]+/g) || [];
    const readableChars = (extractedText.match(/[a-zA-Z0-9À-ÿ\u00C0-\u017F\s\.\,\!\?\;\:\-\(\)\[\]\"\']/g) || []).length;
    const qualityRatio = readableChars / extractedText.length;
    
    console.log(`=== EXTRAÇÃO PDF CONCLUÍDA COM SUCESSO ===`);
    console.log(`📊 Estatísticas finais:`);
    console.log(`- Tempo de extração: ${extractionTime}ms`);
    console.log(`- Caracteres totais: ${extractedText.length}`);
    console.log(`- Palavras encontradas: ${words.length}`);
    console.log(`- Sentenças encontradas: ${sentences.length}`);
    console.log(`- Qualidade do texto: ${(qualityRatio * 100).toFixed(1)}%`);
    console.log(`- Primeiros 500 chars: "${extractedText.substring(0, 500)}"`);
    console.log(`- Últimos 200 chars: "${extractedText.substring(Math.max(0, extractedText.length - 200))}"`);
    
    // Warn if quality is low but proceed
    if (qualityRatio < 0.5) {
      console.warn(`⚠️ Qualidade do texto relativamente baixa (${(qualityRatio * 100).toFixed(1)}%), mas dentro dos limites aceitáveis`);
    }
    
    return extractedText;
    
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
