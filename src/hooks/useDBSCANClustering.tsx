
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ClusterNode {
  id: string;
  content: string;
  title?: string;
  node_type: string;
  cluster_id: number;
  is_core_point: boolean;
  density: number;
  neighbors: string[];
}

export interface Cluster {
  id: number;
  core_points: number;
  border_points: number;
  total_points: number;
  centroid: string;
  topics: string[];
  density_score: number;
  coherence_score: number;
}

export interface ClusteringMetrics {
  total_clusters: number;
  noise_points: number;
  silhouette_score: number;
  execution_time: number;
  parameters: {
    eps: number;
    min_points: number;
  };
}

export function useDBSCANClustering() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [clusterNodes, setClusterNodes] = useState<ClusterNode[]>([]);
  const [metrics, setMetrics] = useState<ClusteringMetrics | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Run DBSCAN clustering on cognitive nodes
  const runDBSCANClustering = useCallback(async (
    eps: number = 0.3,
    minPoints: number = 3,
    useEmbeddings: boolean = true
  ): Promise<void> => {
    if (!user) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      console.log('🔬 Running DBSCAN clustering:', { eps, minPoints, useEmbeddings });

      // Execute clustering via edge function
      const { data, error } = await supabase.functions.invoke('cognitive-search', {
        body: {
          command: 'dbscan_clustering',
          userId: user.id,
          parameters: {
            eps,
            min_points: minPoints, // Fixed: using min_points instead of minPoints
            useEmbeddings,
            distanceMetric: 'cosine'
          }
        }
      });

      if (error) throw error;

      const executionTime = Date.now() - startTime;
      
      // Update state with clustering results
      setClusters(data.clusters || []);
      setClusterNodes(data.clusterNodes || []);
      
      setMetrics({
        total_clusters: data.totalClusters || 0,
        noise_points: data.noisePoints || 0,
        silhouette_score: data.silhouetteScore || 0,
        execution_time: executionTime,
        parameters: { eps, min_points: minPoints } // Fixed: using min_points
      });

      console.log(`✅ DBSCAN completed: ${data.totalClusters} clusters in ${executionTime}ms`);

    } catch (error) {
      console.error('❌ DBSCAN clustering error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Get cluster details
  const getClusterDetails = useCallback(async (clusterId: number): Promise<ClusterNode[]> => {
    if (!user) return [];

    try {
      const clusterNodesFiltered = clusterNodes.filter(node => node.cluster_id === clusterId);
      
      // Get additional details from database
      const nodeIds = clusterNodesFiltered.map(node => node.id);
      
      const { data, error } = await supabase
        .from('cognitive_nodes')
        .select('*')
        .eq('user_id', user.id)
        .in('id', nodeIds);

      if (error) throw error;

      // Enhance cluster nodes with full data
      const enhancedNodes: ClusterNode[] = clusterNodesFiltered.map(clusterNode => {
        const fullNode = data?.find(node => node.id === clusterNode.id);
        return {
          ...clusterNode,
          content: fullNode?.content || clusterNode.content,
          title: fullNode?.title || clusterNode.title,
          node_type: fullNode?.node_type || clusterNode.node_type
        };
      });

      return enhancedNodes;

    } catch (error) {
      console.error('❌ Error getting cluster details:', error);
      return [];
    }
  }, [user, clusterNodes]);

  // Find similar clusters
  const findSimilarClusters = useCallback(async (
    clusterId: number,
    threshold: number = 0.7
  ): Promise<number[]> => {
    if (!user) return [];

    try {
      console.log('🔍 Finding similar clusters for:', clusterId);

      const { data, error } = await supabase.functions.invoke('cognitive-search', {
        body: {
          command: 'find_similar_clusters',
          userId: user.id,
          clusterId,
          threshold
        }
      });

      if (error) throw error;

      return data.similarClusters || [];

    } catch (error) {
      console.error('❌ Error finding similar clusters:', error);
      return [];
    }
  }, [user]);

  // Adaptive clustering that adjusts parameters automatically
  const adaptiveClustering = useCallback(async (): Promise<void> => {
    if (!user) return;

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      console.log('🤖 Running adaptive DBSCAN clustering...');

      // Try different parameter combinations
      const parameterSets = [
        { eps: 0.2, minPoints: 2 },
        { eps: 0.3, minPoints: 3 },
        { eps: 0.4, minPoints: 4 },
        { eps: 0.5, minPoints: 5 }
      ];

      let bestResult = null;
      let bestScore = -1;

      for (const params of parameterSets) {
        const { data, error } = await supabase.functions.invoke('cognitive-search', {
          body: {
            command: 'dbscan_clustering',
            userId: user.id,
            parameters: {
              ...params,
              useEmbeddings: true,
              distanceMetric: 'cosine'
            }
          }
        });

        if (!error && data.silhouetteScore > bestScore) {
          bestScore = data.silhouetteScore;
          bestResult = { data, params };
        }
      }

      if (bestResult) {
        const executionTime = Date.now() - startTime;
        
        setClusters(bestResult.data.clusters || []);
        setClusterNodes(bestResult.data.clusterNodes || []);
        
        setMetrics({
          total_clusters: bestResult.data.totalClusters || 0,
          noise_points: bestResult.data.noisePoints || 0,
          silhouette_score: bestResult.data.silhouetteScore || 0,
          execution_time: executionTime,
          parameters: bestResult.params
        });

        console.log(`✅ Adaptive clustering completed: ${bestResult.data.totalClusters} clusters with score ${bestScore}`);
      }

    } catch (error) {
      console.error('❌ Adaptive clustering error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Get cluster topics using LDA-like analysis
  const extractClusterTopics = useCallback(async (
    clusterId: number,
    numTopics: number = 3
  ): Promise<string[]> => {
    if (!user) return [];

    try {
      const clusterNodesFiltered = clusterNodes.filter(node => node.cluster_id === clusterId);
      
      if (clusterNodesFiltered.length === 0) return [];

      // Extract most frequent meaningful terms
      const allText = clusterNodesFiltered
        .map(node => `${node.title || ''} ${node.content}`)
        .join(' ')
        .toLowerCase();

      // Simple term frequency analysis
      const words = allText
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);

      const wordFreq = new Map<string, number>();
      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });

      // Get top terms
      const topTerms = Array.from(wordFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, numTopics)
        .map(([word]) => word);

      return topTerms;

    } catch (error) {
      console.error('❌ Error extracting cluster topics:', error);
      return [];
    }
  }, [clusterNodes]);

  return {
    // Clustering functions
    runDBSCANClustering,
    adaptiveClustering,
    getClusterDetails,
    findSimilarClusters,
    extractClusterTopics,
    
    // State
    clusters,
    clusterNodes,
    metrics,
    isProcessing
  };
}
