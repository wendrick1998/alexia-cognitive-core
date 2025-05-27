// Enhanced PDF text extraction with native decompression and parsing
export interface ExtractionResult {
  text: string;
  method: string;
  quality: number;
  metadata?: any;
}

// Main PDF text extraction function with comprehensive approach
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO ROBUSTA DE PDF (VERSÃO CORRIGIDA) ===`);
  console.log(`Tamanho do buffer: ${arrayBuffer.byteLength} bytes`);
  
  if (arrayBuffer.byteLength === 0) {
    throw new Error('Buffer do PDF está vazio');
  }

  // Validate PDF header and get version
  const uint8Array = new Uint8Array(arrayBuffer);
  const headerValidation = validatePDFHeader(uint8Array);
  if (!headerValidation.isValid) {
    throw new Error(`Arquivo inválido: ${headerValidation.error}`);
  }

  console.log(`PDF válido detectado: ${headerValidation.version}`);
  console.log(`Primeira linha do arquivo: ${new TextDecoder().decode(uint8Array.slice(0, 50))}`);

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
        console.log(`📝 Amostra (primeiros 200 chars): "${result.text.substring(0, 200)}"`);
        console.log(`📊 Stats: ${result.text.length} chars, ${result.text.split(/\s+/).length} palavras`);
        
        // Accept high quality results immediately
        if (quality >= 0.7) {
          console.log(`🎯 Extração bem-sucedida com ${strategy.name} (qualidade alta)`);
          return cleanAndValidateText(result.text);
        }
        
        // Keep track of best result
        if (!bestResult || quality > bestResult.quality) {
          bestResult = result;
        }
      } else {
        console.log(`❌ Estratégia ${strategy.name} produziu texto muito curto`);
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
  console.error('📋 Informações de debug:');
  console.error(`- Tamanho do arquivo: ${arrayBuffer.byteLength} bytes`);
  console.error(`- Header válido: ${headerValidation.isValid}`);
  console.error(`- Último erro: ${lastError?.message}`);
  
  throw new Error(`Falha na extração de texto: ${lastError?.message || 'Métodos esgotados'}`);
}

// Strategy 1: Native PDF parser with proper decompression
async function extractWithNativePDFParser(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
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
            const text = extractTextFromDecompressedStream(decompressed);
            if (text.length > 5) {
              extractedTexts.push(text);
              console.log(`✅ Objeto ${i + 1} descomprimido: ${text.length} chars`);
            }
          }
        } else {
          // Try to extract text directly
          const text = extractTextFromPDFObject(textObj);
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
async function extractWithEnhancedPdfParse(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
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
async function extractWithStreamDecompression(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  console.log('🌊 Iniciando decompressão de streams...');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfContent = new TextDecoder('latin1', { fatal: false }).decode(uint8Array);
    
    // Find all stream objects
    const streamPattern = /(\d+\s+\d+\s+obj[\s\S]*?stream\s*\n)([\s\S]*?)(\nendstream)/gi;
    const streams = [];
    let match;
    
    while ((match = streamPattern.exec(pdfContent)) !== null) {
      const streamHeader = match[1];
      const streamData = match[2];
      
      streams.push({
        header: streamHeader,
        data: streamData,
        isCompressed: streamHeader.includes('FlateDecode') || streamHeader.includes('/Filter')
      });
    }
    
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
async function extractWithRawTextSearch(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
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

// Helper function to validate PDF header
function validatePDFHeader(uint8Array: Uint8Array): { isValid: boolean; version?: string; error?: string } {
  if (uint8Array.length < 8) {
    return { isValid: false, error: 'Arquivo muito pequeno' };
  }
  
  const header = new TextDecoder().decode(uint8Array.slice(0, 8));
  
  if (!header.startsWith('%PDF-')) {
    return { isValid: false, error: 'Header PDF inválido' };
  }
  
  const version = header.substring(5, 8);
  return { isValid: true, version: `PDF ${version}` };
}

// Helper function to analyze PDF structure
function analyzePDFStructure(content: string): { objects: number; streams: number; compressed: number } {
  const objectMatches = content.match(/\d+\s+\d+\s+obj/g);
  const streamMatches = content.match(/stream\s*\n/g);
  const compressedMatches = content.match(/FlateDecode/g);
  
  return {
    objects: objectMatches?.length || 0,
    streams: streamMatches?.length || 0,
    compressed: compressedMatches?.length || 0
  };
}

// Helper function to extract text objects from PDF
function extractTextObjects(content: string): string[] {
  const objects: string[] = [];
  const objectPattern = /(\d+\s+\d+\s+obj[\s\S]*?endobj)/gi;
  let match;
  
  while ((match = objectPattern.exec(content)) !== null) {
    const obj = match[1];
    // Look for text-related objects
    if (obj.includes('/Type/Page') || obj.includes('BT') || obj.includes('Tj') || obj.includes('TJ')) {
      objects.push(obj);
    }
  }
  
  return objects;
}

// Helper function to decompress PDF stream data
async function decompressPDFStream(streamObject: string): Promise<string | null> {
  try {
    // Extract the actual stream data
    const streamMatch = streamObject.match(/stream\s*\n([\s\S]*?)\nendstream/);
    if (!streamMatch) return null;
    
    const streamData = streamMatch[1];
    return await decompressFlateData(streamData);
  } catch (error) {
    console.warn('Erro na decompressão do stream PDF:', error);
    return null;
  }
}

// Helper function to decompress Flate/Deflate data
async function decompressFlateData(data: string): Promise<string | null> {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const uint8Data = encoder.encode(data);
    
    // Try to decompress using native Deno compression
    const decompressedStream = new DecompressionStream('deflate');
    const writer = decompressedStream.writable.getWriter();
    const reader = decompressedStream.readable.getReader();
    
    writer.write(uint8Data);
    writer.close();
    
    const { value } = await reader.read();
    if (value) {
      return decoder.decode(value);
    }
    
    return null;
  } catch (error) {
    console.warn('Erro na decompressão Flate:', error);
    return null;
  }
}

// Helper function to extract text from decompressed stream
function extractTextFromDecompressedStream(data: string): string {
  // Look for text showing operators and extract text
  const textPatterns = [
    /\(((?:[^\\()]|\\.)*?)\)\s*(?:Tj|TJ)/g,
    /\[((?:\([^)]*\)|[^\[\]])*)\]\s*TJ/g,
    /<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ)/g
  ];
  
  const extractedTexts: string[] = [];
  
  for (const pattern of textPatterns) {
    let match;
    while ((match = pattern.exec(data)) !== null) {
      let text = match[1];
      
      // Handle hex encoding if applicable
      if (pattern === textPatterns[2]) {
        try {
          const hexText = text.replace(/\s/g, '');
          if (hexText.length % 2 === 0) {
            text = hexText.match(/.{2}/g)
              ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
              .join('') || '';
          }
        } catch (err) {
          continue;
        }
      }
      
      // Clean up extracted text
      text = text
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\\/g, '\\')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .trim();
      
      if (text.length > 2) {
        extractedTexts.push(text);
      }
    }
  }
  
  return extractedTexts.join(' ');
}

// Helper function to extract text from PDF object
function extractTextFromPDFObject(obj: string): string {
  // Similar to extractTextFromDecompressedStream but for uncompressed objects
  return extractTextFromDecompressedStream(obj);
}

// Helper function to extract text from stream data
function extractTextFromStreamData(data: string): string {
  return extractTextFromDecompressedStream(data);
}

// Helper function to calculate text quality
function calculateTextQuality(text: string): number {
  if (!text || text.length === 0) return 0;
  
  // Count readable characters (letters, numbers, common punctuation, accented chars)
  const readableChars = (text.match(/[a-zA-Z0-9À-ÿ\u00C0-\u017F\s\.\,\!\?\;\:\-\(\)\[\]\"\']/g) || []).length;
  const totalChars = text.length;
  
  // Basic quality score
  let quality = readableChars / totalChars;
  
  // Bonus for word presence
  const words = text.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F]{2,}\b/g) || [];
  if (words.length > 5) quality += 0.1;
  
  // Bonus for sentences
  const sentences = text.match(/[.!?]+/g) || [];
  if (sentences.length > 1) quality += 0.05;
  
  // Penalty for too many special characters
  const specialChars = (text.match(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\"\'À-ÿ\u00C0-\u017F]/g) || []).length;
  if (specialChars > totalChars * 0.3) quality -= 0.2;
  
  // Penalty for excessive repetition
  const uniqueChars = new Set(text.toLowerCase()).size;
  if (uniqueChars < 10) quality -= 0.3;
  
  return Math.max(0, Math.min(1, quality));
}

// Helper function to clean and validate extracted text
function cleanAndValidateText(text: string): string {
  console.log('🧹 Iniciando limpeza e validação do texto...');
  
  // Remove control characters and normalize whitespace
  let cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .replace(/[ ]{2,}/g, ' ') // Multiple spaces to single
    .trim();
  
  // Fix common PDF extraction artifacts
  cleaned = cleaned
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
  
  // Remove obviously corrupted sequences
  cleaned = cleaned
    .replace(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\"\'À-ÿ\u00C0-\u017F]{3,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const quality = calculateTextQuality(cleaned);
  console.log(`📊 Texto limpo: ${cleaned.length} caracteres, qualidade: ${(quality * 100).toFixed(1)}%`);
  console.log(`📝 Palavras encontradas: ${(cleaned.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F]{2,}\b/g) || []).length}`);
  
  if (quality < 0.2) {
    console.warn('⚠️ Qualidade do texto muito baixa, mas prosseguindo...');
  }
  
  if (cleaned.length < 10) {
    throw new Error('Texto extraído muito curto após limpeza');
  }
  
  // Log sample of cleaned text for debugging
  console.log(`📋 Amostra do texto limpo (300 chars): "${cleaned.substring(0, 300)}"`);
  
  return cleaned;
}
