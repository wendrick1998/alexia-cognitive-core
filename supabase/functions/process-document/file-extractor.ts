
import { extractTextFromPDF } from './pdf-extractor.ts';

// Main file text extraction function
export async function extractTextFromFile(url: string, type: string): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO DE ARQUIVO ===`);
  console.log(`URL: ${url}`);
  console.log(`Tipo: ${type}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Alex-IA-Document-Processor/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar arquivo: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    console.log(`Arquivo baixado com sucesso, tamanho: ${contentLength || 'unknown'} bytes`);

    if (type === 'txt' || type === 'md') {
      const text = await response.text();
      console.log(`Texto extraído de ${type}: ${text.length} caracteres`);
      console.log(`Amostra: "${text.substring(0, 200)}"`);
      return text;
    } else if (type === 'pdf') {
      const arrayBuffer = await response.arrayBuffer();
      console.log(`PDF baixado: ${arrayBuffer.byteLength} bytes`);
      
      const text = await extractTextFromPDF(arrayBuffer);
      
      console.log(`=== RESULTADO FINAL DA EXTRAÇÃO PDF ===`);
      console.log(`Tamanho do texto extraído: ${text.length} caracteres`);
      console.log(`Primeiros 500 caracteres: "${text.substring(0, 500)}"`);
      console.log(`Últimos 200 caracteres: "${text.substring(Math.max(0, text.length - 200))}"`);
      
      return text;
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${type}`);
    }
  } catch (error) {
    console.error(`Erro na extração de ${type}:`, error);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout ao baixar arquivo: ${url}`);
    }
    throw error;
  }
}
