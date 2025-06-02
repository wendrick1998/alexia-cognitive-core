import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ClusterPoint {
  id: string;
  coordinates: number[];
  content: string;
  title?: string;
  metadata: any;
  cluster?: number;
  isCore?: boolean;
  isNoise?: boolean;
}

export interface Cluster {
  id: number;
  points: ClusterPoint[];
  centroid: number[];
  density: number;
  cohesion: number;
  separation: number;
  silhouetteScore: number;
  topics: string[];
}

export interface ClusteringMetrics {
  totalPoints: number;
  totalClusters: number;
  noisePoints: number;
  avgClusterSize: number;
  silhouetteScore: number;
  dunnIndex: number;
  processingTime: number;
}

export interface DBSCANParams {
  epsilon: number;
  minPoints: number;
  distanceMetric: 'euclidean' | 'cosine' | 'manhattan';
  dimensionality: number;
}

export function useDBSCANClustering() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [metrics, setMetrics] = useState<ClusteringMetrics>({
    totalPoints: 0,
    totalClusters: 0,
    noisePoints: 0,
    avgClusterSize: 0,
    silhouetteScore: 0,
    dunnIndex: 0,
    processingTime: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const pointsCache = useRef<Map<string, ClusterPoint>>(new Map());
  const distanceCache = useRef<Map<string, number>>(new Map());

  // Distance calculation functions
  const calculateDistance = useCallback((
    point1: number[],
    point2: number[],
    metric: 'euclidean' | 'cosine' | 'manhattan' = 'euclidean'
  ): number => {
    const cacheKey = `${point1.join(',')}_${point2.join(',')}_${metric}`;
    
    if (distanceCache.current.has(cacheKey)) {
      return distanceCache.current.get(cacheKey)!;
    }

    let distance = 0;

    switch (metric) {
      case 'euclidean':
        distance = Math.sqrt(
          point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
        );
        break;
      
      case 'cosine':
        const dotProduct = point1.reduce((sum, val, i) => sum + val * point2[i], 0);
        const magnitude1 = Math.sqrt(point1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(point2.reduce((sum, val) => sum + val * val, 0));
        distance = 1 - (dotProduct / (magnitude1 * magnitude2));
        break;
      
      case 'manhattan':
        distance = point1.reduce((sum, val, i) => sum + Math.abs(val - point2[i]), 0);
        break;
    }

    distanceCache.current.set(cacheKey, distance);
    return distance;
  }, []);

  // Find neighbors within epsilon distance
  const findNeighbors = useCallback((
    point: ClusterPoint,
    points: ClusterPoint[],
    epsilon: number,
    metric: 'euclidean' | 'cosine' | 'manhattan'
  ): ClusterPoint[] => {
    return points.filter(otherPoint => {
      if (point.id === otherPoint.id) return false;
      return calculateDistance(point.coordinates, otherPoint.coordinates, metric) <= epsilon;
    });
  }, [calculateDistance]);

  // DBSCAN clustering algorithm
  const runDBSCANClustering = useCallback(async (
    points: ClusterPoint[],
    params: Partial<DBSCANParams> = {}
  ): Promise<Cluster[]> => {
    const startTime = performance.now();
    setIsProcessing(true);

    try {
      const {
        epsilon = 0.5,
        minPoints = 5,
        distanceMetric = 'euclidean'
      } = params;

      console.log('🔬 Running DBSCAN clustering...', { epsilon, minPoints, distanceMetric });

      // Clear cache for new clustering
      distanceCache.current.clear();

      // Initialize all points as unvisited
      const processedPoints = points.map(p => ({ ...p, cluster: undefined, isCore: false, isNoise: false }));
      const visited = new Set<string>();
      let currentClusterId = 0;
      const clustersMap = new Map<number, ClusterPoint[]>();

      // Main DBSCAN algorithm
      for (const point of processedPoints) {
        if (visited.has(point.id)) continue;
        
        visited.add(point.id);
        const neighbors = findNeighbors(point, processedPoints, epsilon, distanceMetric);

        if (neighbors.length < minPoints) {
          // Mark as noise
          point.isNoise = true;
        } else {
          // Start new cluster
          point.isCore = true;
          point.cluster = currentClusterId;
          
          if (!clustersMap.has(currentClusterId)) {
            clustersMap.set(currentClusterId, []);
          }
          clustersMap.get(currentClusterId)!.push(point);

          // Expand cluster
          const queue = [...neighbors];
          
          while (queue.length > 0) {
            const neighbor = queue.shift()!;
            
            if (!visited.has(neighbor.id)) {
              visited.add(neighbor.id);
              const neighborNeighbors = findNeighbors(neighbor, processedPoints, epsilon, distanceMetric);
              
              if (neighborNeighbors.length >= minPoints) {
                neighbor.isCore = true;
                queue.push(...neighborNeighbors);
              }
            }

            if (neighbor.cluster === undefined) {
              neighbor.cluster = currentClusterId;
              neighbor.isNoise = false;
              clustersMap.get(currentClusterId)!.push(neighbor);
            }
          }

          currentClusterId++;
        }
      }

      // Build cluster objects with metrics
      const clusters: Cluster[] = [];
      
      for (const [clusterId, clusterPoints] of clustersMap) {
        const centroid = calculateCentroid(clusterPoints);
        const density = calculateClusterDensity(clusterPoints, epsilon, distanceMetric);
        const cohesion = calculateCohesion(clusterPoints, centroid, distanceMetric);
        const topics = extractClusterTopics(clusterPoints);

        clusters.push({
          id: clusterId,
          points: clusterPoints,
          centroid,
          density,
          cohesion,
          separation: 0, // Will be calculated later
          silhouetteScore: 0, // Will be calculated later
          topics
        });
      }

      // Calculate separation and silhouette scores
      clusters.forEach(cluster => {
        cluster.separation = calculateSeparation(cluster, clusters, distanceMetric);
        cluster.silhouetteScore = calculateSilhouetteScore(cluster, clusters, distanceMetric);
      });

      // Calculate overall metrics
      const noisePoints = processedPoints.filter(p => p.isNoise).length;
      const avgClusterSize = clusters.length > 0 ? clusters.reduce((sum, c) => sum + c.points.length, 0) / clusters.length : 0;
      const overallSilhouetteScore = clusters.length > 0 ? clusters.reduce((sum, c) => sum + c.silhouetteScore, 0) / clusters.length : 0;
      const dunnIndex = calculateDunnIndex(clusters, distanceMetric);
      const processingTime = performance.now() - startTime;

      setMetrics({
        totalPoints: points.length,
        totalClusters: clusters.length,
        noisePoints,
        avgClusterSize,
        silhouetteScore: overallSilhouetteScore,
        dunnIndex,
        processingTime
      });

      setClusters(clusters);
      
      console.log(`✅ DBSCAN completed: ${clusters.length} clusters, ${noisePoints} noise points in ${processingTime.toFixed(2)}ms`);
      return clusters;

    } catch (error) {
      console.error('❌ Error in DBSCAN clustering:', error);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [findNeighbors, calculateDistance]);

  // Calculate cluster centroid
  const calculateCentroid = useCallback((points: ClusterPoint[]): number[] => {
    if (points.length === 0) return [];
    
    const dimensions = points[0].coordinates.length;
    const centroid = new Array(dimensions).fill(0);
    
    points.forEach(point => {
      point.coordinates.forEach((coord, i) => {
        centroid[i] += coord;
      });
    });
    
    return centroid.map(sum => sum / points.length);
  }, []);

  // Calculate cluster density
  const calculateClusterDensity = useCallback((
    points: ClusterPoint[],
    epsilon: number,
    metric: 'euclidean' | 'cosine' | 'manhattan'
  ): number => {
    if (points.length <= 1) return 0;
    
    let totalConnections = 0;
    
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = calculateDistance(points[i].coordinates, points[j].coordinates, metric);
        if (distance <= epsilon) {
          totalConnections++;
        }
      }
    }
    
    const maxPossibleConnections = (points.length * (points.length - 1)) / 2;
    return maxPossibleConnections > 0 ? totalConnections / maxPossibleConnections : 0;
  }, [calculateDistance]);

  // Calculate cluster cohesion
  const calculateCohesion = useCallback((
    points: ClusterPoint[],
    centroid: number[],
    metric: 'euclidean' | 'cosine' | 'manhattan'
  ): number => {
    if (points.length === 0) return 0;
    
    const totalDistance = points.reduce((sum, point) => {
      return sum + calculateDistance(point.coordinates, centroid, metric);
    }, 0);
    
    return points.length > 0 ? totalDistance / points.length : 0;
  }, [calculateDistance]);

  // Calculate separation between clusters
  const calculateSeparation = useCallback((
    cluster: Cluster,
    allClusters: Cluster[],
    metric: 'euclidean' | 'cosine' | 'manhattan'
  ): number => {
    const otherClusters = allClusters.filter(c => c.id !== cluster.id);
    if (otherClusters.length === 0) return 0;
    
    let minDistance = Infinity;
    
    otherClusters.forEach(otherCluster => {
      const distance = calculateDistance(cluster.centroid, otherCluster.centroid, metric);
      minDistance = Math.min(minDistance, distance);
    });
    
    return minDistance === Infinity ? 0 : minDistance;
  }, [calculateDistance]);

  // Calculate silhouette score
  const calculateSilhouetteScore = useCallback((
    cluster: Cluster,
    allClusters: Cluster[],
    metric: 'euclidean' | 'cosine' | 'manhattan'
  ): number => {
    if (cluster.points.length <= 1) return 0;
    
    let totalScore = 0;
    
    cluster.points.forEach(point => {
      // Calculate average distance to points in same cluster (cohesion)
      const intraClusterDistances = cluster.points
        .filter(p => p.id !== point.id)
        .map(p => calculateDistance(point.coordinates, p.coordinates, metric));
      
      const avgIntraDistance = intraClusterDistances.length > 0 
        ? intraClusterDistances.reduce((sum, d) => sum + d, 0) / intraClusterDistances.length 
        : 0;
      
      // Calculate minimum average distance to points in other clusters
      let minAvgInterDistance = Infinity;
      
      allClusters.forEach(otherCluster => {
        if (otherCluster.id !== cluster.id) {
          const interDistances = otherCluster.points
            .map(p => calculateDistance(point.coordinates, p.coordinates, metric));
          
          const avgInterDistance = interDistances.length > 0
            ? interDistances.reduce((sum, d) => sum + d, 0) / interDistances.length
            : 0;
          
          minAvgInterDistance = Math.min(minAvgInterDistance, avgInterDistance);
        }
      });
      
      // Calculate silhouette score for this point
      const silhouette = minAvgInterDistance === Infinity ? 0 :
        (minAvgInterDistance - avgIntraDistance) / Math.max(avgIntraDistance, minAvgInterDistance);
      
      totalScore += silhouette;
    });
    
    return cluster.points.length > 0 ? totalScore / cluster.points.length : 0;
  }, [calculateDistance]);

  // Calculate Dunn Index
  const calculateDunnIndex = useCallback((
    clusters: Cluster[],
    metric: 'euclidean' | 'cosine' | 'manhattan'
  ): number => {
    if (clusters.length <= 1) return 0;
    
    // Find minimum inter-cluster distance
    let minInterDistance = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const distance = calculateDistance(clusters[i].centroid, clusters[j].centroid, metric);
        minInterDistance = Math.min(minInterDistance, distance);
      }
    }
    
    // Find maximum intra-cluster distance
    let maxIntraDistance = 0;
    clusters.forEach(cluster => {
      cluster.points.forEach(point => {
        const distance = calculateDistance(point.coordinates, cluster.centroid, metric);
        maxIntraDistance = Math.max(maxIntraDistance, distance);
      });
    });
    
    return maxIntraDistance > 0 ? minInterDistance / maxIntraDistance : 0;
  }, [calculateDistance]);

  // Extract topics from cluster
  const extractClusterTopics = useCallback((points: ClusterPoint[]): string[] => {
    const allWords = points.flatMap(point => {
      const text = (point.content + ' ' + (point.title || '')).toLowerCase();
      return text.split(/\s+/).filter(word => word.length > 3);
    });
    
    const wordCounts = new Map<string, number>();
    allWords.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
    
    return Array.from(wordCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }, []);

  // Convert cognitive nodes to cluster points
  const convertNodesToPoints = useCallback(async (): Promise<ClusterPoint[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('id, content, title, embedding_general, metadata')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('embedding_general', 'is', null);

      if (error) throw error;

      return (data || []).map(node => ({
        id: node.id,
        coordinates: node.embedding_general || [],
        content: node.content || '',
        title: node.title,
        metadata: node.metadata || {}
      }));
    } catch (error) {
      console.error('❌ Error converting nodes to points:', error);
      return [];
    }
  }, [user]);

  // Visualize clusters
  const visualizeClusters = useCallback(async (clusters: Cluster[]): Promise<void> => {
    // Implement visualization logic here
    console.log('Visualizing clusters:', clusters);
  }, []);

  // Export clusters
  const exportClusters = useCallback(async (clusters: Cluster[]): Promise<void> => {
    // Implement export logic here
    console.log('Exporting clusters:', clusters);
  }, []);

  // Reset clustering
  const resetClustering = useCallback(() => {
    setClusters([]);
    setMetrics({
      totalPoints: 0,
      totalClusters: 0,
      noisePoints: 0,
      avgClusterSize: 0,
      silhouetteScore: 0,
      dunnIndex: 0,
      processingTime: 0
    });
  }, []);

  return {
    runDBSCANClustering,
    clusters,
    metrics,
    isProcessing,
    visualizeClusters,
    exportClusters,
    resetClustering
  };
}
