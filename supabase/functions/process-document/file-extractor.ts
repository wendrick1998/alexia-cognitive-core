
import { extractTextFromPDF } from './pdf-extractor.ts';

// Enhanced file text extraction with robust error handling
export async function extractTextFromFile(url: string, type: string): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO ROBUSTA DE ARQUIVO ===`);
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
    console.log('Iniciando download do arquivo...');
    
    // Enhanced fetch with better timeout and headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Timeout atingido, abortando download...');
      controller.abort();
    }, 180000); // 3 minutes for large files
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Alex-IA-Document-Processor/2.0',
        'Accept': '*/*',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Falha no download: ${response.status} ${response.statusText}`);
    }

    // Validate content type if available
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type recebido: ${contentType}`);
    
    const contentLength = response.headers.get('content-length');
    const fileSize = contentLength ? parseInt(contentLength) : 'unknown';
    console.log(`Tamanho do arquivo: ${fileSize} bytes`);
    
    // Validate file size (max 50MB)
    if (typeof fileSize === 'number' && fileSize > 50 * 1024 * 1024) {
      throw new Error('Arquivo muito grande (máximo 50MB)');
    }

    // Process based on file type
    const normalizedType = type.toLowerCase().trim();
    
    if (normalizedType === 'txt' || normalizedType === 'md') {
      return await extractTextFile(response);
    } else if (normalizedType === 'pdf') {
      return await extractPDFFile(response, url);
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${type}`);
    }
    
  } catch (error) {
    console.error(`=== ERRO NA EXTRAÇÃO DE ARQUIVO ===`);
    console.error(`URL: ${url}`);
    console.error(`Tipo: ${type}`);
    console.error(`Erro:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error(`Timeout no download do arquivo (3 minutos). Arquivo pode ser muito grande.`);
    }
    
    if (error.message?.includes('fetch')) {
      throw new Error(`Erro de rede ao baixar arquivo: ${error.message}`);
    }
    
    throw error;
  }
}

// Extract text from simple text files
async function extractTextFile(response: Response): Promise<string> {
  console.log('Extraindo arquivo de texto...');
  
  try {
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Arquivo de texto está vazio');
    }
    
    // Basic text validation and cleaning
    const cleanText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
    
    console.log(`Texto extraído: ${cleanText.length} caracteres`);
    console.log(`Primeiras 200 chars: "${cleanText.substring(0, 200)}"`);
    
    if (cleanText.length < 10) {
      throw new Error('Arquivo de texto muito curto (mínimo 10 caracteres)');
    }
    
    return cleanText;
    
  } catch (error) {
    console.error('Erro na extração de texto:', error);
    throw new Error(`Falha ao processar arquivo de texto: ${error.message}`);
  }
}

// Extract text from PDF files with enhanced error handling
async function extractPDFFile(response: Response, url: string): Promise<string> {
  console.log('Extraindo arquivo PDF...');
  
  try {
    // Get PDF as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('PDF está vazio ou corrompido');
    }
    
    console.log(`PDF carregado: ${arrayBuffer.byteLength} bytes`);
    
    // Validate PDF structure
    const uint8Array = new Uint8Array(arrayBuffer);
    if (uint8Array.length < 1024) {
      throw new Error('PDF muito pequeno, possivelmente corrompido');
    }
    
    // Extract text using robust PDF extractor
    const extractedText = await extractTextFromPDF(arrayBuffer);
    
    // Final validation
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Nenhum texto foi extraído do PDF');
    }
    
    if (extractedText.length < 10) {
      throw new Error('Texto extraído do PDF muito curto');
    }
    
    console.log(`=== EXTRAÇÃO PDF CONCLUÍDA COM SUCESSO ===`);
    console.log(`Tamanho final do texto: ${extractedText.length} caracteres`);
    console.log(`Primeiros 500 chars: "${extractedText.substring(0, 500)}"`);
    console.log(`Últimos 200 chars: "${extractedText.substring(Math.max(0, extractedText.length - 200))}"`);
    
    return extractedText;
    
  } catch (error) {
    console.error('Erro na extração de PDF:', error);
    
    // Provide specific error messages for common issues
    if (error.message?.includes('pdf-parse')) {
      throw new Error(`Erro na biblioteca PDF: ${error.message}. Tente um PDF mais simples.`);
    }
    
    if (error.message?.includes('timeout')) {
      throw new Error('Timeout na extração de PDF. Arquivo pode ser muito complexo.');
    }
    
    if (error.message?.includes('Memory')) {
      throw new Error('PDF muito grande para processamento. Considere dividir em partes menores.');
    }
    
    throw new Error(`Falha na extração de PDF: ${error.message}`);
  }
}
