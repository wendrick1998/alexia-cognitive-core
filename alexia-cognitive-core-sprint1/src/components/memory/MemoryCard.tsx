
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, FileText, Target, RefreshCw } from "lucide-react";
import { Memory } from "@/hooks/useMemories";

interface MemoryCardProps {
  memory: Memory;
  onClick: (memory: Memory) => void;
}

const getMemoryIcon = (type: string) => {
  switch (type) {
    case 'fact': return <FileText className="w-6 h-6" />;
    case 'preference': return <Target className="w-6 h-6" />;
    case 'decision': return <Lightbulb className="w-6 h-6" />;
    case 'note': return <Brain className="w-6 h-6" />;
    default: return <RefreshCw className="w-6 h-6" />;
  }
};

const getMemoryStrength = (memory: Memory) => {
  // Calcular força baseada na idade e última atualização
  const now = new Date();
  const created = new Date(memory.created_at);
  const updated = new Date(memory.updated_at);
  
  const daysSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceUpdated = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
  
  // Lógica simples: memórias recentes são mais fortes
  if (daysSinceUpdated < 1) return { strength: 90, color: 'bg-green-500', label: 'Forte' };
  if (daysSinceUpdated < 7) return { strength: 70, color: 'bg-yellow-500', label: 'Média' };
  if (daysSinceUpdated < 30) return { strength: 50, color: 'bg-orange-500', label: 'Fraca' };
  return { strength: 20, color: 'bg-red-500', label: 'Esquecendo' };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

const MemoryCard = ({ memory, onClick }: MemoryCardProps) => {
  const memoryStrength = getMemoryStrength(memory);
  const isRecent = new Date(memory.updated_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  return (
    <Card 
      className={`relative h-40 w-full cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg bg-[#1A1A1A] border-white/10 ${
        isRecent ? 'animate-pulse ring-2 ring-blue-500/30' : ''
      }`}
      onClick={() => onClick(memory)}
    >
      <div className="p-4 h-full flex flex-col justify-between">
        {/* Header com ícone e data */}
        <div className="flex justify-between items-start">
          <div className="text-blue-400">
            {getMemoryIcon(memory.type)}
          </div>
          <span className="text-xs text-gray-400">
            {formatDate(memory.created_at)}
          </span>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 mt-2">
          <p className="text-white text-sm font-medium line-clamp-3 leading-tight">
            {memory.content}
          </p>
        </div>

        {/* Footer com projeto e barra de força */}
        <div className="space-y-2">
          {memory.project && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-white/10 text-gray-300">
              {memory.project.name}
            </Badge>
          )}
          
          {/* Barra de força da memória */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{memoryStrength.label}</span>
              <span className="text-xs text-gray-400">{memoryStrength.strength}%</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${memoryStrength.color} transition-all duration-500`}
                style={{ width: `${memoryStrength.strength}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MemoryCard;
