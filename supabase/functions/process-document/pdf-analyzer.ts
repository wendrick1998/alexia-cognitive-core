
// PDF structure analysis utilities
export interface PDFStructure {
  objects: number;
  streams: number;
  compressed: number;
}

export function analyzePDFStructure(content: string): PDFStructure {
  const objectMatches = content.match(/\d+\s+\d+\s+obj/g);
  const streamMatches = content.match(/stream\s*\n/g);
  const compressedMatches = content.match(/FlateDecode/g);
  
  return {
    objects: objectMatches?.length || 0,
    streams: streamMatches?.length || 0,
    compressed: compressedMatches?.length || 0
  };
}

export function extractTextObjects(content: string): string[] {
  const objects: string[] = [];
  const objectPattern = /(\d+\s+\d+\s+obj[\s\S]*?endobj)/gi;
  let match;
  
  while ((match = objectPattern.exec(content)) !== null) {
    const obj = match[1];
    // Look for text-related objects
    if (obj.includes('/Type/Page') || obj.includes('BT') || obj.includes('Tj') || obj.includes('TJ')) {
      objects.push(obj);
    }
  }
  
  return objects;
}

export function extractStreams(content: string) {
  const streamPattern = /(\d+\s+\d+\s+obj[\s\S]*?stream\s*\n)([\s\S]*?)(\nendstream)/gi;
  const streams = [];
  let match;
  
  while ((match = streamPattern.exec(content)) !== null) {
    const streamHeader = match[1];
    const streamData = match[2];
    
    streams.push({
      header: streamHeader,
      data: streamData,
      isCompressed: streamHeader.includes('FlateDecode') || streamHeader.includes('/Filter')
    });
  }
  
  return streams;
}
