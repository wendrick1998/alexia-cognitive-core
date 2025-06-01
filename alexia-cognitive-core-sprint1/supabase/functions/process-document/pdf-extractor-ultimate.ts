
import { calculateTextQuality, cleanAndValidateText } from './text-processor.ts';
import { 
  extractWithPDFJS,
  extractWithEnhancedPdfParse, 
  extractWithNativePDFParser, 
  extractWithStreamDecompression, 
  extractWithCleanExtraction,
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
    console.log('🚀 Iniciando extração robusta de PDF com estratégias otimizadas...');
    console.log(`📊 Tamanho do buffer: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
    
    // Estratégias ordenadas por probabilidade de sucesso e qualidade
    const strategies = [
      { name: 'pdfjs-dist', method: this.tryPDFJS.bind(this) },
      { name: 'pdf-parse-enhanced', method: this.tryEnhancedPdfParse.bind(this) },
      { name: 'native-pdf-parser', method: this.tryNativePDFParser.bind(this) },
      { name: 'stream-decompression', method: this.tryStreamDecompression.bind(this) },
      { name: 'clean-extraction', method: this.tryCleanExtraction.bind(this) },
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
          
          // Se qualidade excelente, usar imediatamente
          if (enhancedQuality >= 80) {
            console.log(`🎉 Qualidade excelente alcançada com ${strategy.name}!`);
            return this.finalizeResult(result);
          }
          
          // Manter o melhor resultado
          if (!bestResult || enhancedQuality > bestResult.quality) {
            bestResult = result;
            console.log(`🔄 Novo melhor resultado: ${strategy.name} (${enhancedQuality.toFixed(1)}%)`);
          }
          
          // Se qualidade boa o suficiente, interromper
          if (enhancedQuality >= 65) {
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
  
  private async tryPDFJS(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    const result = await extractWithPDFJS(arrayBuffer);
    return {
      text: result.text,
      quality: 0, // Será calculado depois
      method: 'pdfjs-dist',
      metadata: {
        pages: result.metadata?.pages || 1,
        totalChars: result.text.length,
        validWords: this.countValidWords(result.text),
        processedPages: result.metadata?.processedPages || 0
      }
    };
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
  
  private async tryCleanExtraction(pdfBuffer: Uint8Array): Promise<ExtractionResult> {
    const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    const result = await extractWithCleanExtraction(arrayBuffer);
    return {
      text: result.text,
      quality: 0, // Será calculado depois
      method: 'clean-extraction',
      metadata: {
        pages: result.metadata?.textBlocks || 1,
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
    const readabilityRatio = Math.min(1, validChars / totalChars);
    
    // Palavras válidas (incluindo números)
    const validWords = words.filter(w => /^[a-zA-ZÀ-ÿ0-9\-'\.]+$/.test(w));
    const wordValidityRatio = words.length > 0 ? validWords.length / words.length : 0;
    
    // Densidade de texto (palavras por caractere) - mais permissiva
    const wordDensity = totalChars > 0 ? words.length / totalChars : 0;
    const densityScore = wordDensity > 0.05 && wordDensity < 0.5 ? 1 : Math.max(0, 1 - Math.abs(wordDensity - 0.15) * 5);
    
    // Estrutura de sentenças - mais permissiva
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : words.length;
    const sentenceScore = avgWordsPerSentence > 2 && avgWordsPerSentence < 100 ? 1 : 0.5;
    
    // Diversidade de caracteres - mais permissiva
    const uniqueChars = new Set(cleanText.toLowerCase()).size;
    const diversityScore = uniqueChars > 10 ? 1 : uniqueChars / 10;
    
    // Cálculo da pontuação (0-100) - menos penalizante
    let score = 0;
    
    // Legibilidade (35 pontos)
    score += readabilityRatio * 35;
    
    // Validez das palavras (25 pontos)
    score += wordValidityRatio * 25;
    
    // Densidade de palavras (15 pontos)
    score += densityScore * 15;
    
    // Estrutura de sentenças (10 pontos)
    score += sentenceScore * 10;
    
    // Diversidade de caracteres (10 pontos)
    score += diversityScore * 10;
    
    // Bônus para texto substancial (5 pontos)
    if (totalChars > 100 && words.length > 20) score += 5;
    
    // Penalidades reduzidas
    if (totalChars < 50) score *= 0.8; // Menos penalidade para texto curto
    if (words.length < 10) score *= 0.9; // Menos penalidade para poucas palavras
    
    return Math.max(5, Math.min(100, score)); // Mínimo de 5%
  }
  
  private generateTextSample(text: string): string {
    if (!text || text.length === 0) return "texto vazio";
    
    const cleanText = text.trim();
    if (cleanText.length <= 150) return cleanText;
    
    // Primeira parte (100 chars)
    const beginning = cleanText.substring(0, 100);
    
    // Final (50 chars)
    const end = cleanText.substring(Math.max(0, cleanText.length - 50));
    
    return `INÍCIO: "${beginning}" ... FIM: "${end}"`;
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
  
  private countValidWords(text: string): number {
    return text.split(/\s+/).filter(w => /^[a-zA-ZÀ-ÿ0-9\-'\.]{2,}$/.test(w)).length;
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
