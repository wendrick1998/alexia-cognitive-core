
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Brain, Command } from 'lucide-react';
import CommandPalette from './search/CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface SemanticSearchProps {
  onNavigate?: (section: string, id?: string) => void;
}

const SemanticSearch = ({ onNavigate }: SemanticSearchProps) => {
  const { isOpen, open, close } = useCommandPalette();

  const handleNavigate = (section: string, id?: string) => {
    onNavigate?.(section, id);
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <div className="relative mb-6">
              <Command className="h-24 w-24 text-blue-600 mx-auto" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Command Palette
            </h1>
            <p className="text-lg text-white/60 mb-8">
              Busque e navegue por todo o sistema usando comandos inteligentes.
              Acesse documentos, conversas e memórias instantaneamente.
            </p>
          </div>

          {/* Main Search Button */}
          <Button 
            onClick={open}
            size="lg"
            className="px-8 py-4 text-lg h-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Search className="w-6 h-6 mr-3" />
            Abrir Command Palette
          </Button>

          {/* Keyboard Hint */}
          <div className="text-sm text-white/50 mb-8">
            Ou pressione{' '}
            <kbd className="px-3 py-1 bg-white/10 rounded-lg text-white/70 font-mono">⌘ K</kbd>
            {' '}para abrir rapidamente
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Busca Inteligente</h3>
              <p className="text-sm text-white/60">
                Encontre qualquer conteúdo usando linguagem natural
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Command className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Comandos Rápidos</h3>
              <p className="text-sm text-white/60">
                Execute ações usando comandos especiais com {'">"'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Navegação por Teclado</h3>
              <p className="text-sm text-white/60">
                Use setas, Enter e números para navegar rapidamente
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Preview Inteligente</h3>
              <p className="text-sm text-white/60">
                Visualize conteúdo e contexto antes de abrir
              </p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl backdrop-blur-sm text-left">
            <h3 className="font-semibold text-white mb-3">Dicas Rápidas:</h3>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">{'>'}</kbd>
                <span>Use {'">"}' para comandos (ex: {'>'}theme dark)</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">@</kbd>
                <span>Use "@" para mencionar pessoas</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">/</kbd>
                <span>Use "/" para filtros (ex: /today, /docs)</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">?</kbd>
                <span>Digite "?" para ver a ajuda completa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        isOpen={isOpen}
        onClose={close}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default SemanticSearch;
