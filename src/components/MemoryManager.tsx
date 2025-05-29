
import { useState, useEffect } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { Brain } from 'lucide-react';
import MemoryCard from './memory/MemoryCard';
import MemoryCategories from './memory/MemoryCategories';
import MemorySearchBar from './memory/MemorySearchBar';
import MemoryDetailModal from './memory/MemoryDetailModal';
import AddMemoryFAB from './memory/AddMemoryFAB';
import { Memory } from '@/hooks/useMemories';

const MemoryManager = () => {
  const { memories, loading, createMemory, fetchMemories } = useMemories();
  const { projects } = useProjects();
  const { toast } = useToast();
  
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar memórias baseado na categoria e busca
  useEffect(() => {
    let filtered = memories;

    // Filtrar por categoria
    if (activeCategory !== 'all') {
      filtered = filtered.filter(memory => memory.type === activeCategory);
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(memory =>
        memory.content.toLowerCase().includes(query) ||
        memory.project?.name.toLowerCase().includes(query)
      );
    }

    setFilteredMemories(filtered);
  }, [memories, activeCategory, searchQuery]);

  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory);
  };

  const handleAddMemory = async (type: 'fact' | 'preference' | 'decision' | 'note') => {
    // Placeholder - em uma implementação real, abriria um modal de criação
    const content = prompt(`Adicionar ${type}:`);
    if (content) {
      const success = await createMemory({
        content,
        type,
      });
      
      if (success) {
        toast({
          title: "Memória criada",
          description: "Nova memória adicionada com sucesso",
        });
      }
    }
  };

  const handleStrengthen = (memoryId: string) => {
    toast({
      title: "Memória fortalecida",
      description: "A memória foi marcada como importante",
    });
    setSelectedMemory(null);
  };

  const handleForget = (memoryId: string) => {
    toast({
      title: "Memória enfraquecida",
      description: "A memória foi marcada para esquecimento",
      variant: "destructive",
    });
    setSelectedMemory(null);
  };

  const handleConnect = (memoryId: string) => {
    toast({
      title: "Conectar memória",
      description: "Funcionalidade em desenvolvimento",
    });
    setSelectedMemory(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Carregando memórias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] text-white">
      {/* Search Bar */}
      <MemorySearchBar 
        onSearch={setSearchQuery}
        onFilterClick={() => setShowFilters(!showFilters)}
      />

      {/* Categories */}
      <MemoryCategories 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Memory Grid */}
      <div className="px-4 pb-24">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              {searchQuery || activeCategory !== 'all' 
                ? 'Nenhuma memória encontrada' 
                : 'Nenhuma memória ainda'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || activeCategory !== 'all'
                ? 'Tente ajustar os filtros ou busca.'
                : 'Comece criando sua primeira memória usando o botão +'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={handleMemoryClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onStrengthen={handleStrengthen}
        onForget={handleForget}
        onConnect={handleConnect}
      />

      {/* Add Memory FAB */}
      <AddMemoryFAB onAddMemory={handleAddMemory} />
    </div>
  );
};

export default MemoryManager;
