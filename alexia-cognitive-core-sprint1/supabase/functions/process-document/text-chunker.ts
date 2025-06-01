
// Text chunking utilities
export interface ChunkData {
  content: string;
  chunk_index: number;
  metadata: Record<string, any>;
}

// Memory-optimized chunking function
export function* createChunksGenerator(text: string, chunkSize: number = 800, overlap: number = 150): Generator<ChunkData> {
  console.log(`=== CRIANDO CHUNKS ===`);
  console.log(`Texto de entrada: ${text.length} caracteres`);
  console.log(`Configuração: chunkSize=${chunkSize}, overlap=${overlap}`);
  
  if (text.length === 0) {
    throw new Error('Não é possível criar chunks de texto vazio');
  }
  
  let startIndex = 0;
  let chunkIndex = 0;
  const maxChunks = 100;

  while (startIndex < text.length && chunkIndex < maxChunks) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex).trim();
    
    if (content.length > 10) {
      console.log(`Chunk ${chunkIndex}: ${content.length} chars - "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);
      
      yield {
        content,
        chunk_index: chunkIndex,
        metadata: {
          start_index: startIndex,
          end_index: endIndex,
          chunk_size: content.length,
          created_at: new Date().toISOString()
        }
      };
      chunkIndex++;
    }
    
    startIndex = endIndex - overlap;
    
    if (startIndex >= endIndex) {
      break;
    }
  }

  console.log(`Total de chunks criados: ${chunkIndex}`);
}
