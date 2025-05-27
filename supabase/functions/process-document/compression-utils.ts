
// Compression and decompression utilities
export async function decompressFlateData(data: string): Promise<string | null> {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const uint8Data = encoder.encode(data);
    
    // Try to decompress using native Deno compression
    const decompressedStream = new DecompressionStream('deflate');
    const writer = decompressedStream.writable.getWriter();
    const reader = decompressedStream.readable.getReader();
    
    writer.write(uint8Data);
    writer.close();
    
    const { value } = await reader.read();
    if (value) {
      return decoder.decode(value);
    }
    
    return null;
  } catch (error) {
    console.warn('Erro na decompressão Flate:', error);
    return null;
  }
}

export async function decompressPDFStream(streamObject: string): Promise<string | null> {
  try {
    // Extract the actual stream data
    const streamMatch = streamObject.match(/stream\s*\n([\s\S]*?)\nendstream/);
    if (!streamMatch) return null;
    
    const streamData = streamMatch[1];
    return await decompressFlateData(streamData);
  } catch (error) {
    console.warn('Erro na decompressão do stream PDF:', error);
    return null;
  }
}
