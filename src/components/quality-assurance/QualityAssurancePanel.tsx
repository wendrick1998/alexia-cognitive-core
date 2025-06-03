
/**
 * @description Painel de QA e validação de qualidade
 * @created_by Fase 3 - Polimento Técnico & Resiliência
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Shield, 
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useSystemMonitor } from '@/hooks/useSystemMonitor';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface QualityCheck {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastCheck: Date;
}

export function QualityAssurancePanel() {
  const { metrics, getHealthScore, unresolvedAlerts } = useSystemMonitor();
  const { optimizationLevel, getPerformanceInsights } = usePerformanceOptimization();
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // Executar verificações de qualidade
  useEffect(() => {
    const runQualityChecks = () => {
      const checks: QualityCheck[] = [
        {
          id: 'memory-usage',
          name: 'Uso de Memória',
          status: metrics.memory.percentage < 80 ? 'passed' : 
                 metrics.memory.percentage < 90 ? 'warning' : 'failed',
          description: `Memória em ${metrics.memory.percentage.toFixed(1)}%`,
          severity: metrics.memory.percentage > 90 ? 'high' : 'medium',
          lastCheck: new Date()
        },
        {
          id: 'network-latency',
          name: 'Latência de Rede',
          status: metrics.network.latency < 500 ? 'passed' : 
                 metrics.network.latency < 2000 ? 'warning' : 'failed',
          description: `${metrics.network.latency.toFixed(0)}ms de latência`,
          severity: metrics.network.latency > 2000 ? 'high' : 'medium',
          lastCheck: new Date()
        },
        {
          id: 'connection-quality',
          name: 'Qualidade da Conexão',
          status: metrics.network.connectionQuality === 'excellent' ? 'passed' :
                 metrics.network.connectionQuality === 'good' ? 'warning' : 'failed',
          description: `Conexão ${metrics.network.connectionQuality}`,
          severity: metrics.network.connectionQuality === 'offline' ? 'critical' : 'low',
          lastCheck: new Date()
        },
        {
          id: 'bundle-size',
          name: 'Tamanho do Bundle',
          status: metrics.ui.bundleSize < 1000 ? 'passed' : 
                 metrics.ui.bundleSize < 2000 ? 'warning' : 'failed',
          description: `${metrics.ui.bundleSize}KB carregados`,
          severity: 'medium',
          lastCheck: new Date()
        },
        {
          id: 'alerts-status',
          name: 'Alertas Ativos',
          status: unresolvedAlerts.length === 0 ? 'passed' :
                 unresolvedAlerts.length < 3 ? 'warning' : 'failed',
          description: `${unresolvedAlerts.length} alertas não resolvidos`,
          severity: unresolvedAlerts.length > 5 ? 'high' : 'medium',
          lastCheck: new Date()
        }
      ];

      setQualityChecks(checks);

      // Calcular pontuação geral
      const passed = checks.filter(c => c.status === 'passed').length;
      const total = checks.length;
      const score = Math.round((passed / total) * 100);
      setOverallScore(score);
    };

    runQualityChecks();
    const interval = setInterval(runQualityChecks, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, [metrics, unresolvedAlerts]);

  const getStatusIcon = (status: 'passed' | 'warning' | 'failed') => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'passed' | 'warning' | 'failed') => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
    }
  };

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const performanceInsights = getPerformanceInsights();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Quality Assurance</h2>
          <p className="text-gray-600">
            Monitoramento de qualidade e validação do sistema
          </p>
        </div>
      </div>

      {/* Score Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Score de Qualidade Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Qualidade do Sistema</span>
              <span className={`font-bold text-2xl ${
                overallScore >= 80 ? 'text-green-600' :
                overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {overallScore}%
              </span>
            </div>
            <Progress value={overallScore} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xs text-gray-500">Aprovados</div>
                <div className="font-medium">
                  {qualityChecks.filter(c => c.status === 'passed').length}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-xs text-gray-500">Avisos</div>
                <div className="font-medium">
                  {qualityChecks.filter(c => c.status === 'warning').length}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-xs text-gray-500">Falhas</div>
                <div className="font-medium">
                  {qualityChecks.filter(c => c.status === 'failed').length}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xs text-gray-500">Health Score</div>
                <div className="font-medium">{getHealthScore()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="checks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checks">Verificações</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="checks" className="mt-6">
          <div className="space-y-4">
            {qualityChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-gray-500">{check.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(check.severity)}
                      <div className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {check.lastCheck.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Insights de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Nível de Otimização</div>
                  <div className="font-medium capitalize">{performanceInsights.currentLevel}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Health Score</div>
                  <div className="font-medium">{performanceInsights.healthScore}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Uso de Memória</div>
                  <div className="font-medium">{performanceInsights.memoryUsage.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Latência</div>
                  <div className="font-medium">{performanceInsights.networkLatency.toFixed(0)}ms</div>
                </div>
              </div>
              
              {performanceInsights.recommendations.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Recomendações:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {performanceInsights.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <strong>Status Geral:</strong> {
                    overallScore >= 80 ? '🟢 Excelente' :
                    overallScore >= 60 ? '🟡 Bom' : '🔴 Necessita Atenção'
                  }
                </div>
                
                <div className="text-sm">
                  <strong>Performance:</strong> Otimização nível {performanceInsights.currentLevel}
                </div>
                
                <div className="text-sm">
                  <strong>Alertas:</strong> {unresolvedAlerts.length} não resolvidos
                </div>
                
                <div className="text-sm">
                  <strong>Recomendação:</strong> {
                    overallScore >= 80 ? 'Sistema operando dentro dos parâmetros ideais.' :
                    overallScore >= 60 ? 'Monitorar alertas de warning.' :
                    'Ação imediata requerida para melhorar performance.'
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default QualityAssurancePanel;
