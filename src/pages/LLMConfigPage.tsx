
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, AlertTriangle, Settings, Zap } from 'lucide-react';

const LLMConfigPage = () => {
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);

  useEffect(() => {
    // Verificação da variável de ambiente
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    setHasOpenAIKey(!!apiKey);
    
    if (!apiKey) {
      console.warn("ALERTA: VITE_OPENAI_API_KEY não está configurada no ambiente. A funcionalidade OpenAI pode não funcionar.");
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuração de Provedores de IA (LLM)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie e teste a conectividade com diferentes modelos de Linguagem.
        </p>
      </div>

      {/* Alerta se a API key não estiver configurada */}
      {!hasOpenAIKey && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p className="font-bold">Atenção!</p>
          </div>
          <p className="mt-1">
            A chave VITE_OPENAI_API_KEY não está configurada. A integração com OpenAI pode estar desabilitada.
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {/* Card de Status dos Provedores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Status dos Provedores
            </CardTitle>
            <CardDescription>
              Status atual de conectividade com os provedores de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${hasOpenAIKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">OpenAI</span>
                </div>
                <span className={`text-sm ${hasOpenAIKey ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {hasOpenAIKey ? 'Configurado' : 'Não configurado'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="font-medium">Anthropic</span>
                </div>
                <span className="text-sm text-gray-500">Em desenvolvimento</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="font-medium">Groq</span>
                </div>
                <span className="text-sm text-gray-500">Em desenvolvimento</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Teste de Conectividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Testar Provedores
            </CardTitle>
            <CardDescription>
              Interface para testar a conectividade com provedores de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Interface para testar a conectividade com provedores de IA (OpenAI, Anthropic, Groq, etc.) será implementada aqui.
              </p>
              <p className="text-sm text-gray-500">
                Permitirá alternar entre provedores e configurar chaves de API.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações Avançadas
            </CardTitle>
            <CardDescription>
              Configurações de timeout, fallback e balanceamento de carga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Configurações avançadas de roteamento inteligente em desenvolvimento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LLMConfigPage;
