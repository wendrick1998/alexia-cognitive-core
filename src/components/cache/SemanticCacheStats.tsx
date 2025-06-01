
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Zap, Database, Clock, TrendingUp } from 'lucide-react';
import SemanticCache from '@/services/SemanticCache';
import { useAuth } from '@/hooks/useAuth';

interface CacheStats {
  totalItems: number;
  totalHits: number;
  hitRate: number;
  averageTokensSaved: number;
}

export function SemanticCacheStats() {
  const [stats, setStats] = useState<CacheStats>({
    totalItems: 0,
    totalHits: 0,
    hitRate: 0,
    averageTokensSaved: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadStats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const cache = new SemanticCache({ userId: user.id });
      const newStats = await cache.getCacheStats();
      setStats(newStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do cache:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do cache",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupCache = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const cache = new SemanticCache({ userId: user.id });
      const deletedCount = await cache.cleanupExpiredCache();
      
      toast({
        title: "Cache limpo",
        description: `${deletedCount} itens expirados foram removidos`,
      });
      
      // Recarregar estatísticas
      await loadStats();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o cache",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  const hitRatePercentage = Math.round(stats.hitRate * 100);
  const tokensSaved = Math.round(stats.averageTokensSaved);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Cache Semântico</CardTitle>
          <CardDescription>
            Performance e estatísticas do sistema de cache
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={cleanupCache}
            disabled={isLoading}
          >
            <Database className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hit Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Taxa de Acerto</span>
            </div>
            <Badge variant={hitRatePercentage > 70 ? "default" : "secondary"}>
              {hitRatePercentage}%
            </Badge>
          </div>
          <Progress value={hitRatePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.totalHits} acertos de {stats.totalItems} consultas
          </p>
        </div>

        {/* Tokens Saved */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Tokens Economizados</span>
            </div>
            <Badge variant="outline">
              {tokensSaved.toLocaleString()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Média por resposta em cache
          </p>
        </div>

        {/* Cache Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Itens no Cache</span>
            </div>
            <Badge variant="outline">
              {stats.totalItems}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Respostas armazenadas para reutilização
          </p>
        </div>

        {/* Performance Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Status do Sistema</span>
            <Badge 
              variant={hitRatePercentage > 50 ? "default" : "secondary"}
              className="ml-auto"
            >
              {hitRatePercentage > 70 ? 'Excelente' : 
               hitRatePercentage > 50 ? 'Bom' : 
               hitRatePercentage > 20 ? 'Regular' : 'Iniciando'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {hitRatePercentage > 70 ? 
              'Cache funcionando perfeitamente, respostas rápidas' :
              hitRatePercentage > 50 ?
              'Cache eficiente, boa performance' :
              'Cache sendo construído, performance melhorará com o uso'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
