
import { calculateTextQuality } from './text-processor.ts';

export interface ExtractionResult {
  text: string;
  quality: number;
  method: string;
  metadata: {
    pages: number;
    totalChars: number;
    validWords: number;
    encoding?: string;
  };
}

export class UltimatePDFExtractor {
  
  async extractText(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    console.log('🔍 Iniciando extração robusta de PDF...');
    
    let extractedText = '';
    let method = 'unknown';
    
    // Estratégia 1: Extração clean (método atual)
    try {
      const result1 = await this.cleanExtraction(pdfBuffer);
      if (result1.text.length >= 20) {
        console.log('✅ Extração clean bem-sucedida');
        return result1;
      }
      console.log('⚠️ Extração clean retornou pouco texto, tentando estratégia 2...');
    } catch (error) {
      console.log('⚠️ Extração clean falhou:', error.message);
    }
    
    // Estratégia 2: Extração agressiva de todos os textos
    try {
      const result2 = await this.aggressiveExtraction(pdfBuffer);
      if (result2.text.length >= 10) {
        console.log('✅ Extração agressiva bem-sucedida');
        return result2;
      }
      console.log('⚠️ Extração agressiva retornou pouco texto, tentando estratégia 3...');
    } catch (error) {
      console.log('⚠️ Extração agressiva falhou:', error.message);
    }
    
    // Estratégia 3: Extração de strings brutas
    try {
      const result3 = await this.rawStringExtraction(pdfBuffer);
      if (result3.text.length >= 5) {
        console.log('✅ Extração de strings brutas bem-sucedida');
        return result3;
      }
    } catch (error) {
      console.log('⚠️ Extração de strings brutas falhou:', error.message);
    }
    
    // Se chegou até aqui, retorna o que conseguiu extrair ou um erro mais informativo
    throw new Error(`Não foi possível extrair texto suficiente do PDF. Buffer size: ${pdfBuffer.length} bytes. Tente um PDF diferente ou verifique se o arquivo não está corrompido.`);
  }
  
  private async cleanExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Encontrar blocos de texto (BT...ET)
    const textBlocks = pdfString.match(/BT[\s\S]*?ET/g) || [];
    
    for (const block of textBlocks) {
      // Extrair texto entre parênteses + Tj
      const tjMatches = block.match(/\(([^)]+)\)\s*Tj/g) || [];
      
      for (const match of tjMatches) {
        const text = match.match(/\(([^)]+)\)/)?.[1];
        if (text && text.length > 1 && !this.isMetadata(text)) {
          extractedText += this.decodePDFString(text) + ' ';
        }
      }
      
      // Extrair arrays TJ
      const tjArrays = block.match(/\[(.*?)\]\s*TJ/g) || [];
      for (const arr of tjArrays) {
        const parts = arr.match(/\(([^)]+)\)/g) || [];
        for (const part of parts) {
          const text = part.slice(1, -1);
          if (text && text.length > 1 && !this.isMetadata(text)) {
            extractedText += this.decodePDFString(text) + ' ';
          }
        }
      }
    }
    
    extractedText = this.cleanText(extractedText);
    const quality = this.calculateQuality(extractedText);
    
    return {
      text: extractedText,
      quality,
      method: 'clean-extraction',
      metadata: {
        pages: textBlocks.length,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText)
      }
    };
  }
  
  private async aggressiveExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Buscar por qualquer texto entre parênteses, mesmo fora de blocos BT/ET
    const allTextMatches = pdfString.match(/\([^)]{2,}\)/g) || [];
    
    for (const match of allTextMatches) {
      const text = match.slice(1, -1); // Remove os parênteses
      if (text && text.length > 1) {
        const decoded = this.decodePDFString(text);
        // Filtrar apenas se parece com texto legível
        if (this.looksLikeText(decoded)) {
          extractedText += decoded + ' ';
        }
      }
    }
    
    extractedText = this.cleanText(extractedText);
    const quality = this.calculateQuality(extractedText);
    
    return {
      text: extractedText,
      quality: Math.max(quality - 20, 10), // Penaliza um pouco por ser agressivo
      method: 'aggressive-extraction',
      metadata: {
        pages: 1,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText)
      }
    };
  }
  
  private async rawStringExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Buscar por sequências de caracteres alfanuméricos
    const stringMatches = pdfString.match(/[a-zA-ZÀ-ÿ0-9\s]{3,}/g) || [];
    
    for (const match of stringMatches) {
      const cleaned = match.trim();
      if (cleaned.length > 2 && this.looksLikeText(cleaned)) {
        extractedText += cleaned + ' ';
      }
    }
    
    extractedText = this.cleanText(extractedText);
    const quality = Math.max(this.calculateQuality(extractedText) - 40, 5); // Penaliza bastante
    
    return {
      text: extractedText,
      quality,
      method: 'raw-string-extraction',
      metadata: {
        pages: 1,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText)
      }
    };
  }
  
  private looksLikeText(text: string): boolean {
    // Verifica se parece texto legível
    const alphaCount = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    const totalCount = text.length;
    return alphaCount / totalCount > 0.3; // Pelo menos 30% letras
  }
  
  private isMetadata(text: string): boolean {
    const patterns = [
      /^(Type|Font|PDF|Creator|Producer)/i,
      /FontDescriptor|BaseFont|MediaBox/i,
      /^[A-Z]{2,}[a-z]+[A-Z]/,
      /^\d+\s+\d+\s+R$/,
      /^[0-9\s\.]+$/,
      /^[A-Z]+$/
    ];
    return patterns.some(p => p.test(text.trim()));
  }
  
  private decodePDFString(str: string): string {
    return str
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, ' ');
  }
  
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:'"()\-À-ÿ]/g, '')
      .trim();
  }
  
  private calculateQuality(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const words = text.split(/\s+/);
    const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ]{2,}$/.test(w));
    const ratio = validWords.length / words.length;
    
    return Math.round(ratio * 100);
  }
  
  private countValidWords(text: string): number {
    return text.split(/\s+/).filter(w => /^[a-zA-ZÀ-ÿ]{2,}$/.test(w)).length;
  }
}

// Create chunks function
export function createChunks(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  
  if (!text || text.trim().length === 0) {
    return [];
  }
  
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
  
  return chunks.filter(chunk => chunk.length > 10);
}
