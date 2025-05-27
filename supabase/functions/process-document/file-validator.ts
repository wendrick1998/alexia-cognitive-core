
// Enhanced file validation utilities for the Ultimate PDF Extractor

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  version?: string;
  fileSize?: number;
}

export function validateInput(url: string, type: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }
  
  if (!type || typeof type !== 'string') {
    throw new Error('File type is required and must be a string');
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }
  
  // Validate supported file types
  const supportedTypes = ['pdf', 'txt', 'md'];
  const normalizedType = type.toLowerCase().trim();
  
  if (!supportedTypes.includes(normalizedType)) {
    throw new Error(`Unsupported file type: ${type}. Supported types: ${supportedTypes.join(', ')}`);
  }
}

export function validateFileSize(contentLength: string | null, maxSizeMB: number = 50): void {
  if (!contentLength) {
    console.warn('⚠️ File size unknown - proceeding with caution');
    return;
  }
  
  const sizeBytes = parseInt(contentLength);
  const sizeMB = sizeBytes / (1024 * 1024);
  
  if (sizeMB > maxSizeMB) {
    throw new Error(`File too large: ${sizeMB.toFixed(1)}MB (max: ${maxSizeMB}MB)`);
  }
  
  console.log(`✅ File size validated: ${sizeMB.toFixed(2)}MB`);
}

export function validatePDFHeader(buffer: Uint8Array): ValidationResult {
  if (!buffer || buffer.length < 8) {
    return {
      isValid: false,
      error: 'File too small to be a valid PDF'
    };
  }
  
  // Check PDF header signature
  const header = new TextDecoder('ascii').decode(buffer.slice(0, 8));
  
  if (!header.startsWith('%PDF-')) {
    return {
      isValid: false,
      error: 'Invalid PDF header - file may be corrupted'
    };
  }
  
  // Extract PDF version
  const version = header.substring(5, 8);
  
  // Validate PDF version
  const validVersions = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '2.0'];
  if (!validVersions.includes(version)) {
    console.warn(`⚠️ Unusual PDF version: ${version}`);
  }
  
  return {
    isValid: true,
    version: version,
    fileSize: buffer.length
  };
}

export function validatePDFSize(buffer: ArrayBuffer, maxSizeMB: number = 50): void {
  const sizeMB = buffer.byteLength / (1024 * 1024);
  
  if (sizeMB > maxSizeMB) {
    throw new Error(`PDF too large: ${sizeMB.toFixed(1)}MB (max: ${maxSizeMB}MB)`);
  }
  
  if (sizeMB < 0.001) { // Less than 1KB
    throw new Error('PDF too small - may be corrupted');
  }
  
  console.log(`✅ PDF size validated: ${sizeMB.toFixed(2)}MB`);
}

export function validateTextContent(text: string, minLength: number = 10): ValidationResult {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      error: 'No text content provided'
    };
  }
  
  const cleanText = text.trim();
  
  if (cleanText.length < minLength) {
    return {
      isValid: false,
      error: `Text too short: ${cleanText.length} characters (minimum: ${minLength})`
    };
  }
  
  // Check for reasonable text content
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 3) {
    return {
      isValid: false,
      error: 'Text contains too few words for meaningful processing'
    };
  }
  
  // Check character diversity
  const uniqueChars = new Set(cleanText.toLowerCase()).size;
  if (uniqueChars < 10) {
    return {
      isValid: false,
      error: 'Text lacks sufficient character diversity'
    };
  }
  
  return {
    isValid: true,
    fileSize: cleanText.length
  };
}

export function validateChunkQuality(chunk: string): boolean {
  if (!chunk || chunk.trim().length < 20) {
    return false;
  }
  
  const words = chunk.trim().split(/\s+/);
  
  // Must have at least 5 words
  if (words.length < 5) {
    return false;
  }
  
  // Check for reasonable word lengths
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  if (avgWordLength < 2 || avgWordLength > 20) {
    return false;
  }
  
  return true;
}
