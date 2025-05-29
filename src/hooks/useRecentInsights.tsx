
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Insight {
  id: string;
  title: string;
  content: string;
  type: string;
  confidence: number;
  createdAt: string;
  status: 'pending' | 'viewed' | 'applied';
}

export const useRecentInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchInsights = async () => {
      try {
        setLoading(true);

        const { data } = await supabase
          .from('cognitive_insights')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (data) {
          const formattedInsights = data.map(insight => ({
            id: insight.id,
            title: insight.title,
            content: insight.content,
            type: insight.insight_type,
            confidence: insight.confidence_score || 0.8,
            createdAt: insight.created_at,
            status: insight.status as 'pending' | 'viewed' | 'applied'
          }));
          setInsights(formattedInsights);
        } else {
          // Mock data
          setInsights([
            {
              id: '1',
              title: 'Padrão de Pergunta Identificado',
              content: 'Você frequentemente pergunta sobre desenvolvimento React',
              type: 'pattern',
              confidence: 0.92,
              createdAt: new Date().toISOString(),
              status: 'pending'
            },
            {
              id: '2',
              title: 'Novo Tópico de Interesse',
              content: 'Interesse crescente em inteligência artificial',
              type: 'trend',
              confidence: 0.87,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              status: 'viewed'
            },
            {
              id: '3',
              title: 'Memória Consolidada',
              content: 'Conceitos de TypeScript foram organizados',
              type: 'consolidation',
              confidence: 0.94,
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              status: 'applied'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [user?.id]);

  return { insights, loading };
};
