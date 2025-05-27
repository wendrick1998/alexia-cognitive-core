
// Fallback extraction system for when Ultimate PDF Extractor fails

export interface FallbackResult {
  text: string;
  method: string;
  quality: number;
  confidence: number;
}

export class ExtractionFallback {
  
  static async attemptBasicPDFExtraction(pdfBuffer: Uint8Array): Promise<FallbackResult> {
    console.log('🔄 Attempting basic PDF extraction fallback...');
    
    try {
      const decoder = new TextDecoder('latin1');
      const content = decoder.decode(pdfBuffer);
      
      let extractedText = '';
      
      // Strategy 1: Look for text in parentheses (common PDF text format)
      const textMatches = content.match(/\(([^)]+)\)/g);
      if (textMatches && textMatches.length > 0) {
        for (const match of textMatches) {
          const text = match.slice(1, -1); // Remove parentheses
          if (this.isValidTextSegment(text)) {
            extractedText += text + ' ';
          }
        }
      }
      
      // Strategy 2: Look for text commands
      const tjMatches = content.match(/\(([^)]+)\)\s*Tj/g);
      if (tjMatches && tjMatches.length > 0) {
        for (const match of tjMatches) {
          const text = match.replace(/^\(|\)\s*Tj$/g, '');
          if (this.isValidTextSegment(text)) {
            extractedText += text + ' ';
          }
        }
      }
      
      // Strategy 3: Look for readable ASCII sequences
      const asciiMatches = content.match(/[\x20-\x7E]{10,}/g);
      if (asciiMatches && asciiMatches.length > 0) {
        for (const match of asciiMatches) {
          if (this.isValidTextSegment(match) && !this.isPDFCommand(match)) {
            extractedText += match + ' ';
          }
        }
      }
      
      const cleanText = this.cleanExtractedText(extractedText);
      const quality = this.calculateFallbackQuality(cleanText);
      
      if (cleanText.length < 20) {
        throw new Error('Fallback extraction produced insufficient text');
      }
      
      console.log(`✅ Basic fallback extracted ${cleanText.length} characters with ${quality.toFixed(1)}% quality`);
      
      return {
        text: cleanText,
        method: 'basic-fallback',
        quality,
        confidence: Math.min(quality, 60) // Cap confidence for fallback methods
      };
      
    } catch (error) {
      console.error('❌ Basic fallback failed:', error);
      throw error;
    }
  }
  
  static async attemptTextFileExtraction(url: string): Promise<FallbackResult> {
    console.log('📄 Attempting text file extraction fallback...');
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const text = await response.text();
      const cleanText = this.cleanExtractedText(text);
      
      if (cleanText.length < 10) {
        throw new Error('Text file too short');
      }
      
      const quality = Math.min(95, this.calculateFallbackQuality(cleanText));
      
      console.log(`✅ Text fallback extracted ${cleanText.length} characters`);
      
      return {
        text: cleanText,
        method: 'text-fallback',
        quality,
        confidence: quality
      };
      
    } catch (error) {
      console.error('❌ Text fallback failed:', error);
      throw error;
    }
  }
  
  static async attemptEmergencyExtraction(pdfBuffer: Uint8Array): Promise<FallbackResult> {
    console.log('🚨 Attempting emergency extraction (last resort)...');
    
    try {
      // Very basic approach - look for any readable characters
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(pdfBuffer);
      
      // Extract anything that looks like words
      const wordMatches = content.match(/\b[a-zA-ZÀ-ÿ]{3,}\b/g);
      
      if (!wordMatches || wordMatches.length < 10) {
        throw new Error('Emergency extraction found no readable words');
      }
      
      // Join words with spaces
      const extractedText = wordMatches.join(' ');
      const cleanText = this.cleanExtractedText(extractedText);
      
      if (cleanText.length < 50) {
        throw new Error('Emergency extraction produced insufficient text');
      }
      
      const quality = Math.min(40, this.calculateFallbackQuality(cleanText));
      
      console.log(`⚠️ Emergency extraction recovered ${cleanText.length} characters with ${quality.toFixed(1)}% quality`);
      
      return {
        text: cleanText,
        method: 'emergency-extraction',
        quality,
        confidence: Math.min(quality, 30) // Very low confidence
      };
      
    } catch (error) {
      console.error('❌ Emergency extraction failed:', error);
      throw new Error('All extraction methods failed - document may be corrupted or encrypted');
    }
  }
  
  private static isValidTextSegment(text: string): boolean {
    if (!text || text.length < 3) return false;
    
    // Check if text contains reasonable amount of letters
    const letters = text.match(/[a-zA-ZÀ-ÿ]/g);
    const letterRatio = letters ? letters.length / text.length : 0;
    
    // Must be at least 30% letters
    return letterRatio > 0.3;
  }
  
  private static isPDFCommand(text: string): boolean {
    const commands = [
      'obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer', 'startxref',
      'BT', 'ET', 'Tf', 'Tj', 'TJ', 'Td', 'TD', 'Tm', 'T*',
      'FlateDecode', 'Length', 'Filter', 'Type', 'Subtype'
    ];
    
    return commands.some(cmd => text.includes(cmd));
  }
  
  private static cleanExtractedText(text: string): string {
    return text
      .replace(/\0/g, '') // Remove null characters
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:'"()\-À-ÿ]/g, '') // Remove unusual characters
      .trim();
  }
  
  private static calculateFallbackQuality(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const totalChars = text.length;
    
    // Basic quality metrics
    const wordCount = words.length;
    const avgWordLength = wordCount > 0 ? words.reduce((sum, word) => sum + word.length, 0) / wordCount : 0;
    const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ0-9]+$/.test(w)).length;
    const validWordRatio = wordCount > 0 ? validWords / wordCount : 0;
    
    // Score calculation (0-100)
    let score = 0;
    
    // Length factor
    if (totalChars > 500) score += 25;
    else if (totalChars > 200) score += 20;
    else if (totalChars > 100) score += 15;
    else if (totalChars > 50) score += 10;
    
    // Word count factor
    if (wordCount > 100) score += 25;
    else if (wordCount > 50) score += 20;
    else if (wordCount > 20) score += 15;
    else if (wordCount > 10) score += 10;
    
    // Average word length factor
    if (avgWordLength >= 3 && avgWordLength <= 8) score += 20;
    else if (avgWordLength >= 2 && avgWordLength <= 12) score += 15;
    else if (avgWordLength >= 1) score += 10;
    
    // Valid word ratio factor
    score += validWordRatio * 30;
    
    return Math.max(0, Math.min(100, score));
  }
}
