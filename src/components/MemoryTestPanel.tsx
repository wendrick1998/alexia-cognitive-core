
import React, { useState } from 'react';
import { useMemoryActivation } from '@/hooks/useMemoryActivation';
import { useInteractionMemory } from '@/hooks/useInteractionMemory';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Send, Zap, Clock } from 'lucide-react';

const MemoryTestPanel: React.FC = () => {
  const { stats, runMemoryConsolidation, saveInteractionAsMemory } = useMemoryActivation();
  const { interceptChatMessage } = useInteractionMemory();
  const [testMessage, setTestMessage] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) return;

    setTestResults(prev => [...prev, `📤 Enviado: ${testMessage}`]);
    
    // Interceptar como se fosse uma mensagem real
    await interceptChatMessage(testMessage);
    
    // Salvar manualmente também
    await saveInteractionAsMemory(testMessage, 'note', {
      source: 'memory_test_panel',
      test_mode: true,
      timestamp: new Date().toISOString()
    });

    setTestResults(prev => [...prev, `✅ Processado e salvo como memória`]);
    setTestMessage('');
  };

  const runTestSequence = async () => {
    const testMessages = [
      "Prefiro interfaces minimalistas e funcionais",
      "Sempre uso atalhos de teclado para navegar",
      "Esta é uma informação importante sobre meu projeto",
      "Decidi usar React para o frontend",
      "Nunca mostrar este tipo de notificação novamente"
    ];

    setTestResults(['🧪 Iniciando sequência de teste...']);

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      setTestResults(prev => [...prev, `📤 Teste ${i + 1}/5: ${message}`]);
      
      await interceptChatMessage(message, {
        test_sequence: true,
        test_index: i + 1,
        total_tests: testMessages.length
      });
      
      setTestResults(prev => [...prev, `✅ Processado`]);
      
      // Pequena pausa entre mensagens
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTestResults(prev => [...prev, '🎉 Sequência de teste concluída!']);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Sistema de Memória - Painel de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status atual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMemories}</div>
              <div className="text-sm text-blue-800">Memórias</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeNodes}</div>
              <div className="text-sm text-green-800">Nodes Ativos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.consolidationSessions}</div>
              <div className="text-sm text-purple-800">Consolidações</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.isConsolidating ? 'Ativo' : 'Parado'}
              </div>
              <div className="text-sm text-orange-800">Status</div>
            </div>
          </div>

          {/* Teste manual */}
          <div className="space-y-3">
            <h3 className="font-medium">Teste Manual de Memória</h3>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Digite uma mensagem para testar o sistema de memória..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={handleSendTestMessage} disabled={!testMessage.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Enviar Teste
              </Button>
              <Button onClick={runTestSequence} variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Sequência de Teste (5 msgs)
              </Button>
              <Button onClick={runMemoryConsolidation} variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Forçar Consolidação
              </Button>
            </div>
          </div>

          {/* Resultados dos testes */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Resultados dos Testes</h3>
              <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm py-1 border-b border-gray-200 last:border-0">
                    {result}
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => setTestResults([])}
                variant="ghost"
                size="sm"
              >
                Limpar Resultados
              </Button>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como Testar:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Execute a "Sequência de Teste" para criar 5 memórias</li>
              <li>2. Aguarde ou force uma consolidação</li>
              <li>3. Verifique o aumento nos contadores</li>
              <li>4. O sistema deve detectar padrões automaticamente</li>
              <li>5. Memórias importantes são boost automaticamente</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryTestPanel;
