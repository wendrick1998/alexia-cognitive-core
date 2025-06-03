
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Package, 
  TrendingDown, 
  Settings,
  FileText,
  Image,
  Database
} from 'lucide-react';

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  filesProcessed: number;
  timesSaved: number;
}

const CompressionManager: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<CompressionStats>({
    originalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    filesProcessed: 0,
    timesSaved: 0
  });
  const [isCompressing, setIsCompressing] = useState(false);

  // Simulate compression for demo purposes
  const simulateCompression = useCallback(async () => {
    setIsCompressing(true);
    
    try {
      // Simulate processing different types of content
      const contentTypes = [
        { type: 'text', size: 1024 * 50 }, // 50KB text
        { type: 'json', size: 1024 * 30 }, // 30KB JSON
        { type: 'cache', size: 1024 * 100 }, // 100KB cache
        { type: 'images', size: 1024 * 200 } // 200KB images
      ];

      let totalOriginal = 0;
      let totalCompressed = 0;
      let filesCount = 0;

      for (const content of contentTypes) {
        // Simulate compression delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const compressionRate = content.type === 'text' ? 0.7 : 
                              content.type === 'json' ? 0.6 :
                              content.type === 'cache' ? 0.5 : 0.8;
        
        const compressed = content.size * compressionRate;
        totalOriginal += content.size;
        totalCompressed += compressed;
        filesCount++;

        setStats(prev => ({
          originalSize: totalOriginal,
          compressedSize: totalCompressed,
          compressionRatio: (1 - totalCompressed / totalOriginal) * 100,
          filesProcessed: filesCount,
          timesSaved: prev.timesSaved + Math.random() * 50 // Simulate time saved
        }));
      }

      toast({
        title: "🗜️ Compressão Concluída",
        description: `${filesCount} arquivos comprimidos com ${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}% de redução`,
      });
    } catch (error) {
      console.error('Compression simulation failed:', error);
      toast({
        title: "❌ Erro na Compressão",
        description: "Não foi possível comprimir os arquivos",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  }, [toast]);

  const clearCompressionCache = useCallback(() => {
    setStats({
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      filesProcessed: 0,
      timesSaved: 0
    });

    toast({
      title: "🗑️ Cache de Compressão Limpo",
      description: "Estatísticas resetadas com sucesso",
    });
  }, [toast]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Gerenciador de Compressão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold text-blue-600">{stats.filesProcessed}</div>
            <div className="text-xs text-blue-600">Arquivos</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingDown className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold text-green-600">
              {stats.compressionRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-green-600">Redução</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Database className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold text-purple-600">
              {formatBytes(stats.originalSize - stats.compressedSize)}
            </div>
            <div className="text-xs text-purple-600">Economizado</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Zap className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-lg font-bold text-orange-600">
              {stats.timesSaved.toFixed(0)}ms
            </div>
            <div className="text-xs text-orange-600">Tempo Poupado</div>
          </div>
        </div>

        {/* Compression Progress */}
        {isCompressing && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Comprimindo arquivos...</span>
              <Badge variant="secondary">Em andamento</Badge>
            </div>
            <Progress value={(stats.filesProcessed / 4) * 100} className="h-2" />
          </div>
        )}

        {/* Size Comparison */}
        {stats.originalSize > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Comparação de Tamanhos</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tamanho Original</span>
                <span className="text-sm font-medium">{formatBytes(stats.originalSize)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tamanho Comprimido</span>
                <span className="text-sm font-medium text-green-600">
                  {formatBytes(stats.compressedSize)}
                </span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Economia Total</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatBytes(stats.originalSize - stats.compressedSize)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compression Techniques */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Técnicas Ativas</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center">
              <Image className="w-3 h-3 mr-1" />
              Imagens WebP
            </Badge>
            <Badge variant="outline" className="justify-center">
              <FileText className="w-3 h-3 mr-1" />
              Gzip/Brotli
            </Badge>
            <Badge variant="outline" className="justify-center">
              <Database className="w-3 h-3 mr-1" />
              Cache LZ77
            </Badge>
            <Badge variant="outline" className="justify-center">
              <Settings className="w-3 h-3 mr-1" />
              Minificação
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={simulateCompression} 
            disabled={isCompressing}
            className="w-full transition-all duration-200 hover:scale-105"
            aria-label="Executar processo de compressão"
          >
            {isCompressing ? (
              <>
                <Package className="w-4 h-4 mr-2 animate-pulse" />
                Comprimindo...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Executar Compressão
              </>
            )}
          </Button>
          
          {stats.filesProcessed > 0 && (
            <Button 
              onClick={clearCompressionCache} 
              variant="outline" 
              className="w-full transition-all duration-200 hover:bg-gray-50"
              aria-label="Limpar estatísticas de compressão"
            >
              <Settings className="w-4 h-4 mr-2" />
              Limpar Estatísticas
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Compressão automática reduz uso de banda e melhora performance
        </div>
      </CardContent>
    </Card>
  );
};

export default CompressionManager;
