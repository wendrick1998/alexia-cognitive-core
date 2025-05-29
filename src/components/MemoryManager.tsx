
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemories } from '@/hooks/useMemories';
import { Brain, Search, Plus, Calendar, Tag, Trash2, Edit3, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CreateMemoryModal from './chat/CreateMemoryModal';
import { useToast } from '@/hooks/use-toast';

const MemoryManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { memories, loading } = useMemories();
  const { toast } = useToast();

  // Filter memories based on search and type
  const filteredMemories = useMemo(() => {
    if (!memories) return [];
    
    return memories.filter(memory => {
      const matchesSearch = searchTerm === '' || 
        memory.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || 
        memory.type === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [memories, searchTerm, selectedType]);

  // Get unique types
  const types = useMemo(() => {
    if (!memories) return [];
    const memoryTypes = [...new Set(memories.map(m => m.type).filter(Boolean))];
    return memoryTypes.sort();
  }, [memories]);

  const handleDeleteMemory = async (id: string, content: string) => {
    if (window.confirm(`Tem certeza que deseja excluir esta memória?`)) {
      try {
        // TODO: Implement delete functionality
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "A exclusão de memórias será implementada em breve.",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a memória. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando memórias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gerenciar Memórias</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {memories?.length || 0} memórias armazenadas
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Memória
          </Button>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar nas memórias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
              className="text-sm"
            >
              Todas
            </Button>
            {types.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="text-sm capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content with scroll */}
      <ScrollArea className="flex-1 p-6">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || selectedType !== 'all' ? 'Nenhuma memória encontrada' : 'Nenhuma memória criada'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedType !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando sua primeira memória.'
              }
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Memória
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMemories.map((memory) => (
              <Card key={memory.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      Memória #{memory.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMemory(memory.id, memory.content)}
                        className="w-8 h-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {memory.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(memory.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-4">
                    {memory.content}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Create Memory Modal */}
      <CreateMemoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default MemoryManager;
