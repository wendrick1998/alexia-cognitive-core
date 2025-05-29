
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Brain } from 'lucide-react';
import SearchCommandBar from './search/SearchCommandBar';

const SemanticSearch = () => {
  const [showCommandBar, setShowCommandBar] = useState(false);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <Brain className="h-24 w-24 text-blue-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Busca Inteligente
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Encontre qualquer informação em seus documentos, conversas e memórias 
              usando inteligência artificial avançada
            </p>
          </div>

          {/* Main Search Button */}
          <Button 
            onClick={() => setShowCommandBar(true)}
            size="lg"
            className="px-8 py-4 text-lg h-auto mb-4"
          >
            <Search className="w-6 h-6 mr-3" />
            Buscar agora
          </Button>

          {/* Keyboard Hint */}
          <div className="text-sm text-gray-500">
            Ou pressione{' '}
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">⌘ K</kbd>
            {' '}para buscar rapidamente
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Busca Semântica</h3>
              <p className="text-sm text-gray-600">
                Encontra documentos pelo significado, não apenas palavras-chave
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Busca Híbrida</h3>
              <p className="text-sm text-gray-600">
                Combina múltiplas técnicas para resultados mais precisos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Busca por Voz</h3>
              <p className="text-sm text-gray-600">
                Fale sua pergunta e encontre respostas instantaneamente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Command Bar */}
      <SearchCommandBar 
        isOpen={showCommandBar}
        onClose={() => setShowCommandBar(false)}
      />
    </div>
  );
};

export default SemanticSearch;
