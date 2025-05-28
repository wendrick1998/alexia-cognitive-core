
// Performance Worker for heavy computations
self.onmessage = function(event) {
  const { task, data } = event.data;
  
  try {
    let result;
    
    switch (task) {
      case 'compress':
        result = compressData(data);
        break;
        
      case 'decompress':
        result = decompressData(data);
        break;
        
      case 'sort_large_dataset':
        result = sortLargeDataset(data);
        break;
        
      case 'compute_similarity':
        result = computeSimilarity(data.vector1, data.vector2);
        break;
        
      case 'process_embeddings':
        result = processEmbeddings(data.embeddings);
        break;
        
      case 'analyze_patterns':
        result = analyzePatterns(data.dataset);
        break;
        
      default:
        throw new Error(`Unknown task: ${task}`);
    }
    
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};

// LZ77-like compression algorithm
function compressData(data: any): string {
  const jsonString = JSON.stringify(data);
  const compressed = [];
  let i = 0;
  
  while (i < jsonString.length) {
    let match = '';
    let matchLength = 0;
    let matchDistance = 0;
    
    // Look for matches in the previous 255 characters
    for (let j = Math.max(0, i - 255); j < i; j++) {
      let length = 0;
      while (
        j + length < i &&
        i + length < jsonString.length &&
        jsonString[j + length] === jsonString[i + length] &&
        length < 255
      ) {
        length++;
      }
      
      if (length > matchLength) {
        matchLength = length;
        matchDistance = i - j;
        match = jsonString.substring(i, i + length);
      }
    }
    
    if (matchLength > 3) {
      compressed.push([matchDistance, matchLength]);
      i += matchLength;
    } else {
      compressed.push(jsonString[i]);
      i++;
    }
  }
  
  return JSON.stringify(compressed);
}

function decompressData(compressedString: string): any {
  const compressed = JSON.parse(compressedString);
  let result = '';
  
  for (const item of compressed) {
    if (Array.isArray(item)) {
      const [distance, length] = item;
      const start = result.length - distance;
      for (let i = 0; i < length; i++) {
        result += result[start + i];
      }
    } else {
      result += item;
    }
  }
  
  return JSON.parse(result);
}

// Optimized sorting for large datasets
function sortLargeDataset(data: any[]): any[] {
  if (data.length < 1000) {
    return data.sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return String(a).localeCompare(String(b));
    });
  }
  
  // Use merge sort for large datasets
  return mergeSort(data);
}

function mergeSort(arr: any[]): any[] {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left: any[], right: any[]): any[] {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  
  while (leftIndex < left.length && rightIndex < right.length) {
    const leftVal = left[leftIndex];
    const rightVal = right[rightIndex];
    
    let comparison;
    if (typeof leftVal === 'number' && typeof rightVal === 'number') {
      comparison = leftVal - rightVal;
    } else {
      comparison = String(leftVal).localeCompare(String(rightVal));
    }
    
    if (comparison <= 0) {
      result.push(leftVal);
      leftIndex++;
    } else {
      result.push(rightVal);
      rightIndex++;
    }
  }
  
  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

// Vector similarity computation
function computeSimilarity(vector1: number[], vector2: number[]): number {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    norm1 += vector1[i] * vector1[i];
    norm2 += vector2[i] * vector2[i];
  }
  
  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// Process embeddings for clustering
function processEmbeddings(embeddings: number[][]): any {
  const clusters: number[][] = [];
  const processed = embeddings.map((embedding, index) => ({
    id: index,
    vector: embedding,
    cluster: -1
  }));
  
  // Simple k-means clustering
  const k = Math.min(10, Math.ceil(embeddings.length / 20));
  
  // Initialize centroids
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * embeddings.length);
    centroids.push([...embeddings[randomIndex]]);
  }
  
  // Iterate until convergence
  for (let iteration = 0; iteration < 100; iteration++) {
    let changed = false;
    
    // Assign points to clusters
    for (const point of processed) {
      let bestCluster = 0;
      let bestDistance = Infinity;
      
      for (let i = 0; i < centroids.length; i++) {
        const distance = euclideanDistance(point.vector, centroids[i]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestCluster = i;
        }
      }
      
      if (point.cluster !== bestCluster) {
        point.cluster = bestCluster;
        changed = true;
      }
    }
    
    if (!changed) break;
    
    // Update centroids
    for (let i = 0; i < centroids.length; i++) {
      const clusterPoints = processed.filter(p => p.cluster === i);
      if (clusterPoints.length > 0) {
        for (let j = 0; j < centroids[i].length; j++) {
          centroids[i][j] = clusterPoints.reduce((sum, p) => sum + p.vector[j], 0) / clusterPoints.length;
        }
      }
    }
  }
  
  return {
    clusters: processed.reduce((acc, point) => {
      if (!acc[point.cluster]) acc[point.cluster] = [];
      acc[point.cluster].push(point.id);
      return acc;
    }, {} as Record<number, number[]>),
    centroids
  };
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

// Pattern analysis
function analyzePatterns(dataset: any[]): any {
  const patterns = {
    frequency: new Map<string, number>(),
    sequences: new Map<string, number>(),
    anomalies: []
  };
  
  // Frequency analysis
  for (const item of dataset) {
    const key = typeof item === 'object' ? JSON.stringify(item) : String(item);
    patterns.frequency.set(key, (patterns.frequency.get(key) || 0) + 1);
  }
  
  // Sequence analysis (for arrays)
  if (dataset.length > 1) {
    for (let i = 0; i < dataset.length - 1; i++) {
      const sequence = `${dataset[i]} -> ${dataset[i + 1]}`;
      patterns.sequences.set(sequence, (patterns.sequences.get(sequence) || 0) + 1);
    }
  }
  
  // Simple anomaly detection (items with very low frequency)
  const avgFrequency = Array.from(patterns.frequency.values()).reduce((a, b) => a + b, 0) / patterns.frequency.size;
  const threshold = avgFrequency * 0.1;
  
  for (const [item, freq] of patterns.frequency) {
    if (freq < threshold) {
      patterns.anomalies.push({ item, frequency: freq });
    }
  }
  
  return {
    mostFrequent: Array.from(patterns.frequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10),
    commonSequences: Array.from(patterns.sequences.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10),
    anomalies: patterns.anomalies.slice(0, 10)
  };
}

export {};
