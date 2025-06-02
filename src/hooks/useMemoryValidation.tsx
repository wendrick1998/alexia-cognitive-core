
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMemoryFeedback } from '@/hooks/useMemoryFeedback';
import { useMemories } from '@/hooks/useMemories';

export interface ValidationStats {
  totalMemories: number;
  confirmedMemories: number;
  probableMemories: number;
  uncertainMemories: number;
  rejectedMemories: number;
  validationProgress: number;
  confidenceScore: number;
}

export interface MemoryWithValidation {
  id: string;
  content: string;
  type: string;
  created_at: string;
  feedbackSummary: Array<{ confidence_level: string; count: number }>;
  dominantConfidence: string;
  needsValidation: boolean;
}

export function useMemoryValidation() {
  const { user } = useAuth();
  const { memories, loading: memoriesLoading, fetchMemories } = useMemories();
  const { getFeedbackSummary } = useMemoryFeedback();
  
  const [validationStats, setValidationStats] = useState<ValidationStats>({
    totalMemories: 0,
    confirmedMemories: 0,
    probableMemories: 0,
    uncertainMemories: 0,
    rejectedMemories: 0,
    validationProgress: 0,
    confidenceScore: 0
  });

  const [memoriesWithValidation, setMemoriesWithValidation] = useState<MemoryWithValidation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMemoriesWithValidation = useCallback(async () => {
    if (!user || memoriesLoading) return;

    setLoading(true);
    try {
      const memoriesWithFeedback: MemoryWithValidation[] = [];
      
      for (const memory of memories) {
        const feedbackSummary = await getFeedbackSummary(memory.id);
        
        // Determinar confiança dominante
        let dominantConfidence = 'sem_feedback';
        let maxCount = 0;
        
        feedbackSummary.forEach(feedback => {
          if (feedback.count > maxCount) {
            maxCount = feedback.count;
            dominantConfidence = feedback.confidence_level;
          }
        });

        memoriesWithFeedback.push({
          id: memory.id,
          content: memory.content,
          type: memory.type,
          created_at: memory.created_at,
          feedbackSummary,
          dominantConfidence,
          needsValidation: feedbackSummary.length === 0 || dominantConfidence === 'incerto'
        });
      }

      setMemoriesWithValidation(memoriesWithFeedback);
      
      // Calcular estatísticas
      const stats = calculateValidationStats(memoriesWithFeedback);
      setValidationStats(stats);
      
    } catch (error) {
      console.error('Erro ao carregar memórias com validação:', error);
    } finally {
      setLoading(false);
    }
  }, [user, memories, memoriesLoading, getFeedbackSummary]);

  const calculateValidationStats = useCallback((memoriesData: MemoryWithValidation[]): ValidationStats => {
    const total = memoriesData.length;
    let confirmed = 0;
    let probable = 0;
    let uncertain = 0;
    let rejected = 0;
    let hasValidation = 0;

    memoriesData.forEach(memory => {
      if (memory.feedbackSummary.length > 0) {
        hasValidation++;
        switch (memory.dominantConfidence) {
          case 'confirmado':
            confirmed++;
            break;
          case 'provavel':
            probable++;
            break;
          case 'incerto':
            uncertain++;
            break;
          case 'rejeitado':
            rejected++;
            break;
        }
      }
    });

    const validationProgress = total > 0 ? (hasValidation / total) * 100 : 0;
    
    // Score de confiança baseado na distribuição de feedback
    const confidenceScore = total > 0 
      ? ((confirmed * 1.0 + probable * 0.7 + uncertain * 0.3) / total) * 100
      : 0;

    return {
      totalMemories: total,
      confirmedMemories: confirmed,
      probableMemories: probable,
      uncertainMemories: uncertain,
      rejectedMemories: rejected,
      validationProgress: Math.round(validationProgress),
      confidenceScore: Math.round(confidenceScore)
    };
  }, []);

  const getMemoriesNeedingValidation = useCallback(() => {
    return memoriesWithValidation.filter(memory => memory.needsValidation);
  }, [memoriesWithValidation]);

  const getMemoriesByConfidence = useCallback((confidence: string) => {
    return memoriesWithValidation.filter(memory => memory.dominantConfidence === confidence);
  }, [memoriesWithValidation]);

  useEffect(() => {
    if (memories.length > 0) {
      loadMemoriesWithValidation();
    }
  }, [memories, loadMemoriesWithValidation]);

  return {
    loading,
    validationStats,
    memoriesWithValidation,
    getMemoriesNeedingValidation,
    getMemoriesByConfidence,
    loadMemoriesWithValidation
  };
}
