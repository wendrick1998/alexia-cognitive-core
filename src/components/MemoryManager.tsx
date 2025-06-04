
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Plus, Search } from 'lucide-react';

const MemoryManager = () => {
  const [memories, setMemories] = useState([]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gerenciador de Memória
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas memórias cognitivas e conexões
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Memória
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Memórias Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {memories.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Memórias em uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-green-500" />
              Conexões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Conexões estabelecidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600">✓ Sistema Ativo</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consolidação automática
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Memórias</CardTitle>
          <CardDescription>
            Suas memórias cognitivas organizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma memória encontrada. Comece uma conversa para criar memórias.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryManager;
