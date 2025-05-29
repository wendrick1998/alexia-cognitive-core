
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Mic, Camera, Zap } from "lucide-react";

interface FloatingActionButtonProps {
  onAction: (action: string) => void;
}

const RADIAL_ACTIONS = [
  { id: 'new-chat', icon: MessageCircle, label: 'Nova conversa', angle: 0 },
  { id: 'voice-mode', icon: Mic, label: 'Modo voz', angle: 72 },
  { id: 'screenshot', icon: Camera, label: 'Screenshot', angle: 144 },
  { id: 'change-model', icon: Zap, label: 'Mudar modelo', angle: 216 },
];

const FloatingActionButton = ({ onAction }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleAction = (actionId: string) => {
    setIsOpen(false);
    onAction(actionId);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {/* Radial Menu Items */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Radial Actions */}
          {RADIAL_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            const radius = 80;
            const angleRad = (action.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            
            return (
              <Button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className="absolute w-12 h-12 rounded-full bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-white/10 text-white shadow-lg transition-all duration-300 hover:scale-110"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  animation: `scale-in 0.2s ease-out ${index * 0.05}s both`
                }}
                title={action.label}
              >
                <Icon className="w-5 h-5" />
              </Button>
            );
          })}
        </>
      )}

      {/* Main FAB */}
      <Button
        onClick={toggleMenu}
        className={`w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B5BF7] hover:to-[#9333EA] text-white shadow-xl transition-all duration-300 hover:scale-110 border-0 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <Sparkles className="w-7 h-7" />
      </Button>
    </div>
  );
};

export default FloatingActionButton;
