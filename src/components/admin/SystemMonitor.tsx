
/**
 * @file SystemMonitor.tsx
 * @description Componente para monitoramento do sistema Alex iA
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMultiLLM } from '@/hooks/useMultiLLM';
import { useSecurity } from '@/hooks/useSecurity';
import { Activity, Shield, Zap, Database, AlertTriangle } from 'lucide-react';

const SystemMonitor = () => {
  const { providerStats } = useMultiLLM();
  const { securityStats } = useSecurity();
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    // Calcular saúde geral do sistema
    const availableProviders = providerStats.filter(p => p.isAvailable).length;
    const totalProviders = providerStats.length;
    const availability = (availableProviders / totalProviders) * 100;

    if (availability < 50) {
      setSystemHealth('critical');
    } else if (availability < 80) {
      setSystemHealth('warning');
    } else {
      setSystemHealth('healthy');
    }
  }, [providerStats]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthBadgeVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {/* Status Geral do Sistema */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
          <Activity className={`h-4 w-4 ${getHealthColor(systemHealth)}`} />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold capitalize">{systemHealth}</div>
            <Badge variant={getHealthBadgeVariant(systemHealth)}>
              {systemHealth === 'healthy' && 'Saudável'}
              {systemHealth === 'warning' && 'Atenção'}
              {systemHealth === 'critical' && 'Crítico'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sistema operacional e monitorado
          </p>
        </CardContent>
      </Card>

      {/* Provedores LLM */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Provedores LLM</CardTitle>
          <Zap className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {providerStats.filter(p => p.isAvailable).length}/{providerStats.length}
          </div>
          <p className="text-xs text-muted-foreground">
            Provedores disponíveis
          </p>
          <div className="mt-2 space-y-1">
            {providerStats.slice(0, 3).map((provider) => (
              <div key={provider.id} className="flex items-center justify-between text-xs">
                <span>{provider.name.split(' ')[0]}</span>
                <Badge variant={provider.isAvailable ? 'default' : 'destructive'} className="text-xs">
                  {provider.isAvailable ? 'ON' : 'OFF'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Segurança</CardTitle>
          <Shield className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {securityStats?.securityEvents || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Eventos de segurança (últimas 24h)
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-xs">
              <span>Sessões ativas</span>
              <span>{securityStats?.activeSessions || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Rate limits</span>
              <span>{securityStats?.activeRateLimits || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <Database className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs">
                <span>Tempo de resposta médio</span>
                <span>
                  {Math.round(
                    providerStats.reduce((acc, p) => acc + p.responseTime, 0) / 
                    providerStats.length
                  )}ms
                </span>
              </div>
              <Progress 
                value={Math.min(
                  (2000 - (providerStats.reduce((acc, p) => acc + p.responseTime, 0) / providerStats.length)) / 20,
                  100
                )} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs">
                <span>Confiabilidade</span>
                <span>
                  {Math.round(
                    (providerStats.reduce((acc, p) => acc + p.reliability, 0) / 
                    providerStats.length) * 100
                  )}%
                </span>
              </div>
              <Progress 
                value={
                  (providerStats.reduce((acc, p) => acc + p.reliability, 0) / 
                  providerStats.length) * 100
                } 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitor;
