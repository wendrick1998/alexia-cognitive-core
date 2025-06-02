
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';
import { useMemoryValidation } from '@/hooks/useMemoryValidation';
import { useToast } from '@/hooks/use-toast';

export default function MemoryValidationDashboard() {
  const { 
    loading,
    getMemoryInconsistencies,
    getValidationLogs,
    getMemoryConfidenceScores,
    markMemorySensitive,
    validateMemoryConsistency
  } = useMemoryValidation();
  
  const { toast } = useToast();
  const [inconsistencies, setInconsistencies] = useState<any[]>([]);
  const [validationLogs, setValidationLogs] = useState<any[]>([]);
  const [confidenceScores, setConfidenceScores] = useState<any[]>([]);

  const loadData = async () => {
    const [inconsData, logsData, scoresData] = await Promise.all([
      getMemoryInconsistencies(),
      getValidationLogs(),
      getMemoryConfidenceScores()
    ]);
    
    setInconsistencies(inconsData);
    setValidationLogs(logsData);
    setConfidenceScores(scoresData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleValidateMemory = async (memoryId: string) => {
    const result = await validateMemoryConsistency(memoryId);
    if (result) {
      await loadData();
    }
  };

  const handleToggleSensitive = async (memoryId: string, currentStatus: boolean) => {
    const success = await markMemorySensitive(memoryId, !currentStatus);
    if (success) {
      await loadData();
    }
  };

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getValidationStatusBadge = (status: string) => {
    const colors = {
      reliable: 'bg-green-500',
      needs_review: 'bg-yellow-500',
      unreliable: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Validação de Memórias</h2>
          <p className="text-muted-foreground">
            Sistema de verificação multi-camadas e prevenção de alucinações
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="inconsistencies">Inconsistências</TabsTrigger>
          <TabsTrigger value="confidence">Confiabilidade</TabsTrigger>
          <TabsTrigger value="logs">Logs de Validação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inconsistências Detectadas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inconsistencies.length}</div>
                <p className="text-xs text-muted-foreground">
                  Memórias com divergências entre versões
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {confidenceScores.length > 0 
                    ? Math.round(confidenceScores.reduce((acc, item) => acc + item.global_confidence_score, 0) / confidenceScores.length * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Score global de confiabilidade
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dados Sensíveis</CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {confidenceScores.filter(item => item.is_sensitive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Memórias marcadas como sensíveis
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inconsistencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inconsistências Detectadas</CardTitle>
              <CardDescription>
                Memórias com divergências significativas entre versões
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inconsistencies.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma inconsistência detectada
                </p>
              ) : (
                <div className="space-y-4">
                  {inconsistencies.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.title || 'Sem título'}</h4>
                        <Badge variant="destructive">
                          Similaridade: {Math.round(item.content_similarity_score * 100)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Conteúdo Atual:</p>
                          <p className="mt-1 truncate">{item.current_content}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Versão {item.version_number}:</p>
                          <p className="mt-1 truncate">{item.version_content}</p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleValidateMemory(item.id)}
                          disabled={loading}
                        >
                          Validar Memória
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scores de Confiabilidade</CardTitle>
              <CardDescription>
                Ranking de memórias por nível de confiança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {confidenceScores.slice(0, 20).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.title || 'Sem título'}</h4>
                        {item.is_sensitive && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceBadgeColor(item.global_confidence_score)}>
                        {Math.round(item.global_confidence_score * 100)}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleSensitive(item.id, item.is_sensitive)}
                      >
                        {item.is_sensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Validação</CardTitle>
              <CardDescription>
                Histórico de validações e verificações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validationLogs.slice(0, 50).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.validation_type}</Badge>
                        <Badge className={getValidationStatusBadge(log.validation_result)}>
                          {log.validation_result}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Confiança: {Math.round(log.confidence_score * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
