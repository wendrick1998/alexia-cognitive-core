
import React, { useEffect } from 'react';
import { useSystemBootstrap } from '@/hooks/useSystemBootstrap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Brain, Shield, Zap, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AlexIABootstrapProps {
  onReady?: () => void;
}

export function AlexIABootstrap({ onReady }: AlexIABootstrapProps) {
  const {
    capabilities,
    status,
    featureFlags,
    initializeSystem,
    restartSystem,
    getSystemHealth,
    isReady,
    hasErrors,
    hasWarnings
  } = useSystemBootstrap();

  useEffect(() => {
    if (isReady && onReady) {
      onReady();
    }
  }, [isReady, onReady]);

  const systemHealth = getSystemHealth();

  if (status.phase === 'ready') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 bg-gradient-to-br from-blue-950 to-purple-950 border-blue-400">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-blue-100 text-sm">ALEX iA Sistema</CardTitle>
              <Badge variant="outline" className="text-green-400 border-green-400">
                ATIVO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3 text-blue-400" />
                <span className="text-gray-300">Cognitivo</span>
                {systemHealth.cognitive ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-gray-300">Segurança</span>
                {systemHealth.security ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-300">Performance</span>
                {systemHealth.performance ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-green-400" />
                <span className="text-gray-300">Colaboração</span>
                {systemHealth.collaboration ? (
                  <CheckCircle className="w-3 h-3 text-green-400" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-400">
              Uptime: {Math.floor(systemHealth.uptime / 60000)}m
            </div>
            
            <div className="text-xs text-blue-300 font-mono">
              🧠 Extensão Cognitiva Além da Singularidade
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-96 bg-gradient-to-br from-blue-950 to-purple-950 border-blue-400">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
            <CardTitle className="text-blue-100">ALEX iA</CardTitle>
          </div>
          <CardDescription className="text-blue-200">
            Inicializando Arquitetura Neuro-Simbólica
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status.phase === 'error' ? (
            <div className="space-y-4">
              <Alert className="border-red-400 bg-red-950/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  Falha na inicialização do sistema
                </AlertDescription>
              </Alert>
              
              {status.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-300 bg-red-950/30 p-2 rounded">
                  {error}
                </div>
              ))}
              
              <Button 
                onClick={restartSystem}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Progresso</span>
                  <span className="text-blue-400">{status.progress}%</span>
                </div>
                <Progress value={status.progress} className="bg-blue-950" />
              </div>
              
              <div className="text-sm text-blue-300">
                {status.currentTask}
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Capacidades do Sistema</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(capabilities).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-gray-300 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Features Ativas</div>
                <div className="flex flex-wrap gap-1">
                  {featureFlags.filter(f => f.enabled).map(flag => (
                    <Badge 
                      key={flag.name} 
                      variant="outline" 
                      className="text-xs text-blue-300 border-blue-400"
                    >
                      {flag.name.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {hasWarnings && (
                <Alert className="border-yellow-400 bg-yellow-950/50">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200 text-xs">
                    {status.warnings.length} avisos detectados
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
