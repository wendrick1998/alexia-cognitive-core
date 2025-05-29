
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

  return (
    <Button
      variant="ghost"
      size="sm"
      onTouchStart={() => hapticFeedback('light')}
      onTouchEnd={handleVoiceRecording}
      className={cn(
        "flex-shrink-0 w-10 h-10 p-0 rounded-xl transition-all duration-200",
        "touch-manipulation",
        isRecording 
          ? "bg-red-500 text-white hover:bg-red-600" 
          : "text-white/60 hover:text-white hover:bg-white/10"
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
      disabled={disabled}
    >
      {isRecording ? (
        <StopCircle className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
};

export default VoiceRecordingButton;
