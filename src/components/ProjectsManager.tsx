
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, FolderOpen } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';

const ProjectsManager = () => {
  const { projects, loading, createProject } = useProjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsCreating(true);
    const success = await createProject(formData.name.trim(), formData.description.trim() || undefined);
    
    if (success) {
      setFormData({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    }
    setIsCreating(false);
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <p className="text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Meus Projetos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus projetos e organize seu trabalho</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
                <DialogDescription>
                  Crie um novo projeto para organizar seu trabalho no Alex iA.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    placeholder="Digite o nome do projeto"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o objetivo do projeto"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating || !formData.name.trim()}>
                  {isCreating ? 'Criando...' : 'Criar Projeto'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum projeto encontrado</h3>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro projeto para começar a organizar seu trabalho no Alex iA.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center space-x-2 mx-auto">
            <Plus className="w-4 h-4" />
            <span>Criar Primeiro Projeto</span>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-gray-800 truncate">
                  {project.name}
                </CardTitle>
                {project.description && (
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-xs text-gray-500 space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Criado em {formatDate(project.created_at)}</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : project.status === 'archived'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status === 'active' ? 'Ativo' :
                     project.status === 'completed' ? 'Concluído' :
                     project.status === 'archived' ? 'Arquivado' : 'Pendente'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
