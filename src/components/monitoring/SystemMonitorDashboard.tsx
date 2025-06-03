
/**
 * @description Dashboard de monitoramento do sistema
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MemoryStick,
  Zap,
  Globe,
  Monitor,
  X
} from 'lucide-react';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';

export function SystemMonitorDashboard() {
  const { 
    metrics, 
    alerts, 
    isConnected, 
    resolveAlert, 
    clearResolvedAlerts,
    getHealthScore,
    getSystemStatus,
    unresolvedAlerts
  } = useSystemMonitor();

  const healthScore = getHealthScore();
  const systemStatus = getSystemStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={getStatusColor(systemStatus)}>
              {getStatusIcon(systemStatus)}
            </div>
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Health Score</span>
              <span className={`font-bold ${getStatusColor(systemStatus)}`}>
                {healthScore}/100
              </span>
            </div>
            <Progress value={healthScore} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500">Conexão</div>
                <div className="font-medium">{isConnected ? 'Online' : 'Offline'}</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <MemoryStick className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xs text-gray-500">Memória</div>
                <div className="font-medium">{metrics.memory.percentage.toFixed(1)}%</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xs text-gray-500">Latência</div>
                <div className="font-medium">{metrics.network.latency.toFixed(0)}ms</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Monitor className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-xs text-gray-500">Bundle</div>
                <div className="font-medium">{metrics.ui.bundleSize}KB</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Recentes */}
      {unresolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Alertas Ativos ({unresolvedAlerts.length})
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearResolvedAlerts}
              >
                Limpar Resolvidos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unresolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'high' ? 'text-orange-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div>
                      <div className="text-sm font-medium">{alert.message}</div>
                      <div className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMetricsDetails = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Memória */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="w-5 h-5" />
            Memória
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uso Atual</span>
              <span>{metrics.memory.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.memory.percentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Usado</div>
              <div className="font-medium">{formatBytes(metrics.memory.used)}</div>
            </div>
            <div>
              <div className="text-gray-500">Total</div>
              <div className="font-medium">{formatBytes(metrics.memory.total)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tempo de Resposta</span>
              <span className="font-medium">{metrics.performance.responseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tempo de Renderização</span>
              <span className="font-medium">{metrics.ui.renderTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Chunks Carregados</span>
              <span className="font-medium">{metrics.ui.chunksLoaded}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rede */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Rede
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Latência</span>
              <span className="font-medium">{metrics.network.latency.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Qualidade</span>
              <Badge variant={
                metrics.network.connectionQuality === 'excellent' ? 'default' :
                metrics.network.connectionQuality === 'good' ? 'secondary' :
                'destructive'
              }>
                {metrics.network.connectionQuality}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Bundle Size</span>
              <span className="font-medium">{metrics.ui.bundleSize} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Chunks</span>
              <span className="font-medium">{metrics.ui.chunksLoaded}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Render Time</span>
              <span className="font-medium">{metrics.ui.renderTime.toFixed(0)}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlertHistory = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum alerta</h3>
              <p className="text-gray-500">Sistema operando normalmente</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card key={alert.id} className={alert.resolved ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'high' ? 'text-orange-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' :
                        alert.severity === 'high' ? 'destructive' :
                        alert.severity === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {alert.severity}
                      </Badge>
                      {alert.resolved && (
                        <Badge variant="outline">Resolvido</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {!alert.resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Monitor do Sistema</h2>
          <p className="text-gray-600">
            Observabilidade e métricas em tempo real
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-6">
          {renderMetricsDetails()}
        </TabsContent>
        
        <TabsContent value="alerts" className="mt-6">
          {renderAlertHistory()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemMonitorDashboard;
