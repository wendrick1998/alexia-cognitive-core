
import { calculateTextQuality, cleanAndValidateText } from './text-processor.ts';
import { 
  extractWithEnhancedPdfParse, 
  extractWithNativePDFParser, 
  extractWithStreamDecompression, 
  extractWithRawTextSearch,
  ExtractionResult 
} from './extraction-strategies.ts';

export interface ExtractionResult {
  text: string;
  quality: number;
  method: string;
  metadata: {
    pages: number;
    totalChars: number;
    validWords: number;
    encoding?: string;
    confidence?: number;
    textSample?: string;
  };
}

export class UltimatePDFExtractor {
  
  async extractText(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    console.log('🔍 Iniciando extração robusta de PDF com estratégias priorizadas...');
    console.log(`📊 Tamanho do buffer: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    
    // Estratégias ordenadas por probabilidade de sucesso e qualidade
    const strategies = [
      { name: 'pdf-parse-enhanced', method: this.tryEnhancedPdfParse.bind(this) },
      { name: 'native-pdf-parser', method: this.tryNativePDFParser.bind(this) },
      { name: 'stream-decompression', method: this.tryStreamDecompression.bind(this) },
      { name: 'clean-extraction', method: this.tryCleanExtraction.bind(this) },
      { name: 'aggressive-extraction', method: this.tryAggressiveExtraction.bind(this) },
      { name: 'raw-text-search', method: this.tryRawTextSearch.bind(this) }
    ];

    let bestResult: ExtractionResult | null = null;
    let allResults: ExtractionResult[] = [];

    for (const strategy of strategies) {
      try {
        console.log(`🔄 Tentando estratégia: ${strategy.name}`);
        const startTime = Date.now();
        
        const result = await strategy.method(pdfBuffer);
        const processingTime = Date.now() - startTime;
        
        if (result && result.text.length > 0) {
          // Calcular qualidade melhorada
          const enhancedQuality = this.calculateEnhancedQuality(result.text);
          result.quality = enhancedQuality;
          result.metadata.confidence = enhancedQuality;
          
          // Adicionar amostra do texto para diagnóstico
          result.metadata.textSample = this.generateTextSample(result.text);
          
          allResults.push(result);
          
          console.log(`✅ Estratégia ${strategy.name}:`);
          console.log(`   ⏱️  Tempo: ${processingTime}ms`);
          console.log(`   📝 Caracteres: ${result.text.length}`);
          console.log(`   🎯 Qualidade: ${enhancedQuality.toFixed(1)}%`);
          console.log(`   📋 Amostra: "${result.metadata.textSample}"`);
          
          // Se qualidade alta, usar imediatamente
          if (enhancedQuality >= 75) {
            console.log(`🎉 Qualidade excelente alcançada com ${strategy.name}!`);
            return this.finalizeResult(result);
          }
          
          // Manter o melhor resultado
          if (!bestResult || enhancedQuality > bestResult.quality) {
            bestResult = result;
            console.log(`🔄 Novo melhor resultado: ${strategy.name} (${enhancedQuality.toFixed(1)}%)`);
          }
          
          // Se qualidade boa o suficiente, interromper
          if (enhancedQuality >= 60) {
            console.log(`✅ Qualidade satisfatória alcançada com ${strategy.name}!`);
            break;
          }
        } else {
          console.log(`⚠️ Estratégia ${strategy.name} não retornou texto válido`);
        }
        
      } catch (error) {
        console.error(`❌ Estratégia ${strategy.name} falhou:`, error.message);
      }
    }

    // Log de resumo de todas as tentativas
    console.log(`📊 Resumo das tentativas: ${allResults.length} estratégias produziram texto`);
    for (const result of allResults) {
      console.log(`   ${result.method}: ${result.quality.toFixed(1)}% qualidade, ${result.text.length} chars`);
    }

    if (bestResult) {
      console.log(`🎯 Usando melhor resultado: ${bestResult.method} (${bestResult.quality.toFixed(1)}%)`);
      return this.finalizeResult(bestResult);
    }

    throw new Error(`Todas as estratégias de extração falharam. Buffer: ${pdfBuffer.length} bytes`);
  }
  
  private async tryEnhancedPdfParse(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    const result = await extractWithEnhancedPdfParse(arrayBuffer);
    return {
      text: result.text,
      quality: 0, // Será calculado depois
      method: 'pdf-parse-enhanced',
      metadata: {
        pages: result.metadata?.pages || 1,
        totalChars: result.text.length,
        validWords: this.countValidWords(result.text)
      }
    };
  }
  
  private async tryNativePDFParser(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    const result = await extractWithNativePDFParser(arrayBuffer);
    return {
      text: result.text,
      quality: 0, // Será calculado depois
      method: 'native-pdf-parser',
      metadata: {
        pages: result.metadata?.objectsProcessed || 1,
        totalChars: result.text.length,
        validWords: this.countValidWords(result.text)
      }
    };
  }
  
  private async tryStreamDecompression(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    const result = await extractWithStreamDecompression(arrayBuffer);
    return {
      text: result.text,
      quality: 0, // Será calculado depois
      method: 'stream-decompression',
      metadata: {
        pages: result.metadata?.streamsProcessed || 1,
        totalChars: result.text.length,
        validWords: this.countValidWords(result.text)
      }
    };
  }
  
  private async tryRawTextSearch(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    const result = await extractWithRawTextSearch(arrayBuffer);
    return {
      text: result.text,
      quality: 0, // Será calculado depois
      method: 'raw-text-search',
      metadata: {
        pages: 1,
        totalChars: result.text.length,
        validWords: this.countValidWords(result.text),
        encoding: result.metadata?.encoding
      }
    };
  }
  
  private async tryCleanExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const pdfString = new TextDecoder('latin1').decode(pdfBuffer);
    let extractedText = '';
    
    // Encontrar blocos de texto (BT...ET) com melhor parsing
    const textBlocks = pdfString.match(/BT[\s\S]*?ET/g) || [];
    
    for (const block of textBlocks) {
      // Extrair texto entre parênteses + Tj/TJ
      const tjMatches = block.match(/\(([^)]+)\)\s*T[jJ]/g) || [];
      
      for (const match of tjMatches) {
        const text = match.match(/\(([^)]+)\)/)?.[1];
        if (text && text.length > 1 && !this.isMetadata(text)) {
          extractedText += this.decodePDFString(text) + ' ';
        }
      }
      
      // Extrair arrays TJ com melhor parsing
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
    
    return {
      text: extractedText,
      quality: 0, // Será calculado depois
      method: 'clean-extraction',
      metadata: {
        pages: textBlocks.length,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText)
      }
    };
  }
  
  private async tryAggressiveExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
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
    
    return {
      text: extractedText,
      quality: 0, // Será calculado depois
      method: 'aggressive-extraction',
      metadata: {
        pages: 1,
        totalChars: extractedText.length,
        validWords: this.countValidWords(extractedText)
      }
    };
  }
  
  private calculateEnhancedQuality(text: string): number {
    if (!text || text.length === 0) return 0;
    
    const cleanText = text.trim();
    if (cleanText.length < 10) return 5;
    
    // Métricas básicas
    const totalChars = cleanText.length;
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Contadores de caracteres válidos (incluindo números e pontuação)
    const alphaChars = (cleanText.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    const numericChars = (cleanText.match(/[0-9]/g) || []).length;
    const punctuationChars = (cleanText.match(/[.,!?;:()\-"']/g) || []).length;
    const spaceChars = (cleanText.match(/\s/g) || []).length;
    
    const validChars = alphaChars + numericChars + punctuationChars + spaceChars;
    const readabilityRatio = validChars / totalChars;
    
    // Palavras válidas (incluindo números)
    const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ0-9\-']+$/.test(w));
    const wordValidityRatio = words.length > 0 ? validWords.length / words.length : 0;
    
    // Densidade de texto (palavras por caractere)
    const wordDensity = totalChars > 0 ? words.length / totalChars : 0;
    const optimalDensity = wordDensity > 0.1 && wordDensity < 0.3; // Entre 10-30% é bom
    
    // Estrutura de sentenças
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const sentenceStructure = avgWordsPerSentence > 3 && avgWordsPerSentence < 50; // Sentenças razoáveis
    
    // Diversidade de caracteres
    const uniqueChars = new Set(cleanText.toLowerCase()).size;
    const charDiversity = uniqueChars > 15; // Boa diversidade
    
    // Cálculo da pontuação (0-100)
    let score = 0;
    
    // Legibilidade (40 pontos)
    score += readabilityRatio * 40;
    
    // Validez das palavras (25 pontos)
    score += wordValidityRatio * 25;
    
    // Densidade de palavras (15 pontos)
    if (optimalDensity) score += 15;
    else score += Math.max(0, 15 - Math.abs(wordDensity - 0.2) * 100);
    
    // Estrutura de sentenças (10 pontos)
    if (sentenceStructure) score += 10;
    else if (sentences.length > 0) score += 5;
    
    // Diversidade de caracteres (5 pontos)
    if (charDiversity) score += 5;
    
    // Penalidades
    if (totalChars < 50) score *= 0.5; // Texto muito curto
    if (words.length < 10) score *= 0.6; // Poucas palavras
    
    // Bônus para texto substancial
    if (totalChars > 500 && words.length > 50) score += 5;
    if (totalChars > 2000 && words.length > 200) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private generateTextSample(text: string): string {
    if (!text || text.length === 0) return "texto vazio";
    
    const cleanText = text.trim();
    if (cleanText.length <= 100) return cleanText;
    
    // Primeira parte (100 chars)
    const beginning = cleanText.substring(0, 100);
    
    // Meio (50 chars)
    const midPoint = Math.floor(cleanText.length / 2);
    const middle = cleanText.substring(midPoint - 25, midPoint + 25);
    
    // Final (50 chars)
    const end = cleanText.substring(cleanText.length - 50);
    
    return `INÍCIO: "${beginning}" ... MEIO: "${middle}" ... FIM: "${end}"`;
  }
  
  private finalizeResult(result: ExtractionResult): ExtractionResult {
    // Limpar e validar o texto final
    const cleanedText = cleanAndValidateText(result.text);
    
    // Recalcular qualidade final
    const finalQuality = this.calculateEnhancedQuality(cleanedText);
    
    console.log(`🔧 Finalizando resultado:`);
    console.log(`   📝 Texto original: ${result.text.length} chars`);
    console.log(`   🧹 Texto limpo: ${cleanedText.length} chars`);
    console.log(`   🎯 Qualidade final: ${finalQuality.toFixed(1)}%`);
    
    return {
      text: cleanedText,
      quality: finalQuality,
      method: result.method,
      metadata: {
        ...result.metadata,
        totalChars: cleanedText.length,
        validWords: this.countValidWords(cleanedText),
        textSample: this.generateTextSample(cleanedText)
      }
    };
  }
  
  private looksLikeText(text: string): boolean {
    if (!text || text.length < 2) return false;
    
    // Verificar se contém caracteres legíveis suficientes
    const alphaNumCount = (text.match(/[a-zA-ZÀ-ÿ0-9]/g) || []).length;
    const totalCount = text.length;
    const ratio = alphaNumCount / totalCount;
    
    // Pelo menos 40% deve ser alfanumérico
    return ratio > 0.4;
  }
  
  private isMetadata(text: string): boolean {
    const patterns = [
      /^(Type|Font|PDF|Creator|Producer|Title|Author|Subject|Keywords)/i,
      /FontDescriptor|BaseFont|MediaBox|CropBox|BleedBox/i,
      /^[A-Z]{2,}[a-z]+[A-Z]/,
      /^\d+\s+\d+\s+R$/,
      /^[0-9\s\.]+$/,
      /^[A-Z]+$/,
      /obj|endobj|stream|endstream/i
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
      .replace(/\\t/g, ' ')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']');
  }
  
  private countValidWords(text: string): number {
    return text.split(/\s+/).filter(w => /^[a-zA-ZÀ-ÿ0-9\-']{2,}$/.test(w)).length;
  }
}

// Create chunks function melhorada
export function createChunks(text: string, chunkSize: number = 1000): string[] {
  const chunks: string[] = [];
  
  if (!text || text.trim().length === 0) {
    return [];
  }
  
  // Usar sentenças como unidade básica para manter contexto
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    // Se adicionar a sentença ultrapassar o limite e já temos conteúdo
    if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSentence + ' ';
    } else {
      currentChunk += trimmedSentence + ' ';
    }
  }
  
  // Adicionar último chunk se tiver conteúdo
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // Filtrar chunks muito pequenos
  return chunks.filter(chunk => chunk.length > 20);
}
