
import { calculateTextQuality } from './text-processor.ts';

export interface ExtractionResult {
  text: string;
  quality: number;
  method: string;
  metadata: {
    pages: number;
    totalChars: number;
    validWords: number;
    encoding: string;
  };
}

export class UltimatePDFExtractor {
  
  async extractText(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    console.log('🔍 Iniciando extração limpa de PDF...');
    
    // Converter buffer para string
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    
    // Estratégia focada em extrair APENAS texto real
    let extractedText = '';
    
    // 1. Encontrar todos os blocos de texto (BT...ET)
    const textBlocks = pdfString.match(/BT[\s\S]*?ET/g) || [];
    console.log(`📄 Blocos de texto encontrados: ${textBlocks.length}`);
    
    for (const block of textBlocks) {
      // 2. Extrair texto entre parênteses seguido de Tj
      const tjMatches = block.match(/\(([^)]+)\)\s*Tj/g) || [];
      
      for (const match of tjMatches) {
        const text = match.match(/\(([^)]+)\)/)?.[1];
        if (text && text.length > 1) {
          const decoded = this.decodePDFString(text);
          
          // IMPORTANTE: Verificar se NÃO é metadado
          if (this.isRealText(decoded) && !this.isMetadata(decoded)) {
            extractedText += decoded + ' ';
          }
        }
      }
      
      // 3. Extrair arrays de texto (comando TJ)
      const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g) || [];
      
      for (const arrayMatch of tjArrayMatches) {
        const arrayContent = arrayMatch.match(/\[(.*?)\]/)?.[1];
        if (arrayContent) {
          // Extrair texto entre parênteses dentro do array
          const textParts = arrayContent.match(/\(([^)]+)\)/g) || [];
          
          for (const part of textParts) {
            const text = part.slice(1, -1); // Remover parênteses
            if (text && text.length > 1) {
              const decoded = this.decodePDFString(text);
              
              if (this.isRealText(decoded) && !this.isMetadata(decoded)) {
                extractedText += decoded + ' ';
              }
            }
          }
        }
      }
    }
    
    // 4. Se não encontrou texto suficiente, tentar método alternativo
    if (extractedText.length < 100) {
      console.log('⚠️ Pouco texto encontrado, tentando extração alternativa...');
      const alternativeText = this.extractAlternative(pdfString);
      if (alternativeText.length > extractedText.length) {
        extractedText = alternativeText;
      }
    }
    
    // 5. Limpar e normalizar
    extractedText = this.cleanText(extractedText);
    
    // 6. Validar qualidade
    const quality = this.calculateQuality(extractedText);
    
    if (extractedText.length < 50 || quality < 30) {
      throw new Error('Não foi possível extrair texto válido do PDF');
    }
    
    console.log(`✅ Texto extraído com sucesso!`);
    console.log(`📊 Qualidade: ${quality}%`);
    console.log(`📝 Amostra: ${extractedText.substring(0, 150)}...`);
    
    return {
      text: extractedText,
      quality,
      method: 'clean-text-extraction',
      metadata: {
        pages: textBlocks.length,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText),
        encoding: 'latin1'
      }
    };
  }
  
  private extractAlternative(pdfString: string): string {
    let text = '';
    
    // Buscar qualquer texto entre parênteses que pareça conteúdo real
    const allParentheses = pdfString.match(/\(([^)]{3,})\)/g) || [];
    
    for (const match of allParentheses) {
      const content = match.slice(1, -1);
      const decoded = this.decodePDFString(content);
      
      if (this.isRealText(decoded) && !this.isMetadata(decoded)) {
        text += decoded + ' ';
      }
    }
    
    return this.cleanText(text);
  }
  
  private decodePDFString(str: string): string {
    return str
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
  }
  
  private isRealText(text: string): boolean {
    // Deve ter pelo menos 50% de caracteres alfabéticos
    const letters = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    const ratio = letters / text.length;
    
    return ratio > 0.5 && text.length > 2;
  }
  
  private isMetadata(text: string): boolean {
    // Lista expandida de padrões de metadados
    const metadataPatterns = [
      /^(Type|Font|PDF|Creator|Producer|MediaBox|Resources|BaseFont)/i,
      /^(obj|endobj|stream|endstream|xref|trailer)$/i,
      /^[A-Z]{2,}[a-z]+[A-Z]/, // CamelCase típico de metadados
      /^\d+\s+\d+\s+R$/, // Referências de objetos
      /^\/[A-Z]/, // Comandos PDF
      /FontDescriptor|CIDFont|Widths|Encoding/i,
      /^[a-f0-9]{8,}$/i, // Hashes
      /^(BT|ET|Tj|TJ|Tf|Tm)$/, // Operadores PDF
    ];
    
    const trimmed = text.trim();
    return metadataPatterns.some(pattern => pattern.test(trimmed));
  }
  
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:'"()\-–—À-ÿ]/g, '')
      .trim();
  }
  
  private calculateQuality(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const words = text.split(/\s+/);
    const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ]{2,}$/.test(w));
    
    // Verificar presença de palavras em português
    const portugueseWords = ['de', 'da', 'do', 'em', 'com', 'para', 'que', 'não', 'uma', 'são'];
    const hasPortuguese = portugueseWords.filter(w => 
      text.toLowerCase().includes(` ${w} `)
    ).length;
    
    const wordRatio = (validWords.length / words.length) * 40;
    const lengthScore = Math.min(30, (text.length / 500) * 30);
    const languageScore = (hasPortuguese / portugueseWords.length) * 30;
    
    return Math.round(wordRatio + lengthScore + languageScore);
  }
  
  private countValidWords(text: string): number {
    const words = text.split(/\s+/);
    return words.filter(w => /^[a-zA-ZÀ-ÿ]{2,}$/.test(w)).length;
  }
}

// Create chunks function
export function createChunks(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 20);
}
