
import { calculateTextQuality, extractTextFromStreamData } from './text-processor.ts';
import { analyzePDFStructure, extractTextObjects, extractStreams } from './pdf-analyzer.ts';
import { decompressPDFStream, decompressFlateData } from './compression-utils.ts';

// Enhanced PDF text extraction with native decompression and parsing
export interface ExtractionResult {
  text: string;
  method: string;
  quality: number;
  metadata?: any;
}

// Strategy 1: Native PDF parser with proper decompression
export async function extractWithNativePDFParser(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  console.log('🔧 Iniciando parser PDF nativo...');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfContent = new TextDecoder('latin1', { fatal: false }).decode(uint8Array);
    
    // Extract PDF structure information
    const pdfInfo = analyzePDFStructure(pdfContent);
    console.log(`📋 Estrutura PDF: ${pdfInfo.objects} objetos, ${pdfInfo.streams} streams`);
    
    // Find and extract text objects
    const textObjects = extractTextObjects(pdfContent);
    console.log(`📄 Encontrados ${textObjects.length} objetos de texto`);
    
    if (textObjects.length === 0) {
      throw new Error('Nenhum objeto de texto encontrado no PDF');
    }
    
    // Process each text object and decompress if needed
    const extractedTexts: string[] = [];
    
    for (let i = 0; i < textObjects.length; i++) {
      const textObj = textObjects[i];
      console.log(`🔍 Processando objeto ${i + 1}/${textObjects.length}...`);
      
      try {
        // Check if object is compressed
        if (textObj.includes('FlateDecode') || textObj.includes('/Filter')) {
          console.log(`🗜️ Objeto ${i + 1} está comprimido, tentando descomprimir...`);
          const decompressed = await decompressPDFStream(textObj);
          if (decompressed) {
            const text = extractTextFromStreamData(decompressed);
            if (text.length > 5) {
              extractedTexts.push(text);
              console.log(`✅ Objeto ${i + 1} descomprimido: ${text.length} chars`);
            }
          }
        } else {
          // Try to extract text directly
          const text = extractTextFromStreamData(textObj);
          if (text.length > 5) {
            extractedTexts.push(text);
            console.log(`✅ Objeto ${i + 1} extraído diretamente: ${text.length} chars`);
          }
        }
      } catch (objError) {
        console.warn(`⚠️ Erro no objeto ${i + 1}:`, objError.message);
      }
    }
    
    if (extractedTexts.length === 0) {
      throw new Error('Não foi possível extrair texto de nenhum objeto');
    }
    
    const finalText = extractedTexts.join(' ').trim();
    console.log(`🎯 Parser nativo: ${extractedTexts.length} objetos processados, ${finalText.length} chars totais`);
    
    return {
      text: finalText,
      method: 'native-pdf-parser',
      quality: 0,
      metadata: { objectsProcessed: extractedTexts.length, ...pdfInfo }
    };
    
  } catch (error) {
    console.error('❌ Parser PDF nativo falhou:', error);
    throw error;
  }
}

// Strategy 2: Enhanced pdf-parse with better error handling
export async function extractWithEnhancedPdfParse(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  console.log('📚 Iniciando pdf-parse aprimorado...');
  
  try {
    // Import pdf-parse with more robust options
    const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
    
    const buffer = new Uint8Array(arrayBuffer);
    
    // Enhanced options for better extraction
    const options = {
      max: 100,
      version: 'v1.10.100',
      normalizeWhitespace: true,
      disableCombineTextItems: false,
      useSystemFonts: false
    };
    
    console.log('🔄 Executando pdf-parse...');
    const pdfData = await pdfParse.default(buffer, options);
    
    console.log(`📊 pdf-parse stats: ${pdfData.numpages} páginas, ${pdfData.text?.length || 0} caracteres`);
    console.log(`📋 Metadata: ${JSON.stringify(pdfData.info || {})}`);
    
    if (!pdfData.text || pdfData.text.length < 10) {
      throw new Error(`Texto extraído muito curto: ${pdfData.text?.length || 0} chars`);
    }
    
    // Log sample of extracted text for debugging
    const sample = pdfData.text.substring(0, 300);
    console.log(`📝 Amostra do texto extraído: "${sample}"`);
    
    return {
      text: pdfData.text,
      method: 'pdf-parse-enhanced',
      quality: 0,
      metadata: { pages: pdfData.numpages, info: pdfData.info }
    };
    
  } catch (error) {
    console.error('❌ pdf-parse aprimorado falhou:', error);
    throw error;
  }
}

