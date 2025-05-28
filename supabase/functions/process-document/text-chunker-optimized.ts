
// Optimized text chunking for LLMWhisperer output
export interface ChunkData {
  content: string;
  chunk_index: number;
  metadata: Record<string, any>;
}

export function splitTextIntoChunks(
  text: string, 
  maxLen: number = 1500, 
  overlap: number = 200
): ChunkData[] {
  console.log(`📦 Iniciando chunking: ${text.length} caracteres, maxLen=${maxLen}, overlap=${overlap}`);
  
  if (!text || text.trim().length === 0) {
    throw new Error('Texto vazio fornecido para chunking');
  }

  const chunks: ChunkData[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  // Preprocess text to handle markdown structure better
  const cleanText = text
    .replace(/\n{3,}/g, '\n\n') // Normalize excessive newlines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  while (startIndex < cleanText.length) {
    let endIndex = Math.min(startIndex + maxLen, cleanText.length);
    
    // Try to break at natural boundaries if not at end of text
    if (endIndex < cleanText.length) {
      // Look for paragraph breaks first
      const paragraphBreak = cleanText.lastIndexOf('\n\n', endIndex);
      if (paragraphBreak > startIndex + maxLen * 0.5) {
        endIndex = paragraphBreak + 2;
      } else {
        // Look for sentence breaks
        const sentenceBreak = cleanText.lastIndexOf('. ', endIndex);
        if (sentenceBreak > startIndex + maxLen * 0.7) {
          endIndex = sentenceBreak + 2;
        } else {
          // Look for word boundaries
          const wordBreak = cleanText.lastIndexOf(' ', endIndex);
          if (wordBreak > startIndex + maxLen * 0.8) {
            endIndex = wordBreak + 1;
          }
        }
      }
    }

    const chunkContent = cleanText.slice(startIndex, endIndex).trim();
    
    if (chunkContent.length > 20) { // Only include meaningful chunks
      chunks.push({
        content: chunkContent,
        chunk_index: chunkIndex,
        metadata: {
          start_index: startIndex,
          end_index: endIndex,
          chunk_size: chunkContent.length,
          word_count: chunkContent.split(/\s+/).length,
          created_at: new Date().toISOString(),
          source: 'llmwhisperer'
        }
      });
      chunkIndex++;
    }

    // Calculate next start position with overlap
    startIndex = Math.max(endIndex - overlap, startIndex + 1);
    
    // Prevent infinite loop
    if (startIndex >= endIndex) {
      break;
    }
  }

  console.log(`✅ Chunking concluído: ${chunks.length} chunks criados`);
  return chunks;
}
