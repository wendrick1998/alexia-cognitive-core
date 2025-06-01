
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Zap, Network } from 'lucide-react';

interface ProcessingVisualizationProps {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  document: {
    title: string;
    type: string;
  };
}

const ProcessingVisualization = ({
  isProcessing,
  progress,
  currentStep,
  document
}: ProcessingVisualizationProps) => {
  if (!isProcessing) return null;

  return (
    <Card className="mb-6 overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              🧠 Processando RAG
            </h3>
            <p className="text-sm text-gray-600">
              {document.title}
            </p>
          </div>
          
          {/* Neural Animation */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
              <Brain className="w-6 h-6 text-purple-500 animate-bounce" />
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-green-500 animate-pulse"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
            </div>
            
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStep}
            </span>
            <span className="text-sm text-gray-500">
              {progress}%
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
          />
        </div>

        {/* Processing Steps */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Zap className={`w-3 h-3 ${progress > 20 ? 'text-green-500' : 'text-gray-400'}`} />
            <span>Extração</span>
          </div>
          <div className="flex items-center gap-1">
            <Network className={`w-3 h-3 ${progress > 50 ? 'text-green-500' : 'text-gray-400'}`} />
            <span>Chunking</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className={`w-3 h-3 ${progress > 80 ? 'text-green-500' : 'text-gray-400'}`} />
            <span>Embeddings</span>
          </div>
        </div>

        {/* Current Page Info */}
        {document.type.toLowerCase() === 'pdf' && (
          <div className="mt-3 p-2 bg-white/50 rounded text-center">
            <span className="text-sm text-blue-700 font-medium">
              📄 Entendendo página 3 de 10...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingVisualization;
