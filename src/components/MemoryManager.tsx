
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Plus, Search, Trash2 } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  relevanceScore: number;
}

const MemoryManager = () => {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      title: 'Conceitos de IA Cognitiva',
      content: 'Inteligência artificial cognitiva envolve sistemas que simulam processos de pensamento humano...',
      tags: ['IA', 'Cognição', 'Aprendizado'],
      createdAt: new Date('2024-01-15'),
      relevanceScore: 0.95
    },
    {
      id: '2',
      title: 'Arquitetura de Sistemas Distribuídos',
      content: 'Sistemas distribuídos são fundamentais para aplicações modernas...',
      tags: ['Arquitetura', 'Sistemas', 'Escalabilidade'],
      createdAt: new Date('2024-01-10'),
      relevanceScore: 0.87
    }
  ]);

  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    tags: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleAddMemory = () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) return;

    const memory: Memory = {
      id: Date.now().toString(),
      title: newMemory.title,
      content: newMemory.content,
      tags: newMemory.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      relevanceScore: 0.5
    };

    setMemories(prev => [memory, ...prev]);
    setNewMemory({ title: '', content: '', tags: '' });
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(memory => memory.id !== id));
  };

  const filteredMemories = memories.filter(memory =>
    memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-500" />
          Gerenciador de Memória Cognitiva
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize e explore suas memórias cognitivas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form para nova memória */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Memória
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título da memória"
              value={newMemory.title}
              onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Conteúdo da memória"
              value={newMemory.content}
              onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <Input
              placeholder="Tags (separadas por vírgula)"
              value={newMemory.tags}
              onChange={(e) => setNewMemory(prev => ({ ...prev, tags: e.target.value }))}
            />
            <Button 
              onClick={handleAddMemory} 
              className="w-full"
              disabled={!newMemory.title.trim() || !newMemory.content.trim()}
            >
              Adicionar Memória
            </Button>
          </CardContent>
        </Card>

        {/* Lista de memórias */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Memórias</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, conteúdo ou tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {filteredMemories.map((memory) => (
              <Card key={memory.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{memory.title}</CardTitle>
                      <CardDescription>
                        Criado em {memory.createdAt.toLocaleDateString()} • 
                        Relevância: {(memory.relevanceScore * 100).toFixed(0)}%
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {memory.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {memory.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMemories.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhuma memória encontrada' : 'Nenhuma memória cadastrada'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryManager;
