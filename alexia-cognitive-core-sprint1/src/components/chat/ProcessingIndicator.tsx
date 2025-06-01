
import { Sparkles } from 'lucide-react';

interface ProcessingIndicatorProps {
  isVisible: boolean;
}

const ProcessingIndicator = ({ isVisible }: ProcessingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass-card px-4 py-2 rounded-xl">
        <div className="flex items-center gap-3 text-white/80">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-sm">Processando...</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
