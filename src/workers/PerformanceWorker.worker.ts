
// Performance Worker for background optimizations
// This handles CPU-intensive tasks without blocking the main thread

interface WorkerTask {
  task: string;
  data: any;
}

interface WorkerResponse {
  result?: any;
  error?: string;
}

// Cache compression utilities
function compressData(data: string): string {
  // Simple LZ-style compression simulation
  let compressed = '';
  let i = 0;
  
  while (i < data.length) {
    let match = '';
    let matchLength = 0;
    
    // Look for repeated patterns
    for (let j = Math.max(0, i - 1000); j < i; j++) {
      let length = 0;
      while (
        j + length < i && 
        i + length < data.length && 
        data[j + length] === data[i + length] &&
        length < 255
      ) {
        length++;
      }
      
      if (length > matchLength && length > 3) {
        matchLength = length;
        match = `[${i - j},${length}]`;
      }
    }
    
    if (matchLength > 3) {
      compressed += match;
      i += matchLength;
    } else {
      compressed += data[i];
      i++;
    }
  }
  
  return compressed;
}

function decompressData(compressed: string): string {
  // Decompress the data
  let result = '';
  let i = 0;
  
  while (i < compressed.length) {
    if (compressed[i] === '[') {
      // Find the end of the reference
      let end = compressed.indexOf(']', i);
      if (end !== -1) {
        let ref = compressed.substring(i + 1, end);
        let [offset, length] = ref.split(',').map(Number);
        
        // Copy the referenced data
        let start = result.length - offset;
        for (let j = 0; j < length; j++) {
          result += result[start + j];
        }
        
        i = end + 1;
      } else {
        result += compressed[i];
        i++;
      }
    } else {
      result += compressed[i];
      i++;
    }
  }
  
  return result;
}

// Analytics processing
function processAnalytics(rawData: any[]): any {
  const processed = {
    totalEvents: rawData.length,
    uniqueUsers: new Set(rawData.map(d => d.userId)).size,
    avgResponseTime: 0,
    errorRate: 0,
    popularActions: {},
    timeDistribution: {},
    performanceMetrics: {
      p50: 0,
      p95: 0,
      p99: 0
    }
  };

  if (rawData.length === 0) return processed;

  // Calculate average response time
  const responseTimes = rawData
    .filter(d => d.responseTime)
    .map(d => d.responseTime);
  
  if (responseTimes.length > 0) {
    processed.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    // Calculate percentiles
    const sorted = responseTimes.sort((a, b) => a - b);
    processed.performanceMetrics.p50 = sorted[Math.floor(sorted.length * 0.5)];
    processed.performanceMetrics.p95 = sorted[Math.floor(sorted.length * 0.95)];
    processed.performanceMetrics.p99 = sorted[Math.floor(sorted.length * 0.99)];
  }

  // Calculate error rate
  const errors = rawData.filter(d => d.error || d.status >= 400);
  processed.errorRate = errors.length / rawData.length;

  // Popular actions
  rawData.forEach(d => {
    if (d.action) {
      processed.popularActions[d.action] = (processed.popularActions[d.action] || 0) + 1;
    }
  });

  // Time distribution
  rawData.forEach(d => {
    if (d.timestamp) {
      const hour = new Date(d.timestamp).getHours();
      processed.timeDistribution[hour] = (processed.timeDistribution[hour] || 0) + 1;
    }
  });

  return processed;
}

// Memory optimization
function optimizeMemoryUsage(): any {
  const memoryInfo = {
    usedHeap: 0,
    totalHeap: 0,
    heapLimit: 0,
    recommendations: []
  };

  // Simulate memory analysis
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    memoryInfo.usedHeap = memory.usedJSHeapSize;
    memoryInfo.totalHeap = memory.totalJSHeapSize;
    memoryInfo.heapLimit = memory.jsHeapSizeLimit;

    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    if (usagePercent > 80) {
      memoryInfo.recommendations.push('High memory usage detected - consider clearing cache');
    }
    if (usagePercent > 90) {
      memoryInfo.recommendations.push('Critical memory usage - immediate cleanup required');
    }
  }

  return memoryInfo;
}

// Main message handler
self.onmessage = function(e: MessageEvent<WorkerTask>) {
  const { task, data } = e.data;
  let response: WorkerResponse = {};

  try {
    switch (task) {
      case 'compress':
        response.result = compressData(JSON.stringify(data));
        break;

      case 'decompress':
        response.result = JSON.parse(decompressData(data));
        break;

      case 'processAnalytics':
        response.result = processAnalytics(data);
        break;

      case 'optimizeMemory':
        response.result = optimizeMemoryUsage();
        break;

      case 'calculateSimilarity':
        // Simplified similarity calculation for semantic cache
        const { text1, text2 } = data;
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        response.result = intersection.length / union.length;
        break;

      case 'generateEmbedding':
        // Simplified embedding generation (in real implementation, use proper model)
        const text = data.toLowerCase();
        const embedding = new Array(384).fill(0).map(() => Math.random() - 0.5);
        
        // Add some deterministic elements based on text
        for (let i = 0; i < text.length && i < embedding.length; i++) {
          embedding[i] += text.charCodeAt(i) / 1000;
        }
        
        response.result = embedding;
        break;

      default:
        response.error = `Unknown task: ${task}`;
    }
  } catch (error) {
    response.error = error instanceof Error ? error.message : 'Unknown error';
  }

  self.postMessage(response);
};

// Handle worker errors
self.onerror = function(error) {
  console.error('Performance Worker Error:', error);
  self.postMessage({ error: 'Worker error occurred' });
};

export {}; // Make this a module
