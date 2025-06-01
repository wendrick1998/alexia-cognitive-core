// Text processing and cleaning utilities
export function cleanAndValidateText(text: string): string {
  console.log('🧹 Iniciando limpeza e validação aprimorada do texto...');
  
  if (!text || text.trim().length === 0) {
    throw new Error('Texto vazio fornecido para limpeza');
  }
  
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
    .replace(/\\\\/g, '\\')
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']');
  
  // More permissive character filtering - keep numbers, punctuation, accents
  cleaned = cleaned
    .replace(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\"\'À-ÿ\u00C0-\u017F\u0100-\u017F\u1E00-\u1EFF0-9%$€£¥©®™°±×÷\/\&\@\#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Fix spacing around punctuation
  cleaned = cleaned
    .replace(/\s+([.!?,:;])/g, '$1') // Remove space before punctuation
    .replace(/([.!?])\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ])/g, '$1 $2') // Ensure space after sentence end
    .replace(/([,;:])\s*/g, '$1 '); // Ensure space after commas, semicolons, colons
  
  const quality = calculateTextQuality(cleaned);
  console.log(`📊 Texto limpo: ${cleaned.length} caracteres, qualidade: ${(quality * 100).toFixed(1)}%`);
  
  const words = (cleaned.match(/\b[a-zA-ZÀ-ÿ\u00C0-\u017F0-9]{2,}\b/g) || []);
  console.log(`📝 Palavras válidas encontradas: ${words.length}`);
  console.log(`📋 Amostra do texto limpo (300 chars): "${cleaned.substring(0, 300)}"`);
  
  // More permissive quality threshold
  if (quality < 0.1) {
    console.warn(`⚠️ Qualidade do texto baixa (${(quality * 100).toFixed(1)}%), mas prosseguindo...`);
  }
  
  if (cleaned.length < 10) {
    throw new Error('Texto extraído muito curto após limpeza (mínimo 10 caracteres)');
  }
  
  return cleaned;
}

export function calculateTextQuality(text: string): number {
  if (!text || text.length === 0) return 0;
  
  const cleanText = text.trim();
  if (cleanText.length < 5) return 0;
  
  // Métricas básicas
  const totalChars = cleanText.length;
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Contadores de caracteres válidos expandidos (mais permissivo)
  const alphaChars = (cleanText.match(/[a-zA-ZÀ-ÿ\u00C0-\u017F]/g) || []).length;
  const numericChars = (cleanText.match(/[0-9]/g) || []).length;
  const punctuationChars = (cleanText.match(/[.,!?;:()\-"'\[\]\/\&\@\#%]/g) || []).length;
  const spaceChars = (cleanText.match(/\s/g) || []).length;
  
  const validChars = alphaChars + numericChars + punctuationChars + spaceChars;
  const readabilityRatio = Math.min(1, validChars / totalChars);
  
  // Palavras válidas (incluindo números e hífens) - mais permissivo
  const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ\u00C0-\u017F0-9\-'\.\/\&]{2,}$/.test(w));
  const wordValidityRatio = words.length > 0 ? validWords.length / words.length : 0;
  
  // Densidade de palavras - mais permissiva
  const wordDensity = totalChars > 0 ? words.length / totalChars : 0;
  
  // Diversidade de caracteres
  const uniqueChars = new Set(cleanText.toLowerCase()).size;
  
  // Cálculo da qualidade (0-1) - mais permissivo
  let quality = readabilityRatio * 0.5; // 50% peso para legibilidade
  quality += wordValidityRatio * 0.3; // 30% peso para validez das palavras
  
  // Bônus para densidade apropriada (0.05-0.5 é bom) - mais permissivo
  if (wordDensity >= 0.05 && wordDensity <= 0.5) {
    quality += 0.15;
  } else {
    quality += Math.max(0, 0.15 - Math.abs(wordDensity - 0.15) * 0.5);
  }
  
  // Bônus para diversidade de caracteres - mais permissivo
  if (uniqueChars > 10) {
    quality += 0.05;
  } else if (uniqueChars > 5) {
    quality += 0.025;
  }
  
  // Penalidades muito reduzidas
  if (totalChars < 20) quality *= 0.9; // Menos penalidade para texto curto
  if (words.length < 5) quality *= 0.95; // Menos penalidade para poucas palavras
  
  // Bônus para texto substancial
  if (totalChars > 100 && words.length > 15) quality += 0.05;
  if (sentences.length > 2) quality += 0.05;
  
  return Math.max(0, Math.min(1, quality));
}

export function extractTextFromStreamData(data: string): string {
  console.log('🔍 Extraindo texto de dados de stream...');
  
  // Padrões melhorados para extração de texto
  const textPatterns = [
    // Texto simples entre parênteses + Tj/TJ
    /\(((?:[^\\()]|\\.)*?)\)\s*(?:Tj|TJ)/g,
    // Arrays de texto TJ
    /\[((?:\([^)]*\)|[^\[\]])*)\]\s*TJ/g,
    // Texto hexadecimal
    /<([0-9A-Fa-f\s]+)>\s*(?:Tj|TJ)/g,
    // Texto com posicionamento
    /\(((?:[^\\()]|\\.)*?)\)\s*(?:\d+\s+)*(?:Tj|TJ)/g
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
          if (hexText.length % 2 === 0 && hexText.length > 0) {
            text = hexText.match(/.{2}/g)
              ?.map(hex => {
                const code = parseInt(hex, 16);
                return code > 31 && code < 127 ? String.fromCharCode(code) : '';
              })
              .join('') || '';
          }
        } catch (err) {
          continue;
        }
      }
      
      // Clean up extracted text mais robusto
      text = text
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\\/g, '\\')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\[/g, '[')
        .replace(/\\\]/g, ']')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .trim();
      
      // Validar se é texto válido
      if (text.length > 1 && isValidTextSegment(text)) {
        extractedTexts.push(text);
      }
    }
  }
  
  const finalText = extractedTexts.join(' ').trim();
  console.log(`📝 Extraído ${extractedTexts.length} segmentos de texto, ${finalText.length} caracteres totais`);
  
  return finalText;
}

function isValidTextSegment(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Verifica se contém caracteres legíveis suficientes
  const alphaNumCount = (text.match(/[a-zA-ZÀ-ÿ\u00C0-\u017F0-9]/g) || []).length;
  const totalCount = text.length;
  const ratio = alphaNumCount / totalCount;
  
  // Filtrar metadados PDF comuns
  const pdfMetadataPatterns = [
    /^(Type|Font|PDF|Creator|Producer|Title|Author|Subject|Keywords)/i,
    /FontDescriptor|BaseFont|MediaBox|CropBox|BleedBox/i,
    /^\d+\s+\d+\s+R$/,
    /^[A-Z]+$/,
    /obj|endobj|stream|endstream/i,
    /^[0-9\.\s]+$/
  ];
  
  const isMetadata = pdfMetadataPatterns.some(pattern => pattern.test(text.trim()));
  
  // Deve ter pelo menos 30% de caracteres alfanuméricos e não ser metadata
  return ratio > 0.3 && !isMetadata;
}
