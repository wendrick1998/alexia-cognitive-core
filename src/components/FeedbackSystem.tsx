
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Star, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FeedbackSystemProps {
  messageId: string;
  question: string;
  answer: string;
  modelName: string;
  provider: string;
  responseTime?: number;
  tokensUsed?: number;
  usedFallback?: boolean;
  sessionId: string;
  className?: string;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  messageId,
  question,
  answer,
  modelName,
  provider,
  responseTime = 0,
  tokensUsed = 0,
  usedFallback = false,
  sessionId,
  className = ''
}) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [score, setScore] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para enviar feedback",
        variant: "destructive",
      });
      return;
    }

    try {
      setFeedback(type);
      
      const feedbackData = {
        rating: type,
        score: type === 'positive' ? 5 : 1,
        question,
        answer,
        model_name: modelName,
        provider,
        used_fallback: usedFallback,
        response_time: responseTime,
        tokens_used: tokensUsed,
        session_id: sessionId,
        user_id: user.id
      };

      const { error } = await supabase
        .from('llm_feedback')
        .insert(feedbackData);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Feedback enviado",
        description: "Obrigado por nos ajudar a melhorar!",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback",
        variant: "destructive",
      });
    }
  };

  const handleStarRating = async (rating: number) => {
    if (!user) return;

    try {
      setScore(rating);
      
      const feedbackData = {
        rating: rating >= 3 ? 'positive' : 'negative',
        score: rating,
        question,
        answer,
        model_name: modelName,
        provider,
        used_fallback: usedFallback,
        response_time: responseTime,
        tokens_used: tokensUsed,
        session_id: sessionId,
        user_id: user.id
      };

      const { error } = await supabase
        .from('llm_feedback')
        .insert(feedbackData);

      if (error) throw error;

      setFeedback(rating >= 3 ? 'positive' : 'negative');
      setSubmitted(true);
      toast({
        title: "Avaliação enviada",
        description: `Você avaliou com ${rating} estrelas`,
      });
    } catch (error) {
      console.error('Error submitting star rating:', error);
    }
  };

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className="badge-success">
          Feedback enviado
        </Badge>
        {feedback === 'positive' ? (
          <ThumbsUp className="w-4 h-4 text-green-500" />
        ) : (
          <ThumbsDown className="w-4 h-4 text-red-500" />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Feedback simples - Thumbs */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/60">Esta resposta foi útil?</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback('positive')}
            className="h-8 w-8 p-0 hover:bg-green-500/20 focus-ring"
            disabled={submitted}
          >
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFeedback('negative')}
            className="h-8 w-8 p-0 hover:bg-red-500/20 focus-ring"
            disabled={submitted}
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Avaliação por estrelas (opcional) */}
      {showDetails && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Avalie de 1 a 5:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="ghost"
                size="sm"
                onClick={() => handleStarRating(rating)}
                className="h-6 w-6 p-0 hover:bg-yellow-500/20"
                disabled={submitted}
              >
                <Star 
                  className={`w-3 h-3 ${
                    rating <= score 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-white/40'
                  }`} 
                />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Botão para mostrar mais opções */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-white/40 hover:text-white/60 h-6 px-2"
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        {showDetails ? 'Menos opções' : 'Mais opções'}
      </Button>
    </div>
  );
};

export default FeedbackSystem;
