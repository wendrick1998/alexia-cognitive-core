
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, Calendar } from 'lucide-react';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gerenciador de Projetos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize e gerencie seus projetos e tarefas
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {projects.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Projetos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tarefas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Taxa de conclusão
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Projetos</CardTitle>
          <CardDescription>
            Lista de projetos organizados por status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nenhum projeto criado ainda.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsManager;
