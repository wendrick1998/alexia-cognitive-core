
// File validation and header checking utilities
export interface ValidationResult {
  isValid: boolean;
  version?: string;
  error?: string;
}

export function validateInput(url: string, type: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error('URL do arquivo é obrigatória');
  }
  
  if (!type || typeof type !== 'string') {
    throw new Error('Tipo do arquivo é obrigatório');
  }
}

export function validateFileSize(contentLength: string | null, maxSizeMB: number = 100): void {
  if (contentLength) {
    const fileSize = parseInt(contentLength);
    if (fileSize > maxSizeMB * 1024 * 1024) {
      throw new Error(`Arquivo muito grande (máximo ${maxSizeMB}MB)`);
    }
  }
}

export function validatePDFHeader(uint8Array: Uint8Array): ValidationResult {
  if (uint8Array.length < 8) {
    return { isValid: false, error: 'Arquivo muito pequeno' };
  }
  
  const header = new TextDecoder().decode(uint8Array.slice(0, 8));
  
  if (!header.startsWith('%PDF-')) {
    return { isValid: false, error: 'Header PDF inválido' };
  }
  
  const version = header.substring(5, 8);
  return { isValid: true, version: `PDF ${version}` };
}

export function validatePDFSize(arrayBuffer: ArrayBuffer): void {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error('PDF está vazio ou corrompido');
  }
  
  const uint8Array = new Uint8Array(arrayBuffer);
  if (uint8Array.length < 1024) {
    throw new Error('PDF muito pequeno, possivelmente corrompido');
  }
}
