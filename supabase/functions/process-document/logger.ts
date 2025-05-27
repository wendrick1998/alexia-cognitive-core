
export class ProcessingLogger {
  private requestId: string;
  private startTime: number;

  constructor(requestId: string) {
    this.requestId = requestId;
    this.startTime = Date.now();
  }

  logStartHeader() {
    console.log('\n🚀 ═══════════════════════════════════════════════════════════════');
    console.log(`📋 DOCUMENT PROCESSING STARTED - Request ID: ${this.requestId}`);
    console.log('═══════════════════════════════════════════════════════════════');
  }

  logCompletionHeader() {
    const elapsed = Date.now() - this.startTime;
    console.log('\n✅ ═══════════════════════════════════════════════════════════════');
    console.log(`🎉 PROCESSING COMPLETED - Total time: ${elapsed}ms`);
    console.log('═══════════════════════════════════════════════════════════════');
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
    extractionQuality?: number;
    extractionMethod?: string;
  }) {
    console.log('\n📊 FINAL PROCESSING STATISTICS:');
    console.log(`   Document ID: ${stats.documentId}`);
    console.log(`   📝 Text length: ${stats.textLength} characters`);
    console.log(`   🔧 Chunks created: ${stats.chunksCreated}`);
    console.log(`   ❌ Chunks failed: ${stats.chunksFailed}`);
    console.log(`   ⏱️  Total time: ${stats.totalTime}ms`);
    console.log(`   📤 Extraction time: ${stats.extractionTime}ms`);
    console.log(`   🔄 Chunking time: ${stats.chunkingTime}ms`);
    console.log(`   🧠 Avg embedding time: ${Math.round(stats.avgEmbeddingTime)}ms`);
    console.log(`   📈 Processing rate: ${stats.processingRate} chunks/sec`);
    console.log(`   ✅ Success rate: ${stats.successRate.toFixed(1)}%`);
    
    if (stats.extractionQuality !== undefined) {
      console.log(`   🎯 Extraction quality: ${stats.extractionQuality.toFixed(2)}%`);
    }
    
    if (stats.extractionMethod) {
      console.log(`   🔍 Extraction method: ${stats.extractionMethod}`);
    }
    
    console.log('═══════════════════════════════════════════════════════════════\n');
  }

  log(message: string) {
    console.log(`[${this.requestId}] ${message}`);
  }

  info(message: string) {
    console.log(`[${this.requestId}] ℹ️  ${message}`);
  }

  success(message: string) {
    console.log(`[${this.requestId}] ✅ ${message}`);
  }

  warn(message: string) {
    console.log(`[${this.requestId}] ⚠️  ${message}`);
  }

  error(message: string, error?: any) {
    console.error(`[${this.requestId}] ❌ ${message}`);
    if (error) {
      console.error(`[${this.requestId}] Error details:`, error);
    }
  }

  stats(message: string) {
    console.log(`[${this.requestId}] 📊 ${message}`);
  }

  progress(message: string) {
    console.log(`[${this.requestId}] 🔄 ${message}`);
  }
}
