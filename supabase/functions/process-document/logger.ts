
// Logging utilities for document processing
export class ProcessingLogger {
  private requestId: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }

  log(message: string, ...args: any[]) {
    console.log(`[${this.requestId}] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.requestId}] ❌ ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.requestId}] ⚠️ ${message}`, ...args);
  }

  success(message: string, ...args: any[]) {
    console.log(`[${this.requestId}] ✅ ${message}`, ...args);
  }

  info(message: string, ...args: any[]) {
    console.log(`[${this.requestId}] 📋 ${message}`, ...args);
  }

  stats(message: string, ...args: any[]) {
    console.log(`[${this.requestId}] 📊 ${message}`, ...args);
  }

  progress(message: string, ...args: any[]) {
    console.log(`[${this.requestId}] 📈 ${message}`, ...args);
  }

  logStartHeader() {
    console.log(`=== [${this.requestId}] PROCESSO INICIADO (VERSÃO CORRIGIDA) EM ${new Date().toISOString()} ===`);
  }

  logCompletionHeader() {
    console.log(`=== [${this.requestId}] PROCESSAMENTO CONCLUÍDO COM SUCESSO ===`);
  }

  logErrorHeader(processingTime: number, documentId?: string) {
    console.error(`=== [${this.requestId}] ERRO CRÍTICO APÓS ${processingTime}ms ===`);
    console.error(`[${this.requestId}] Documento: ${documentId || 'unknown'}`);
  }

  logFinalStats(stats: {
    documentId: string;
    chunksCreated: number;
    chunksFailed: number;
    totalTime: number;
    extractionTime: number;
    chunkingTime: number;
    avgEmbeddingTime: number;
    processingRate: number;
    textLength: number;
    successRate: number;
  }) {
    this.info(`Estatísticas finais:`);
    this.log(`- Documento: ${stats.documentId}`);
    this.log(`- Chunks criados: ${stats.chunksCreated}`);
    this.log(`- Chunks falharam: ${stats.chunksFailed}`);
    this.log(`- Tempo total: ${stats.totalTime}ms`);
    this.log(`- Tempo de extração: ${stats.extractionTime}ms`);
    this.log(`- Tempo de chunking: ${stats.chunkingTime}ms`);
    this.log(`- Tempo médio por embedding: ${stats.avgEmbeddingTime.toFixed(0)}ms`);
    this.log(`- Taxa de processamento: ${stats.processingRate.toFixed(2)} chunks/segundo`);
    this.log(`- Caracteres originais: ${stats.textLength}`);
    this.log(`- Taxa de sucesso: ${stats.successRate.toFixed(1)}%`);
  }
}
