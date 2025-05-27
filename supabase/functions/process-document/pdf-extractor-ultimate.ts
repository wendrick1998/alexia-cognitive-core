
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
    console.log('🔍 Iniciando extração limpa de PDF...');
    
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
    
    if (extractedText.length < 50) {
      throw new Error('Texto extraído muito curto');
    }
    
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
  
  private isMetadata(text: string): boolean {
    const patterns = [
      /^(Type|Font|PDF|Creator|Producer)/i,
      /FontDescriptor|BaseFont|MediaBox/i,
      /^[A-Z]{2,}[a-z]+[A-Z]/,
      /^\d+\s+\d+\s+R$/
    ];
    return patterns.some(p => p.test(text.trim()));
  }
  
  private decodePDFString(str: string): string {
    return str
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\');
  }
  
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:'"()\-À-ÿ]/g, '')
      .trim();
  }
  
  private calculateQuality(text: string): number {
    const words = text.split(/\s+/);
    const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ]{2,}$/.test(w));
    return Math.round((validWords.length / words.length) * 100);
  }
  
  private countValidWords(text: string): number {
    return text.split(/\s+/).filter(w => /^[a-zA-ZÀ-ÿ]{2,}$/.test(w)).length;
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
