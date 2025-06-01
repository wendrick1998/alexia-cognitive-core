/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Componente de feedback ativo do usuário para o sistema multi-LLM
 * Melhorias: Aumento de áreas de toque, feedback visual e acessibilidade
 */

import React, { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

// Tipos de feedback
export type FeedbackRating = 'positive' | 'negative' | null;
export type FeedbackScore = 1 | 2 | 3 | 4 | 5 | null;

// Interface para o contexto da resposta LLM
export interface LLMResponseContext {
  question: string;
  answer: string;
  modelName: string;
  provider: string;
  usedFallback: boolean;
  responseTime: number;
  tokensUsed: number;
  timestamp: Date;
  sessionId: string;
  userId: string;
}

// Props do componente
interface FeedbackSystemProps {
  context: LLMResponseContext;
  onFeedbackSubmitted?: (rating: FeedbackRating, score: FeedbackScore) => void;
  className?: string;
}

/**
 * Componente de feedback para respostas de LLM
 */
export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  context,
  onFeedbackSubmitted,
  className = '',
}) => {
  // Estado para controlar o feedback do usuário
  const [rating, setRating] = useState<FeedbackRating>(null);
  const [score, setScore] = useState<FeedbackScore>(null);
  const [showScoreOptions, setShowScoreOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  
  const { toast } = useToast();
  
  // Função para enviar feedback para o Supabase
  const submitFeedback = useCallback(async (finalRating: FeedbackRating, finalScore: FeedbackScore) => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string
      );
      
      // Enviar feedback para o Supabase
      const { error } = await supabase
        .from('llm_feedback')
        .insert({
          rating: finalRating,
          score: finalScore,
          question: context.question,
          answer: context.answer,
          model_name: context.modelName,
          provider: context.provider,
          used_fallback: context.usedFallback,
          response_time: context.responseTime,
          tokens_used: context.tokensUsed,
          timestamp: context.timestamp.toISOString(),
          session_id: context.sessionId,
          user_id: context.userId
        });
      
      if (error) throw error;
      
      // Animar sucesso
      setAnimateSuccess(true);
      
      // Notificar sucesso
      toast({
        title: 'Feedback enviado',
        description: 'Obrigado por ajudar a melhorar o sistema!',
        variant: 'default',
      });
      
      // Chamar callback se fornecido
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(finalRating, finalScore);
      }
      
      // Resetar animação após 600ms
      setTimeout(() => {
        setAnimateSuccess(false);
        setIsSubmitted(true);
      }, 600);
      
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      
      toast({
        title: 'Erro ao enviar feedback',
        description: 'Por favor, tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [context, isSubmitting, isSubmitted, onFeedbackSubmitted, toast]);
  
  // Handler para clique nos botões de thumbs
  const handleRatingClick = useCallback((newRating: FeedbackRating) => {
    if (isSubmitted) return;
    
    setRating(newRating);
    setShowScoreOptions(true);
    
    // Se o usuário não fornecer uma pontuação detalhada em 10 segundos,
    // envie apenas o feedback thumbs up/down
    const timer = setTimeout(() => {
      if (!score) {
        submitFeedback(newRating, null);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [isSubmitted, score, submitFeedback]);
  
  // Handler para clique nas estrelas
  const handleScoreClick = useCallback((newScore: FeedbackScore) => {
    if (isSubmitted || !rating) return;
    
    setScore(newScore);
    submitFeedback(rating, newScore);
  }, [isSubmitted, rating, submitFeedback]);
  
  // Se o feedback já foi enviado, mostrar mensagem de agradecimento
  if (isSubmitted) {
    return (
      <Card className={`w-full max-w-md mx-auto ${className}`}>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Obrigado pelo seu feedback!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`w-full max-w-md mx-auto ${className} ${animateSuccess ? 'feedback-success animate-pulse' : ''}`}>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Esta resposta foi útil?
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <Tooltip content="Útil">
            {/* MELHORADO: Aumentado tamanho do alvo de toque para mobile */}
            <Button
              variant={rating === 'positive' ? 'default' : 'outline'}
              className="w-12 h-12 sm:w-10 sm:h-10 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => handleRatingClick('positive')}
              disabled={isSubmitting}
              aria-label="Feedback positivo"
            >
              <ThumbsUp className="h-5 w-5" />
              <span className="sr-only">Feedback positivo</span>
            </Button>
          </Tooltip>
          
          <Tooltip content="Não útil">
            {/* MELHORADO: Aumentado tamanho do alvo de toque para mobile */}
            <Button
              variant={rating === 'negative' ? 'default' : 'outline'}
              className="w-12 h-12 sm:w-10 sm:h-10 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={() => handleRatingClick('negative')}
              disabled={isSubmitting}
              aria-label="Feedback negativo"
            >
              <ThumbsDown className="h-5 w-5" />
              <span className="sr-only">Feedback negativo</span>
            </Button>
          </Tooltip>
        </div>
        
        {showScoreOptions && (
          <div className="mt-4">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Avalie de 1 a 5 (opcional):
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant={score === value ? 'default' : 'outline'}
                  className="w-10 h-10 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => handleScoreClick(value as FeedbackScore)}
                  disabled={isSubmitting}
                  aria-label={`Avaliação ${value}`}
                >
                  <Star
                    className={`h-4 w-4 ${score && value <= score ? 'fill-current' : ''}`}
                  />
                  <span className="sr-only">Avaliação {value}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center pt-0">
        <p className="text-xs text-muted-foreground">
          Seu feedback ajuda a melhorar as respostas
        </p>
      </CardFooter>
    </Card>
  );
};

export default FeedbackSystem;
