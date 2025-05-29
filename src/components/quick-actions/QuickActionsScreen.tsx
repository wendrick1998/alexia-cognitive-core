import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  MessageCircle, 
  FileText, 
  Upload, 
  Download,
  Search,
  Trash2,
  Settings,
  Sparkles,
  Brain,
  Zap,
  Camera,
  Mic,
  Share,
  Star
} from "lucide-react";
import SettingsScreen from "@/components/settings/SettingsScreen";

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
  const [showSettings, setShowSettings] = useState(false);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'new-chat',
      title: 'Nova Conversa',
      description: 'Iniciar uma nova conversa',
      icon: MessageCircle,
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'upload-document',
      title: 'Upload Documento',
      description: 'Adicionar novo documento',
      icon: Upload,
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'voice-message',
      title: 'Mensagem de Voz',
      description: 'Gravar mensagem de voz',
      icon: Mic,
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'take-photo',
      title: 'Tirar Foto',
      description: 'Capturar imagem',
      icon: Camera,
      color: 'bg-orange-500',
      available: true
    },
    {
      id: 'search',
      title: 'Buscar',
      description: 'Pesquisar na base de conhecimento',
      icon: Search,
      color: 'bg-indigo-500',
      available: true
    },
    {
      id: 'export-chat',
      title: 'Exportar Chat',
      description: 'Baixar conversa atual',
      icon: Download,
      color: 'bg-teal-500',
      available: hasActiveChat
    },
    {
      id: 'share',
      title: 'Compartilhar',
      description: 'Compartilhar conversa',
      icon: Share,
      color: 'bg-pink-500',
      available: hasActiveChat
    },
    {
      id: 'focus-mode',
      title: 'Modo Foco',
      description: 'Concentração máxima',
      icon: Sparkles,
      color: 'bg-yellow-500',
      available: true
    },
    {
      id: 'memory-consolidate',
      title: 'Consolidar Memórias',
      description: 'Processar aprendizados',
      icon: Brain,
      color: 'bg-cyan-500',
      available: true
    },
    {
      id: 'quick-summary',
      title: 'Resumo Rápido',
      description: 'Resumir documento/chat',
      icon: Zap,
      color: 'bg-amber-500',
      available: hasActiveChat || hasDocument
    },
    {
      id: 'favorites',
      title: 'Favoritos',
      description: 'Acessar itens salvos',
      icon: Star,
      color: 'bg-red-500',
      available: true
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajustar preferências',
      icon: Settings,
      color: 'bg-gray-500',
      available: true
    }
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === 'settings') {
      setShowSettings(true);
    } else {
      // Handle other actions
      console.log('Quick action:', actionId);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Ações Rápidas</h1>
                <p className="text-purple-100 text-sm">Acesso rápido às principais funcionalidades</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Actions Grid */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card 
                    key={action.id}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-0 ${
                      !action.available ? 'opacity-50' : ''
                    }`}
                    onClick={() => action.available && handleActionClick(action.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                      {!action.available && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Indisponível
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Context Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Contexto Atual: {currentSection || 'Principal'}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {hasActiveChat && (
                  <Button variant="outline" className="justify-start" onClick={() => handleActionClick('clear-chat')}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Chat
                  </Button>
                )}
                <Button variant="outline" className="justify-start" onClick={() => handleActionClick('keyboard-shortcuts')}>
                  <Zap className="w-4 h-4 mr-2" />
                  Atalhos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Screen */}
      <SettingsScreen 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};

export default QuickActionsScreen;
