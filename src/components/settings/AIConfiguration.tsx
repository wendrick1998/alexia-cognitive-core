
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Brain, Zap } from 'lucide-react';

const AIConfiguration = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configurações de IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personalize o comportamento e as capacidades do Alex iA
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Modelo de IA Preferido
            </CardTitle>
            <CardDescription>
              Escolha o modelo de IA padrão para suas conversas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Seleção de modelo em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Memória Cognitiva
            </CardTitle>
            <CardDescription>
              Configure como o Alex iA deve lembrar e usar informações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Configurações de memória em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Performance e Velocidade
            </CardTitle>
            <CardDescription>
              Ajuste o equilíbrio entre velocidade e qualidade das respostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Configurações de performance em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIConfiguration;
