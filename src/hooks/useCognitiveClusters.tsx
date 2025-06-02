
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemoryFeedback } from '@/hooks/useMemoryFeedback';

export interface CognitiveClusterWithFeedback {
  id: string;
  cluster_type: string;
  member_nodes: string[];
  centroid_embedding: number[];
  density_score: number;
  coherence_score: number;
  created_at: string;
  nodes_with_feedback: Array<{
    node_id: string;
    content: string;
    dominant_confidence: string;
    feedback_count: number;
  }>;
  cluster_confidence_score: number;
  needs_validation: boolean;
}

export function useCognitiveClusters() {
  const { user } = useAuth();
  const { getFeedbackSummary } = useMemoryFeedback();
  const [clusters, setClusters] = useState<CognitiveClusterWithFeedback[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClustersWithFeedback = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar clusters
      const { data: clustersData, error: clustersError } = await supabase
        .from('cognitive_clusters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clustersError) throw clustersError;

      const clustersWithFeedback: CognitiveClusterWithFeedback[] = [];

      for (const cluster of clustersData || []) {
        const nodesWithFeedback = [];
        let totalConfidenceScore = 0;
        let validatedNodes = 0;

        // Para cada nó no cluster, buscar feedback
        for (const nodeId of cluster.member_nodes) {
          const { data: nodeData, error: nodeError } = await supabase
            .from('cognitive_nodes')
            .select('content')
            .eq('id', nodeId)
            .single();

          if (nodeError) continue;

          const feedbackSummary = await getFeedbackSummary(nodeId);
          
          let dominantConfidence = 'sem_feedback';
          let maxCount = 0;
          let totalFeedback = 0;

          feedbackSummary.forEach(feedback => {
            totalFeedback += feedback.count;
            if (feedback.count > maxCount) {
              maxCount = feedback.count;
              dominantConfidence = feedback.confidence_level;
            }
          });

          // Calcular score de confiança para este nó
          if (totalFeedback > 0) {
            validatedNodes++;
            switch (dominantConfidence) {
              case 'confirmado':
                totalConfidenceScore += 1.0;
                break;
              case 'provavel':
                totalConfidenceScore += 0.7;
                break;
              case 'incerto':
                totalConfidenceScore += 0.3;
                break;
              case 'rejeitado':
                totalConfidenceScore += 0.0;
                break;
            }
          }

          nodesWithFeedback.push({
            node_id: nodeId,
            content: nodeData?.content || '',
            dominant_confidence: dominantConfidence,
            feedback_count: totalFeedback
          });
        }

        const clusterConfidenceScore = validatedNodes > 0 
          ? (totalConfidenceScore / validatedNodes) * 100 
          : 0;

        const needsValidation = validatedNodes < cluster.member_nodes.length * 0.5; // Menos de 50% validado

        clustersWithFeedback.push({
          ...cluster,
          nodes_with_feedback: nodesWithFeedback,
          cluster_confidence_score: Math.round(clusterConfidenceScore),
          needs_validation: needsValidation
        });
      }

      setClusters(clustersWithFeedback);
    } catch (error) {
      console.error('Erro ao carregar clusters com feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getFeedbackSummary]);

  const getClustersNeedingValidation = useCallback(() => {
    return clusters.filter(cluster => cluster.needs_validation);
  }, [clusters]);

  const getClustersByConfidence = useCallback((minConfidence: number) => {
    return clusters.filter(cluster => cluster.cluster_confidence_score >= minConfidence);
  }, [clusters]);

  useEffect(() => {
    if (user) {
      loadClustersWithFeedback();
    }
  }, [user, loadClustersWithFeedback]);

  return {
    clusters,
    loading,
    loadClustersWithFeedback,
    getClustersNeedingValidation,
    getClustersByConfidence
  };
}
