
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, MessageSquare, FileText, Search, Zap, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
      title: "Chat IA",
      description: "Converse com Alex IA para obter insights cognitivos",
      path: "/chat",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Memória Cognitiva",
      description: "Gerencie e explore suas memórias cognitivas",
      path: "/memory",
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      icon: <FileText className="w-8 h-8 text-green-500" />,
      title: "Documentos",
      description: "Upload e processamento de documentos",
      path: "/documents",
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      icon: <Search className="w-8 h-8 text-orange-500" />,
      title: "Busca Semântica",
      description: "Busca avançada por contexto e significado",
      path: "/search",
      color: "bg-orange-50 hover:bg-orange-100"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Projetos",
      description: "Gerencie projetos e ações cognitivas",
      path: "/actions",
      color: "bg-yellow-50 hover:bg-yellow-100"
    },
    {
      icon: <Settings className="w-8 h-8 text-gray-500" />,
      title: "Configurações",
      description: "Configurações do sistema",
      path: "/settings",
      color: "bg-gray-50 hover:bg-gray-100"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard - Alex IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Seu agente cognitivo pessoal e copiloto full-stack
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all duration-200 ${feature.color} border-gray-200 dark:border-gray-700`}
            onClick={() => navigate(feature.path)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {feature.icon}
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(feature.path);
                }}
              >
                Acessar →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Autenticação</span>
                <span className="text-green-600">✓ Ativo</span>
              </div>
              <div className="flex justify-between">
                <span>Edge Functions</span>
                <span className="text-green-600">✓ Operacional</span>
              </div>
              <div className="flex justify-between">
                <span>PWA</span>
                <span className="text-green-600">✓ Funcional</span>
              </div>
              <div className="flex justify-between">
                <span>Modo Offline</span>
                <span className="text-green-600">✓ Habilitado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate('/chat')}
              >
                Nova Conversa
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate('/documents')}
              >
                Upload Documento
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate('/performance')}
              >
                Ver Performance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
