import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  RefreshCw, 
  Users, 
  BarChart3, 
  Target, 
  Lightbulb,
  Sparkles,
  TrendingUp,
  Settings,
  X,
  Copy,
  Focus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickAction {
  id: string;
  icon: any;
  label: string;
  color: string;
  command?: string;
  action: () => void;
}

interface QuickActionsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection?: string;
  hasActiveChat?: boolean;
  hasDocument?: boolean;
}

const QuickActionsScreen = ({ 
  isOpen, 
  onClose, 
  currentSection = '',
  hasActiveChat = false,
  hasDocument = false 
}: QuickActionsScreenProps) => {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Haptic feedback function
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 30,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  // Base actions grid (3x3)
  const baseActions: QuickAction[] = [
    {
      id: 'deep-think',
      icon: Brain,
      label: 'Deep Think',
      color: 'from-purple-500 to-indigo-600',
      command: '@deep-think',
      action: () => {
        toast({
          title: "Deep Think Ativado",
          description: "Iniciando análise profunda do contexto...",
        });
      }
    },
    {
      id: 'sync',
      icon: RefreshCw,
      label: 'Sincronizar',
      color: 'from-blue-500 to-cyan-600',
      action: () => {
        toast({
          title: "Sincronização",
          description: "Sincronizando dados com a nuvem...",
        });
      }
    },
    {
      id: 'focus-mode',
      icon: Focus,
      label: 'Focus Mode',
      color: 'from-slate-500 to-gray-700',
      action: () => {
        onClose(); // Close quick actions first
        setTimeout(() => {
          // Trigger focus mode through parent component
          window.dispatchEvent(new CustomEvent('activate-focus-mode'));
        }, 300);
      }
    },
    {
      id: 'collaborate',
      icon: Users,
      label: 'Colaborar',
      color: 'from-green-500 to-emerald-600',
      action: () => {
        toast({
          title: "Modo Colaboração",
          description: "Compartilhando sessão para colaboração...",
        });
      }
    },
    {
      id: 'analyze',
      icon: BarChart3,
      label: 'Análise',
      color: 'from-orange-500 to-red-600',
      action: () => {
        toast({
          title: "Análise Iniciada",
          description: "Analisando padrões e insights...",
        });
      }
    },
    {
      id: 'goals',
      icon: Target,
      label: 'Objetivos',
      color: 'from-pink-500 to-rose-600',
      action: () => {
        toast({
          title: "Definir Objetivos",
          description: "Configurando metas e marcos...",
        });
      }
    },
    {
      id: 'brainstorm',
      icon: Lightbulb,
      label: 'Brainstorm',
      color: 'from-yellow-500 to-amber-600',
      command: '@brainstorm',
      action: () => {
        toast({
          title: "Brainstorm Mode",
          description: "Gerando ideias criativas...",
        });
      }
    },
    {
      id: 'simulate',
      icon: Sparkles,
      label: 'Simular',
      color: 'from-teal-500 to-cyan-600',
      command: '@simulate',
      action: () => {
        toast({
          title: "Simulação",
          description: "Criando cenários hipotéticos...",
        });
      }
    },
    {
      id: 'dashboard',
      icon: TrendingUp,
      label: 'Dashboard',
      color: 'from-indigo-500 to-purple-600',
      action: () => {
        toast({
          title: "Dashboard",
          description: "Abrindo visão geral do sistema...",
        });
      }
    },
    {
      id: 'config',
      icon: Settings,
      label: 'Config',
      color: 'from-slate-500 to-gray-600',
      action: () => {
        toast({
          title: "Configurações",
          description: "Acessando configurações do sistema...",
        });
      }
    }
  ];

  // Contextual actions based on current state
  const getContextualActions = (): QuickAction[] => {
    const contextual: QuickAction[] = [];

    if (hasDocument) {
      contextual.push(
        {
          id: 'summarize',
          icon: Brain,
          label: 'Resumir',
          color: 'from-blue-500 to-indigo-600',
          action: () => toast({ title: "Resumindo documento..." })
        },
        {
          id: 'questions',
          icon: Target,
          label: 'Questões',
          color: 'from-green-500 to-teal-600',
          action: () => toast({ title: "Gerando questões..." })
        },
        {
          id: 'translate',
          icon: RefreshCw,
          label: 'Traduzir',
          color: 'from-purple-500 to-pink-600',
          action: () => toast({ title: "Traduzindo documento..." })
        }
      );
    }

    if (hasActiveChat) {
      contextual.push(
        {
          id: 'export-chat',
          icon: TrendingUp,
          label: 'Exportar',
          color: 'from-orange-500 to-red-600',
          action: () => toast({ title: "Exportando conversa..." })
        },
        {
          id: 'share-chat',
          icon: Users,
          label: 'Compartilhar',
          color: 'from-cyan-500 to-blue-600',
          action: () => toast({ title: "Compartilhando conversa..." })
        },
        {
          id: 'focus-mode',
          icon: Target,
          label: 'Modo Focus',
          color: 'from-emerald-500 to-green-600',
          action: () => toast({ title: "Ativando modo foco..." })
        }
      );
    }

    return contextual;
  };

  // Command shortcuts
  const commandShortcuts = [
    { command: '@deep-think', description: 'análise profunda' },
    { command: '@connect X Y', description: 'conectar ideias' },
    { command: '@simulate', description: 'simular cenários' },
    { command: '@brainstorm', description: 'sessão criativa' },
    { command: '@focus', description: 'modo concentração' }
  ];

  const handleActionClick = (action: QuickAction) => {
    triggerHaptic('medium');
    setSelectedAction(action.id);
    
    // Visual feedback
    setTimeout(() => {
      setSelectedAction(null);
      action.action();
    }, 150);
  };

  const copyCommand = (command: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(command);
    toast({
      title: "Comando copiado!",
      description: `${command} foi copiado para a área de transferência.`,
    });
  };

  const contextualActions = getContextualActions();
  const displayActions = contextualActions.length > 0 ? contextualActions : baseActions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 animate-fade-in">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 text-white">
        <div>
          <h1 className="text-2xl font-bold">⚡ Ações Rápidas</h1>
          <p className="text-white/70 text-sm mt-1">
            {contextualActions.length > 0 ? 'Ações contextuais disponíveis' : 'Escolha uma ação para executar'}
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Actions Grid */}
      <div className="relative z-10 px-6 py-4">
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {displayActions.map((action, index) => {
            const Icon = action.icon;
            const isSelected = selectedAction === action.id;
            
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`
                  relative w-24 h-24 rounded-2xl bg-gradient-to-br ${action.color} 
                  flex flex-col items-center justify-center text-white
                  transform transition-all duration-200 hover:scale-105
                  ${isSelected ? 'scale-95' : 'scale-100'}
                  animate-scale-in shadow-xl
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.label}
                </span>
                
                {/* Ripple effect */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-white/30 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Command Shortcuts */}
      <div className="relative z-10 px-6 py-8 mt-8">
        <h3 className="text-white text-lg font-semibold mb-4 text-center">
          Comandos Especiais
        </h3>
        <div className="space-y-3 max-w-md mx-auto">
          {commandShortcuts.map((shortcut, index) => (
            <div
              key={shortcut.command}
              className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-3 animate-slide-in"
              style={{ animationDelay: `${(index + 9) * 0.05}s` }}
            >
              <div className="flex-1">
                <code className="text-blue-300 font-mono text-sm">
                  {shortcut.command}
                </code>
                <p className="text-white/70 text-xs mt-1">
                  {shortcut.description}
                </p>
              </div>
              <Button
                onClick={() => copyCommand(shortcut.command)}
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-6 left-6 right-6 text-center">
        <p className="text-white/50 text-xs">
          Pressione e segure uma ação para reordenar • Toque para executar
        </p>
      </div>
    </div>
  );
};

export default QuickActionsScreen;
