
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Sparkles, Zap, Brain, Cpu } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    icon: Zap,
    description: 'Rápido e eficiente para tarefas gerais',
    badge: 'Recomendado',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    icon: Sparkles,
    description: 'Mais poderoso para análises complexas',
    badge: 'Premium',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    icon: Brain,
    description: 'Excelente para escrita criativa',
    badge: 'Novo',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'local-llama',
    name: 'Llama Local',
    icon: Cpu,
    description: 'Modelo local para privacidade',
    badge: 'Offline',
    color: 'from-gray-500 to-gray-600'
  }
];

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentModel = models.find(m => m.id === selectedModel) || models[0];
  const Icon = currentModel.icon;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl px-3 py-2 min-w-[140px]"
      >
        <Icon className="w-4 h-4 mr-2" />
        <span className="font-medium">{currentModel.name}</span>
        <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-80 bg-[#1A1A1A] border border-white/20 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <h3 className="text-white font-medium text-sm">Selecionar Modelo</h3>
              <p className="text-white/60 text-xs mt-1">Escolha o modelo ideal para sua tarefa</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {models.map(model => {
                const ModelIcon = model.icon;
                const isSelected = selectedModel === model.id;
                
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 text-left hover:bg-white/5 transition-colors ${
                      isSelected ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${model.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <ModelIcon className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium text-sm">{model.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            model.badge === 'Recomendado' ? 'bg-green-500/20 text-green-400' :
                            model.badge === 'Premium' ? 'bg-purple-500/20 text-purple-400' :
                            model.badge === 'Novo' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {model.badge}
                          </span>
                        </div>
                        <p className="text-white/60 text-xs mt-1">{model.description}</p>
                      </div>
                      
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;
