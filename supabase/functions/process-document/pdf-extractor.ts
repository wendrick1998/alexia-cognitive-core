
// Enhanced PDF text extraction with multiple fallback strategies
export interface ExtractionResult {
  text: string;
  method: string;
  quality: number;
}

// Main PDF text extraction function with robust fallbacks
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO ROBUSTA DE PDF ===`);
  console.log(`Tamanho do buffer: ${arrayBuffer.byteLength} bytes`);
  
  if (arrayBuffer.byteLength === 0) {
    throw new Error('Buffer do PDF está vazio');
  }

  // Validate PDF header
  const uint8Array = new Uint8Array(arrayBuffer);
  const headerCheck = validatePDFHeader(uint8Array);
  if (!headerCheck.isValid) {
    throw new Error(`Arquivo inválido: ${headerCheck.error}`);
  }

  console.log(`PDF válido detectado: ${headerCheck.version}`);

  // Try multiple extraction strategies in order of preference
  const strategies = [
    { name: 'pdf-parse', method: extractWithPdfParse },
    { name: 'native-regex', method: extractWithNativeRegex },
    { name: 'stream-parser', method: extractWithStreamParser }
  ];

  let bestResult: ExtractionResult | null = null;
  let lastError: Error | null = null;

  for (const strategy of strategies) {
    try {
      console.log(`Tentando estratégia: ${strategy.name}`);
      const result = await strategy.method(arrayBuffer);
      
      if (result && result.text.length > 10) {
        const quality = calculateTextQuality(result.text);
        result.quality = quality;
        
        console.log(`Estratégia ${strategy.name} - Qualidade: ${(quality * 100).toFixed(1)}%`);
        console.log(`Amostra do texto: "${result.text.substring(0, 200)}"`);
        
        if (quality >= 0.7) {
          console.log(`✅ Extração bem-sucedida com ${strategy.name} (qualidade alta)`);
          return cleanAndValidateText(result.text);
        }
        
        if (!bestResult || quality > bestResult.quality) {
          bestResult = result;
        }
      }
    } catch (error) {
      console.error(`Estratégia ${strategy.name} falhou:`, error);
      lastError = error;
    }
  }

  // Use best result if available, even with lower quality
  if (bestResult && bestResult.quality >= 0.3) {
    console.log(`⚠️ Usando melhor resultado disponível (qualidade: ${(bestResult.quality * 100).toFixed(1)}%)`);
    return cleanAndValidateText(bestResult.text);
  }

  // All strategies failed
  console.error('❌ Todas as estratégias de extração falharam');
  throw new Error(`Falha na extração de texto: ${lastError?.message || 'Métodos esgotados'}`);
}

// Strategy 1: Enhanced pdf-parse with better error handling
async function extractWithPdfParse(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  try {
    console.log('Iniciando extração com pdf-parse...');
    
    // Import pdf-parse dynamically
    const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
    
    const buffer = new Uint8Array(arrayBuffer);
    
    const options = {
      max: 50, // Increase page limit
      version: 'v1.10.100',
      normalizeWhitespace: true,
      disableCombineTextItems: false
    };
    
    const pdfData = await pdfParse.default(buffer, options);
    
    console.log(`pdf-parse: ${pdfData.numpages} páginas, ${pdfData.text.length} caracteres`);
    
    if (!pdfData.text || pdfData.text.length < 10) {
      throw new Error('Texto extraído muito curto');
    }
    
    return {
      text: pdfData.text,
      method: 'pdf-parse',
      quality: 0
    };
    
  } catch (error) {
    console.error('pdf-parse falhou:', error);
    throw error;
  }
}

// Strategy 2: Enhanced native regex extraction
async function extractWithNativeRegex(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  console.log('Iniciando extração com regex nativo...');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try multiple encodings
    const encodings = ['utf-8', 'latin1', 'ascii'];
    let bestText = '';
    let bestQuality = 0;
    
    for (const encoding of encodings) {
      try {
        const content = new TextDecoder(encoding, { fatal: false }).decode(uint8Array);
        const extractedText = extractTextFromPDFContent(content);
        
        if (extractedText.length > bestText.length) {
          const quality = calculateTextQuality(extractedText);
          if (quality > bestQuality) {
            bestText = extractedText;
            bestQuality = quality;
          }
        }
      } catch (err) {
        console.log(`Encoding ${encoding} falhou, continuando...`);
      }
    }
    
    if (bestText.length < 10) {
      throw new Error('Nenhum texto significativo encontrado');
    }
    
    console.log(`Regex nativo: ${bestText.length} caracteres extraídos`);
    
    return {
      text: bestText,
      method: 'native-regex',
      quality: bestQuality
    };
    
  } catch (error) {
    console.error('Regex nativo falhou:', error);
    throw error;
  }
}

// Strategy 3: Stream-based parser for complex PDFs
async function extractWithStreamParser(arrayBuffer: ArrayBuffer): Promise<ExtractionResult> {
  console.log('Iniciando extração com parser de stream...');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const content = new TextDecoder('latin1', { fatal: false }).decode(uint8Array);
    
    // Find and extract text from content streams
    const streamPattern = /stream\s*\n([\s\S]*?)\nendstream/gi;
    const textCommands = /\(((?:[^\\()]|\\.)*)?\)\s*(?:Tj|TJ)/g;
    const hexStrings = /<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ)/g;
    
    let extractedTexts: string[] = [];
    let match;
    
    // Extract from streams
    while ((match = streamPattern.exec(content)) !== null) {
      const streamContent = match[1];
      
      // Extract text commands
      let textMatch;
      while ((textMatch = textCommands.exec(streamContent)) !== null) {
        if (textMatch[1]) {
          const cleanText = textMatch[1]
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\\\/g, '\\')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .trim();
          
          if (cleanText.length > 2) {
            extractedTexts.push(cleanText);
          }
        }
      }
      
      // Extract hex strings
      while ((textMatch = hexStrings.exec(streamContent)) !== null) {
        try {
          const hexText = textMatch[1].replace(/\s/g, '');
          if (hexText.length % 2 === 0) {
            const decoded = hexText.match(/.{2}/g)
              ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
              .join('')
              .trim();
            
            if (decoded && decoded.length > 2) {
              extractedTexts.push(decoded);
            }
          }
        } catch (err) {
          // Continue with next hex string
        }
      }
    }
    
    if (extractedTexts.length === 0) {
      throw new Error('Nenhum texto encontrado nos streams');
    }
    
    const finalText = extractedTexts.join(' ');
    console.log(`Parser de stream: ${extractedTexts.length} fragmentos, ${finalText.length} caracteres`);
    
    return {
      text: finalText,
      method: 'stream-parser',
      quality: 0
    };
    
  } catch (error) {
    console.error('Parser de stream falhou:', error);
    throw error;
  }
}

// Validate PDF header and extract version info
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

// Extract text using various PDF content patterns
function extractTextFromPDFContent(content: string): string {
  const patterns = [
    // Standard text showing operators
    /\(((?:[^\\()]|\\.)*?)\)\s*(?:Tj|TJ)/g,
    // Hex encoded strings
    /<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ)/g,
    // Array of strings
    /\[\s*\(((?:[^\\()]|\\.)*?)\)\s*\]\s*TJ/g,
    // Simple text patterns
    /BT\s+(?:.*?)\s+\((.*?)\)\s+Tj/g
  ];
  
  const extractedTexts: string[] = [];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1];
      if (text && text.length > 1) {
        if (pattern === patterns[1]) { // Hex pattern
          try {
            const hexText = text.replace(/\s/g, '');
            if (hexText.length % 2 === 0) {
              const decoded = hexText.match(/.{2}/g)
                ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
                .join('');
              if (decoded) extractedTexts.push(decoded);
            }
          } catch (err) {
            // Continue with next match
          }
        } else {
          extractedTexts.push(text);
        }
      }
    }
  }
  
  return extractedTexts.join(' ');
}

// Calculate text quality based on readable characters
function calculateTextQuality(text: string): number {
  if (!text || text.length === 0) return 0;
  
  // Count readable characters
  const readableChars = (text.match(/[a-zA-Z0-9À-ÿ\u00C0-\u017F\s\.\,\!\?\;\:\-\(\)\[\]\"\']/g) || []).length;
  const totalChars = text.length;
  
  // Basic quality score
  let quality = readableChars / totalChars;
  
  // Bonus for word presence
  const wordCount = (text.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F]{2,}\b/g) || []).length;
  if (wordCount > 5) quality += 0.1;
  
  // Penalty for too many special characters
  const specialChars = (text.match(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\"\'À-ÿ\u00C0-\u017F]/g) || []).length;
  if (specialChars > totalChars * 0.3) quality -= 0.2;
  
  return Math.max(0, Math.min(1, quality));
}

// Clean and validate extracted text
function cleanAndValidateText(text: string): string {
  console.log('Iniciando limpeza e validação do texto...');
  
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
  
  const quality = calculateTextQuality(cleaned);
  console.log(`Texto limpo: ${cleaned.length} caracteres, qualidade: ${(quality * 100).toFixed(1)}%`);
  
  if (quality < 0.3) {
    console.warn('⚠️ Qualidade do texto baixa, mas prosseguindo...');
  }
  
  if (cleaned.length < 10) {
    throw new Error('Texto extraído muito curto após limpeza');
  }
  
  console.log(`Amostra do texto limpo: "${cleaned.substring(0, 300)}"`);
  
  return cleaned;
}
