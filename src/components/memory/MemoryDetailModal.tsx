
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Memory } from "@/hooks/useMemories";
import { Brain, Zap, Trash2, Link, Calendar, FolderOpen } from "lucide-react";

interface MemoryDetailModalProps {
  memory: Memory | null;
  isOpen: boolean;
  onClose: () => void;
  onStrengthen?: (memoryId: string) => void;
  onForget?: (memoryId: string) => void;
  onConnect?: (memoryId: string) => void;
}

const getTypeInfo = (type: string) => {
  const types = {
    fact: { label: 'Fato', color: 'bg-blue-100 text-blue-800', emoji: '📝' },
    preference: { label: 'Preferência', color: 'bg-green-100 text-green-800', emoji: '🎯' },
    decision: { label: 'Decisão', color: 'bg-purple-100 text-purple-800', emoji: '💡' },
    note: { label: 'Nota', color: 'bg-yellow-100 text-yellow-800', emoji: '💭' },
  };
  return types[type as keyof typeof types] || types.note;
};

const formatFullDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MemoryDetailModal = ({ 
  memory, 
  isOpen, 
  onClose, 
  onStrengthen, 
  onForget, 
  onConnect 
}: MemoryDetailModalProps) => {
  if (!memory) return null;

  const typeInfo = getTypeInfo(memory.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto bg-[#1A1A1A] border-white/20 text-white">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{typeInfo.emoji}</span>
              <Badge className={`${typeInfo.color} text-xs`}>
                {typeInfo.label}
              </Badge>
            </div>
            {memory.project && (
              <Badge variant="secondary" className="bg-white/10 text-gray-300">
                <FolderOpen className="w-3 h-3 mr-1" />
                {memory.project.name}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conteúdo principal */}
          <div className="space-y-3">
            <DialogDescription className="text-gray-100 text-base leading-relaxed">
              {memory.content}
            </DialogDescription>
          </div>

          {/* Timeline */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Criada:</span>
                <span>{formatFullDate(memory.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização:</span>
                <span>{formatFullDate(memory.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex space-x-2 pt-4 border-t border-white/10">
            <Button
              onClick={() => onStrengthen?.(memory.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Fortalecer
            </Button>
            <Button
              onClick={() => onConnect?.(memory.id)}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              size="sm"
            >
              <Link className="w-4 h-4 mr-2" />
              Conectar
            </Button>
            <Button
              onClick={() => onForget?.(memory.id)}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryDetailModal;
