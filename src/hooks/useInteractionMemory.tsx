
import { useEffect, useCallback } from 'react';
import { useMemoryActivation } from '@/hooks/useMemoryActivation';

export function useInteractionMemory() {
  const { saveInteractionAsMemory } = useMemoryActivation();

  // Detectar padrões importantes nas mensagens
  const detectImportantPatterns = useCallback((message: string): boolean => {
    const importantPatterns = [
      /prefiro|gosto|não gosto|odio/i,
      /sempre|nunca|geralmente/i,
      /importante|crítico|urgente/i,
      /decisão|escolha|opção/i,
      /lembrar|memorizar|anotar/i,
      /configuração|configurar|ajustar/i,
      /problema|erro|bug|falha/i,
      /solução|resolver|corrigir/i
    ];

    return importantPatterns.some(pattern => pattern.test(message));
  }, []);

  // Determinar tipo de memória baseado no conteúdo
  const determineMemoryType = useCallback((message: string): 'fact' | 'preference' | 'decision' | 'note' => {
    if (/prefiro|gosto|não gosto|odio/i.test(message)) return 'preference';
    if (/decisão|escolha|opção|decidir/i.test(message)) return 'decision';
    if (/fato|informação|dado|estatística/i.test(message)) return 'fact';
    return 'note';
  }, []);

  // Interceptar mensagens do chat
  const interceptChatMessage = useCallback(async (message: string, context?: any) => {
    if (!message || message.length < 10) return;

    const isImportant = detectImportantPatterns(message);
    
    if (isImportant) {
      const memoryType = determineMemoryType(message);
      
      await saveInteractionAsMemory(
        message,
        memoryType,
        {
          source: 'chat_interaction',
          context_type: 'user_message',
          importance_detected: true,
          patterns_matched: detectImportantPatterns(message),
          auto_saved: true,
          ...context
        }
      );

      console.log('🔍 Mensagem importante detectada e salva:', {
        type: memoryType,
        preview: message.substring(0, 50) + '...'
      });
    }
  }, [detectImportantPatterns, determineMemoryType, saveInteractionAsMemory]);

  // Hook para capturar eventos de teclado específicos
  useEffect(() => {
    const handleKeyShortcut = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + M para salvar mensagem atual como memória
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
        const selection = window.getSelection()?.toString();
        if (selection && selection.length > 10) {
          saveInteractionAsMemory(
            selection,
            'note',
            {
              source: 'manual_selection',
              saved_via: 'keyboard_shortcut',
              timestamp: new Date().toISOString()
            }
          );
          console.log('⌨️ Texto selecionado salvo como memória via shortcut');
        }
      }
    };

    document.addEventListener('keydown', handleKeyShortcut);
    return () => document.removeEventListener('keydown', handleKeyShortcut);
  }, [saveInteractionAsMemory]);

  return {
    interceptChatMessage,
    detectImportantPatterns,
    determineMemoryType
  };
}
