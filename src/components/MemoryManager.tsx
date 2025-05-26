
import { useState } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Brain, Plus, Calendar, Tag, FolderOpen } from 'lucide-react';

const MEMORY_TYPES = [
  { value: 'fact', label: 'Fato', color: 'bg-blue-100 text-blue-800' },
  { value: 'preference', label: 'Preferência', color: 'bg-green-100 text-green-800' },
  { value: 'decision', label: 'Decisão', color: 'bg-purple-100 text-purple-800' },
  { value: 'note', label: 'Nota', color: 'bg-yellow-100 text-yellow-800' },
] as const;

const MemoryManager = () => {
  const { memories, loading, createMemory, fetchMemories } = useMemories();
  const { projects } = useProjects();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    type: '' as 'fact' | 'preference' | 'decision' | 'note' | '',
    project_id: '',
  });
  const [filters, setFilters] = useState({
    type: 'all',
    project_id: 'all',
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim() || !formData.type) return;

    setCreating(true);
    const success = await createMemory({
      content: formData.content,
      type: formData.type,
      project_id: formData.project_id || undefined,
    });

    if (success) {
      setFormData({ content: '', type: '', project_id: '' });
      setShowCreateForm(false);
    }
    setCreating(false);
  };

  const handleFilterChange = (filterType: 'type' | 'project_id', value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    const filterParams: any = {};
    if (newFilters.type !== 'all') filterParams.type = newFilters.type;
    if (newFilters.project_id !== 'all') filterParams.project_id = newFilters.project_id;
    
    fetchMemories(filterParams);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeInfo = (type: string) => {
    return MEMORY_TYPES.find(t => t.value === type) || MEMORY_TYPES[3];
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando memórias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-800">Gerenciar Memória</h1>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Memória
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {MEMORY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-gray-500" />
            <Select value={filters.project_id} onValueChange={(value) => handleFilterChange('project_id', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                <SelectItem value="none">Sem projeto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Formulário de criação */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nova Memória</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo da memória..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo da memória" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMORY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project">Projeto (opcional)</Label>
                  <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum projeto</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={creating || !formData.content.trim() || !formData.type}>
                    {creating ? 'Salvando...' : 'Salvar Memória'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de memórias */}
      {memories.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma memória encontrada</h3>
          <p className="text-gray-500 mb-4">
            {filters.type !== 'all' || filters.project_id !== 'all' 
              ? 'Nenhuma memória corresponde aos filtros selecionados.'
              : 'Comece criando sua primeira memória para o Alex iA lembrar de informações importantes.'
            }
          </p>
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Memória
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => {
            const typeInfo = getTypeInfo(memory.type);
            return (
              <Card key={memory.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {memory.project && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {memory.project.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(memory.created_at)}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{memory.content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoryManager;
