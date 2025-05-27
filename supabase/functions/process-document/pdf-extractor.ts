
// PDF text extraction utilities
export interface ExtractionResult {
  text: string;
  method: string;
}

// Enhanced PDF text extraction using native approach
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO DE PDF ===`);
  console.log(`Tamanho do buffer: ${arrayBuffer.byteLength} bytes`);
  
  try {
    // Verificar se o buffer contém dados válidos
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Buffer do PDF está vazio');
    }

    // Verificar magic bytes do PDF
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfHeader = new TextDecoder().decode(uint8Array.slice(0, 8));
    console.log(`Header do arquivo: "${pdfHeader}"`);
    
    if (!pdfHeader.startsWith('%PDF-')) {
      throw new Error('Arquivo não é um PDF válido (header inválido)');
    }

    // Tentar extração usando pdf-parse
    console.log('Tentando extração com pdf-parse...');
    try {
      const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
      
      const buffer = new Uint8Array(arrayBuffer);
      
      const options = {
        max: 20,
        version: 'v1.10.100',
        normalizeWhitespace: true,
        disableCombineTextItems: false
      };
      
      console.log('Iniciando parsing do PDF...');
      const pdfData = await pdfParse.default(buffer, options);
      
      console.log(`PDF parseado - Páginas: ${pdfData.numpages}, Texto bruto: ${pdfData.text.length} chars`);
      
      let extractedText = pdfData.text;
      
      if (!extractedText || extractedText.length < 10) {
        throw new Error('Texto extraído muito curto ou vazio');
      }

      // Limpeza do texto extraído
      extractedText = cleanExtractedText(extractedText);
      
      console.log(`Texto após limpeza: ${extractedText.length} chars`);
      
      // Validação de qualidade do texto
      if (!validateTextQuality(extractedText)) {
        throw new Error('Texto extraído parece corrompido (baixa qualidade)');
      }
      
      console.log('✅ Extração PDF bem-sucedida com pdf-parse');
      return extractedText;
      
    } catch (pdfParseError) {
      console.error('Erro com pdf-parse:', pdfParseError);
      console.log('Tentando método alternativo...');
      
      return await extractTextWithAlternativeMethod(arrayBuffer);
    }
    
  } catch (error) {
    console.error('Erro geral na extração de PDF:', error);
    throw new Error(`Falha na extração de texto do PDF: ${error.message}`);
  }
}

// Método alternativo de extração usando regex
async function extractTextWithAlternativeMethod(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log('=== USANDO MÉTODO ALTERNATIVO DE EXTRAÇÃO ===');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfContent = new TextDecoder('latin1').decode(uint8Array);
    
    const textMatches = pdfContent.match(/stream\s*(.*?)\s*endstream/gs) || [];
    console.log(`Encontrados ${textMatches.length} streams no PDF`);
    
    let extractedTexts: string[] = [];
    
    for (let i = 0; i < textMatches.length; i++) {
      const stream = textMatches[i];
      
      const textContent = stream
        .replace(/^stream\s*/, '')
        .replace(/\s*endstream$/, '')
        .replace(/BT\s+/, '')
        .replace(/\s+ET/, '')
        .replace(/\/\w+\s+\d+\s+Tf\s+/g, '')
        .replace(/\d+\.?\d*\s+\d+\.?\d*\s+(m|l|c|v|y|h)\s+/g, '')
        .replace(/\d+\.?\d*\s+(w|J|j|M|d)\s+/g, '')
        .replace(/q\s+|Q\s+/g, '')
        .replace(/\[\s*\]\s+d\s+/g, '')
        .replace(/rg\s+|RG\s+/g, '')
        .replace(/\d+\.?\d*\s+\d+\.?\d*\s+(TD|Td|Tm)\s+/g, '')
        .replace(/\(\s*(.*?)\s*\)\s*(Tj|TJ)/g, '$1 ')
        .replace(/\<\s*(.*?)\s*\>\s*(Tj|TJ)/g, (match, hex) => {
          try {
            return String.fromCharCode(...hex.match(/.{2}/g)?.map((h: string) => parseInt(h, 16)) || []);
          } catch {
            return '';
          }
        });
      
      if (textContent && textContent.length > 5) {
        extractedTexts.push(textContent);
      }
    }
    
    if (extractedTexts.length === 0) {
      console.log('Nenhum texto encontrado nos streams, tentando busca geral...');
      
      const generalTextMatches = pdfContent.match(/\((.*?)\)\s*Tj/g) || [];
      for (const match of generalTextMatches) {
        const text = match.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
        if (text && text.length > 2) {
          extractedTexts.push(text);
        }
      }
    }
    
    console.log(`Textos extraídos pelo método alternativo: ${extractedTexts.length} fragmentos`);
    
    if (extractedTexts.length === 0) {
      throw new Error('Nenhum texto encontrado no PDF com método alternativo');
    }
    
    let finalText = extractedTexts.join(' ');
    finalText = cleanExtractedText(finalText);
    
    console.log(`Texto final extraído: ${finalText.length} chars`);
    
    if (finalText.length < 10) {
      throw new Error('Texto extraído muito curto pelo método alternativo');
    }
    
    if (!validateTextQuality(finalText)) {
      throw new Error('Texto extraído não contém conteúdo válido');
    }
    
    console.log('✅ Extração alternativa bem-sucedida');
    return finalText;
    
  } catch (error) {
    console.error('Erro no método alternativo:', error);
    throw new Error(`Método alternativo falhou: ${error.message}`);
  }
}

// Função para limpeza de texto extraído
function cleanExtractedText(text: string): string {
  return text
    .replace(/\x00/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\f/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

// Função para validar qualidade do texto
function validateTextQuality(text: string): boolean {
  const printableChars = text.match(/[a-zA-Z0-9À-ÿ\s\.\,\!\?\;\:\-\(\)\[\]]/g)?.length || 0;
  const qualityRatio = printableChars / text.length;
  
  console.log(`Caracteres legíveis: ${printableChars}/${text.length} (${(qualityRatio * 100).toFixed(2)}%)`);
  
  if (qualityRatio < 0.3) {
    console.warn(`Qualidade do texto baixa: ${qualityRatio}`);
    return false;
  }
  
  const hasValidWords = /\b[a-zA-ZÀ-ÿ]{2,}\b/.test(text);
  if (!hasValidWords) {
    console.warn('Texto extraído não contém palavras válidas');
    return false;
  }
  
  return true;
}
