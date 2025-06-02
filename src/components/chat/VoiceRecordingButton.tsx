
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface VoiceRecordingButtonProps {
  disabled: boolean;
  onRecordingToggle: (isRecording: boolean) => void;
}

const VoiceRecordingButton = ({ disabled, onRecordingToggle }: VoiceRecordingButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const { hapticFeedback } = useMobileOptimization();

  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      hapticFeedback('heavy');
      onRecordingToggle(false);
    } else {
      setIsRecording(true);
      hapticFeedback('heavy');
      onRecordingToggle(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleVoiceRecording();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleVoiceRecording}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={isRecording ? 'Parar gravação de voz' : 'Iniciar gravação de voz'}
      aria-pressed={isRecording}
      role="button"
      tabIndex={0}
      className={cn(
        "flex-shrink-0 touch-target-48 rounded-xl transition-all duration-200",
        "btn-accessible focus-ring-enhanced",
        "touch-manipulation",
        isRecording 
          ? "bg-red-500 text-white hover:bg-red-600" 
          : "text-white/60 hover:text-white hover:bg-white/10",
        disabled && "btn-state-disabled"
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {isRecording ? (
        <StopCircle className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Mic className="w-5 h-5" aria-hidden="true" />
      )}
      <span className="sr-only">
        {isRecording ? 'Gravando. Clique para parar.' : 'Clique para gravar mensagem de voz'}
      </span>
    </Button>
  );
};

export default VoiceRecordingButton;
