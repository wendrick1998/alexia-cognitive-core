
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, Mic, Camera, Zap } from "lucide-react";
import QuickActionsScreen from "../quick-actions/QuickActionsScreen";

interface FloatingActionButtonProps {
  onAction: (action: string) => void;
  currentSection?: string;
  hasActiveChat?: boolean;
  hasDocument?: boolean;
}

const RADIAL_ACTIONS = [
  { id: 'new-chat', icon: MessageCircle, label: 'Nova conversa', angle: 0 },
  { id: 'voice-mode', icon: Mic, label: 'Modo voz', angle: 72 },
  { id: 'focus-mode', icon: Sparkles, label: 'Focus Mode', angle: 144 },
  { id: 'quick-actions', icon: Zap, label: 'Ações rápidas', angle: 216 },
];

const FloatingActionButton = ({ 
  onAction, 
  currentSection = '',
  hasActiveChat = false,
  hasDocument = false 
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleAction = (actionId: string) => {
    setIsOpen(false);
    
    if (actionId === 'quick-actions') {
      setShowQuickActions(true);
    } else {
      onAction(actionId);
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  return (
    <>
      <div className="fixed bottom-32 right-3 z-40">
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
              const radius = 70;
              const angleRad = (action.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;
              
              return (
                <Button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className="absolute w-10 h-10 rounded-full bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-white/10 text-white shadow-lg transition-all duration-300 hover:scale-110"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    animation: `scale-in 0.2s ease-out ${index * 0.05}s both`
                  }}
                  title={action.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </>
        )}

        {/* Main FAB */}
        <Button
          onClick={toggleMenu}
          className={`w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white shadow-lg transition-all duration-300 hover:scale-105 border border-white/20 ${
            isOpen ? 'rotate-45 bg-white/20' : ''
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick Actions Screen */}
      <QuickActionsScreen
        isOpen={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        currentSection={currentSection}
        hasActiveChat={hasActiveChat}
        hasDocument={hasDocument}
      />
    </>
  );
};

export default FloatingActionButton;
