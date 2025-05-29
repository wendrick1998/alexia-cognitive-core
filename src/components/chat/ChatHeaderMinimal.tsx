
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ChatHeaderMinimalProps {
  currentModel: string;
  onModelChange: (model: string) => void;
  onProfileClick: () => void;
}

const AI_MODELS = [
  { id: 'auto', name: 'Auto', description: 'Escolha inteligente' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Raciocínio avançado' },
  { id: 'claude', name: 'Claude', description: 'Criativo e analítico' },
  { id: 'deepseek', name: 'DeepSeek', description: 'Programação expert' },
  { id: 'groq', name: 'Groq', description: 'Ultra rápido' },
];

const ChatHeaderMinimal = ({ currentModel, onModelChange, onProfileClick }: ChatHeaderMinimalProps) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const { user } = useAuth();

  const currentModelInfo = AI_MODELS.find(m => m.id === currentModel) || AI_MODELS[0];

  return (
    <>
      <header className="h-[50px] bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-4 flex items-center justify-between relative z-50">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-white font-semibold text-sm">Alex iA</span>
        </div>

        {/* AI Status */}
        <button
          onClick={() => setShowModelSelector(!showModelSelector)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
          <span className="text-white/90 text-sm font-medium">
            Pensando com {currentModelInfo.name}
          </span>
          <ChevronDown className="w-3 h-3 text-white/60" />
        </button>

        {/* Profile Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onProfileClick}
          className="p-1 rounded-full hover:bg-white/10"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white text-xs">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </header>

      {/* Model Selector Dropdown */}
      {showModelSelector && (
        <div className="absolute top-[50px] left-1/2 transform -translate-x-1/2 w-80 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4">
            <h3 className="text-white font-medium text-sm mb-3">Escolher Modelo de IA</h3>
            <div className="space-y-1">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    currentModel === model.id
                      ? 'bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#6366F1]/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-sm">{model.name}</div>
                      <div className="text-white/60 text-xs">{model.description}</div>
                    </div>
                    {currentModel === model.id && (
                      <div className="w-2 h-2 bg-[#10B981] rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showModelSelector && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setShowModelSelector(false)}
        />
      )}
    </>
  );
};

export default ChatHeaderMinimal;
