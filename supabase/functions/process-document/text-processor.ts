
// Text processing and cleaning utilities
export function cleanAndValidateText(text: string): string {
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
  
  console.log(`📋 Amostra do texto limpo (300 chars): "${cleaned.substring(0, 300)}"`);
  
  return cleaned;
}

export function calculateTextQuality(text: string): number {
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

export function extractTextFromStreamData(data: string): string {
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
