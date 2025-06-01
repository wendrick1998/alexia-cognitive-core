
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface FocusModeProps {
  isActive: boolean;
  onExit: () => void;
  onSendMessage?: (message: string) => void;
  initialText?: string;
}

const BACKGROUND_COLORS = [
  '#000000', // Pure black
  '#1a1a2e', // Dark blue
  '#16213e', // Deep navy
  '#0f3460', // Navy blue
  '#533a71', // Purple
  '#2d4a22', // Forest green
  '#3d2914', // Dark brown
];

const AMBIENT_SOUNDS = [
  { name: 'Rain', url: '/sounds/rain.mp3' },
  { name: 'White Noise', url: '/sounds/white-noise.mp3' },
  { name: 'Forest', url: '/sounds/forest.mp3' },
];

const FocusMode = ({ isActive, onExit, onSendMessage, initialText = '' }: FocusModeProps) => {
  const [text, setText] = useState(initialText);
  const [aiResponse, setAiResponse] = useState('');
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(0);
  const [isShowingHistory, setIsShowingHistory] = useState(false);
  const [sessions] = useState<string[]>([]);
  const [ambientMode, setAmbientMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const currentBgColor = BACKGROUND_COLORS[backgroundColorIndex];
  const textColor = currentBgColor === '#000000' ? '#ffffff' : '#f1f5f9';

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);

  // Handle gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Swipe detection (minimum 50px movement, max 300ms)
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      if (deltaTime < 500) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            // Swipe right - exit focus mode
            handleExit();
          }
        } else {
          // Vertical swipe
          if (deltaY < 0) {
            // Swipe up - change background
            setBackgroundColorIndex((prev) => (prev + 1) % BACKGROUND_COLORS.length);
            toast({
              title: "Background Changed",
              description: "Swipe up again for next color",
            });
          } else {
            // Swipe down - show history
            setIsShowingHistory(!isShowingHistory);
          }
        }
      }
      touchStartRef.current = null;
      return;
    }

    // Tap detection for double-tap to send
    tapCountRef.current += 1;
    
    if (tapCountRef.current === 1) {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 300);
    } else if (tapCountRef.current === 2) {
      // Double tap - send message
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      tapCountRef.current = 0;
      handleSendMessage();
    }

    touchStartRef.current = null;
  };

  const handleSendMessage = async () => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        setAiResponse("This is a minimalist AI response that appears cleanly below your text...");
        setIsProcessing(false);
        
        // Auto-clear after reading
        setTimeout(() => {
          setAiResponse('');
        }, 5000);
      }, 1000);

      if (onSendMessage) {
        onSendMessage(text);
      }
      
      // Clear text after sending
      setText('');
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleExit = () => {
    // Auto-save session
    if (text.trim()) {
      const sessionData = {
        text,
        timestamp: new Date().toISOString(),
        duration: Date.now() - (touchStartRef.current?.time || 0)
      };
      
      localStorage.setItem(
        `focus-session-${Date.now()}`,
        JSON.stringify(sessionData)
      );
      
      toast({
        title: "Focus Session Saved",
        description: "Your work has been automatically saved",
      });
    }
    
    onExit();
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleExit();
    }
    if (e.ctrlKey && e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 transition-all duration-500 ease-out"
      style={{ backgroundColor: currentBgColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Breathing animation background */}
      {ambientMode && (
        <div 
          className="absolute inset-0 opacity-10 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${textColor}20 0%, transparent 70%)`,
            animation: 'breathe 4s ease-in-out infinite'
          }}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* Main textarea */}
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start writing..."
            className="w-full min-h-[200px] bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-center text-xl leading-relaxed font-light"
            style={{ 
              color: textColor,
              fontSize: '24px',
              lineHeight: '1.6'
            }}
          />

          {/* AI Response */}
          {aiResponse && (
            <div 
              className="animate-fade-in text-center opacity-80"
              style={{ color: textColor }}
            >
              <div className="text-lg font-light leading-relaxed max-w-2xl mx-auto">
                {aiResponse}
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="text-center">
              <div 
                className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                style={{ borderColor: textColor }}
              />
            </div>
          )}

          {/* Minimalist history */}
          {isShowingHistory && (
            <div 
              className="absolute bottom-8 left-8 right-8 animate-slide-in"
              style={{ color: textColor }}
            >
              <div className="text-center text-sm opacity-60">
                <p>Previous sessions: {sessions.length}</p>
                <p className="text-xs mt-2">Swipe down again to hide</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle help indicators */}
      <div 
        className="absolute bottom-4 left-4 text-xs opacity-30 space-y-1"
        style={{ color: textColor }}
      >
        <p>Double tap: Send</p>
        <p>Swipe right: Exit</p>
        <p>Swipe up: Change color</p>
        <p>ESC: Exit</p>
      </div>

      {/* Ambient mode toggle */}
      <Button
        onClick={() => setAmbientMode(!ambientMode)}
        className="absolute top-4 right-4 opacity-30 hover:opacity-60 bg-transparent border-none"
        style={{ color: textColor }}
        size="sm"
      >
        {ambientMode ? '🌊' : '🔇'}
      </Button>
    </div>
  );
};

export default FocusMode;