// Strategy 3: Stream decompression with proper PDF parsing
export async function extractWithStreamDecompression(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  console.log('🌊 Iniciando decompressão de streams...');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfContent = new TextDecoder('latin1', { fatal: false }).decode(uint8Array);
    
    // Find all stream objects
    const streams = extractStreams(pdfContent);
    
    console.log(`🔍 Encontrados ${streams.length} streams no PDF`);
    
    if (streams.length === 0) {
      throw new Error('Nenhum stream encontrado no PDF');
    }
    
    const extractedTexts: string[] = [];
    
    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      console.log(`🔄 Processando stream ${i + 1}/${streams.length} (comprimido: ${stream.isCompressed})`);
      
      try {
        let processedData = stream.data;
        
        if (stream.isCompressed) {
          console.log(`🗜️ Descomprimindo stream ${i + 1}...`);
          const decompressed = await decompressFlateData(stream.data);
          if (decompressed) {
            processedData = decompressed;
            console.log(`✅ Stream ${i + 1} descomprimido: ${processedData.length} chars`);
          }
        }
        
        // Extract text from processed data
        const text = extractTextFromStreamData(processedData);
        if (text.length > 10) {
          extractedTexts.push(text);
          console.log(`📝 Stream ${i + 1} texto extraído: ${text.length} chars`);
        }
        
      } catch (streamError) {
        console.warn(`⚠️ Erro no stream ${i + 1}:`, streamError.message);
      }
    }
    
    if (extractedTexts.length === 0) {
      throw new Error('Nenhum texto extraído dos streams');
    }
    
    const finalText = extractedTexts.join(' ').trim();
    console.log(`🎯 Decompressão de streams: ${extractedTexts.length} streams processados, ${finalText.length} chars`);
    
    return {
      text: finalText,
      method: 'stream-decompression',
      quality: 0,
      metadata: { streamsProcessed: extractedTexts.length, totalStreams: streams.length }
    };
    
  } catch (error) {
    console.error('❌ Decompressão de streams falhou:', error);
    throw error;
  }
}

// Strategy 4: Raw text search as final fallback
export async function extractWithRawTextSearch(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  console.log('🔍 Iniciando busca de texto bruto...');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try different encodings
    const encodings = ['utf-8', 'latin1', 'ascii', 'utf-16'];
    let bestText = '';
    let bestEncoding = '';
    
    for (const encoding of encodings) {
      try {
        const content = new TextDecoder(encoding, { fatal: false }).decode(uint8Array);
        
        // Search for readable text patterns
        const textMatches = content.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F]{3,}\b/g);
        const readableText = textMatches ? textMatches.join(' ') : '';
        
        if (readableText.length > bestText.length) {
          bestText = readableText;
          bestEncoding = encoding;
        }
        
        console.log(`📊 Encoding ${encoding}: ${readableText.length} chars de texto legível`);
        
      } catch (err) {
        console.log(`⚠️ Encoding ${encoding} falhou`);
      }
    }
    
    if (bestText.length < 20) {
      throw new Error(`Texto bruto insuficiente: ${bestText.length} chars`);
    }
    
    console.log(`🎯 Busca de texto bruto: melhor encoding ${bestEncoding}, ${bestText.length} chars`);
    
    return {
      text: bestText,
      method: 'raw-text-search',
      quality: 0,
      metadata: { encoding: bestEncoding, wordsFound: bestText.split(/\s+/).length }
    };
    
  } catch (error) {
    console.error('❌ Busca de texto bruto falhou:', error);
    throw error;
  }
}
