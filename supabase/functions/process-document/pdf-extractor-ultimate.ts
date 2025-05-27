
interface ExtractionResult {
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
    console.log('🔍 Starting ultimate PDF extraction...');
    
    const strategies = [
      { name: 'native-decoder', fn: () => this.nativeDecoder(pdfBuffer) },
      { name: 'stream-extraction', fn: () => this.streamExtraction(pdfBuffer) },
      { name: 'text-commands', fn: () => this.textCommandExtraction(pdfBuffer) },
      { name: 'binary-search', fn: () => this.binaryTextSearch(pdfBuffer) }
    ];

    let bestResult: ExtractionResult | null = null;
    let bestQuality = 0;

    for (const strategy of strategies) {
      try {
        console.log(`📋 Trying strategy: ${strategy.name}`);
        const result = await strategy.fn();
        
        if (result && result.quality > bestQuality) {
          bestResult = result;
          bestQuality = result.quality;
          console.log(`✅ New best quality: ${result.quality.toFixed(2)}%`);
        }
        
        if (bestQuality > 85) {
          console.log('🎯 Excellent quality achieved, stopping...');
          break;
        }
      } catch (error) {
        console.error(`❌ Error in strategy ${strategy.name}:`, error);
      }
    }

    if (!bestResult || bestResult.quality < 15) {
      throw new Error('Could not extract readable text from PDF');
    }

    return bestResult;
  }

  private async nativeDecoder(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const decoder = new TextDecoder('latin1');
    const content = decoder.decode(pdfBuffer);
    
    let extractedText = '';
    let pageCount = 0;
    
    // Look for text between parentheses (common PDF text format)
    const textMatches = content.match(/\(([^)]+)\)/g);
    if (textMatches) {
      for (const match of textMatches) {
        const text = match.slice(1, -1);
        if (this.isValidText(text)) {
          extractedText += text + ' ';
          pageCount++;
        }
      }
    }
    
    const quality = this.calculateTextQuality(extractedText);
    
    return {
      text: this.cleanText(extractedText),
      quality,
      method: 'native-decoder',
      metadata: {
        pages: Math.max(1, Math.floor(pageCount / 10)),
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText),
        encoding: 'latin1'
      }
    };
  }

  private async streamExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const decoder = new TextDecoder('latin1');
    const content = decoder.decode(pdfBuffer);
    
    let extractedText = '';
    
    // Find streams in PDF
    const streamRegex = /stream\s*\n([\s\S]*?)\nendstream/g;
    let match;
    let streamCount = 0;
    
    while ((match = streamRegex.exec(content)) !== null) {
      streamCount++;
      const streamData = match[1];
      
      // Try to extract text from stream
      const textFromStream = this.extractTextFromStream(streamData);
      if (textFromStream) {
        extractedText += textFromStream + '\n';
      }
    }
    
    const quality = this.calculateTextQuality(extractedText);
    
    return {
      text: this.cleanText(extractedText),
      quality,
      method: 'stream-extraction',
      metadata: {
        pages: Math.max(1, streamCount),
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText),
        encoding: 'latin1'
      }
    };
  }

  private async textCommandExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const decoder = new TextDecoder('utf-8');
    const content = decoder.decode(pdfBuffer);
    
    let extractedText = '';
    
    // PDF text showing commands
    const patterns = [
      /\(([^)]+)\)\s*Tj/g,  // Simple text
      /\[(.*?)\]\s*TJ/g,    // Text array
      /BT([\s\S]*?)ET/g     // Text blocks
    ];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleaned = this.cleanPDFText(match);
          if (cleaned && this.isValidText(cleaned)) {
            extractedText += cleaned + ' ';
          }
        }
      }
    }
    
    const quality = this.calculateTextQuality(extractedText);
    
    return {
      text: this.cleanText(extractedText),
      quality,
      method: 'text-commands',
      metadata: {
        pages: 1,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText),
        encoding: 'utf-8'
      }
    };
  }

  private async binaryTextSearch(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const decoder = new TextDecoder('latin1');
    const content = decoder.decode(pdfBuffer);
    
    let extractedText = '';
    
    // Search for printable ASCII text sequences
    const asciiRegex = /[\x20-\x7E]{6,}/g;
    const matches = content.match(asciiRegex);
    
    if (matches) {
      for (const match of matches) {
        if (this.isValidText(match) && !this.isPDFCommand(match)) {
          extractedText += match + ' ';
        }
      }
    }
    
    const quality = this.calculateTextQuality(extractedText);
    
    return {
      text: this.cleanText(extractedText),
      quality,
      method: 'binary-search',
      metadata: {
        pages: 1,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText),
        encoding: 'latin1'
      }
    };
  }

  private extractTextFromStream(streamData: string): string {
    let text = '';
    
    // Look for text patterns in stream
    const textPatterns = [
      /\(([^)]+)\)/g,
      /BT\s*(.*?)\s*ET/gs,
      /Tj\s*\n*\s*\(([^)]+)\)/g
    ];
    
    for (const pattern of textPatterns) {
      const matches = streamData.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleaned = match.replace(/^[\(\)BT\s]+|[\(\)ET\s]+$/g, '');
          if (this.isValidText(cleaned)) {
            text += cleaned + ' ';
          }
        }
      }
    }
    
    return text;
  }

  private cleanPDFText(text: string): string {
    return text
      .replace(/\\/g, '')
      .replace(/[()[\]]/g, '')
      .replace(/Tj|TJ|BT|ET/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isValidText(text: string): boolean {
    if (!text || text.length < 3) return false;
    
    // Check if text contains reasonable amount of letters
    const letters = text.match(/[a-zA-ZÀ-ÿ]/g);
    const letterRatio = letters ? letters.length / text.length : 0;
    
    return letterRatio > 0.3 && text.length > 2;
  }

  private isPDFCommand(text: string): boolean {
    const commands = ['obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer', 'startxref'];
    return commands.some(cmd => text.includes(cmd));
  }

  private calculateTextQuality(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const totalChars = text.length;
    const validChars = text.match(/[a-zA-ZÀ-ÿ0-9\s.,!?;:'"()-]/g)?.length || 0;
    const words = text.split(/\s+/).filter(w => w.length > 1);
    const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ0-9]+$/.test(w)).length;
    
    // Quality scoring
    const charScore = (validChars / totalChars) * 100;
    const wordScore = words.length > 0 ? (validWords / words.length) * 100 : 0;
    const lengthScore = Math.min(100, (text.length / 100) * 10);
    
    // Penalize if too many special characters
    const specialChars = text.match(/[^\w\s.,!?;:'"()-À-ÿ]/g)?.length || 0;
    const penalty = Math.max(0, 100 - (specialChars / totalChars) * 200);
    
    return Math.min(100, (charScore * 0.4 + wordScore * 0.4 + lengthScore * 0.1 + penalty * 0.1));
  }

  private countValidWords(text: string): number {
    const words = text.split(/\s+/).filter(w => w.length > 1);
    return words.filter(w => /^[a-zA-ZÀ-ÿ0-9]+$/.test(w)).length;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\0/g, '')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:'"()\-À-ÿ]/g, '')
      .trim();
  }
}

export function createChunks(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 10);
}
