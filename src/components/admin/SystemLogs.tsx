
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: string;
  message: string;
  details?: any;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Mock data - em produção, isso viria de uma API
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'AUTH',
      message: 'Usuário logado com sucesso',
      details: { userId: 'user123', email: 'usuario@exemplo.com' }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: 'warning',
      category: 'LLM',
      message: 'Fallback ativado para modelo GPT-4',
      details: { originalModel: 'gpt-4', fallbackModel: 'claude-3' }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: 'error',
      category: 'DATABASE',
      message: 'Falha na conexão com banco de dados',
      details: { error: 'Connection timeout', retries: 3 }
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      level: 'debug',
      category: 'CACHE',
      message: 'Cache invalidado para chave semantic-search',
      details: { cacheKey: 'semantic-search-user123' }
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      level: 'info',
      category: 'MEMORY',
      message: 'Consolidação de memória executada',
      details: { nodesProcessed: 47, connectionsStrengthened: 12 }
    }
  ];

  useEffect(() => {
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel]);

  const refreshLogs = () => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      setLogs([...mockLogs]);
      setLoading(false);
    }, 1000);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'debug':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'default';
      case 'debug':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="h-full overflow-y-auto scroll-container premium-scrollbar">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Logs do Sistema</h1>
            <p className="text-white/60">Monitore atividades e eventos do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportLogs} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={refreshLogs} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Buscar nos logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedLevel === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedLevel === 'error' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('error')}
                  size="sm"
                >
                  Erros
                </Button>
                <Button
                  variant={selectedLevel === 'warning' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('warning')}
                  size="sm"
                >
                  Avisos
                </Button>
                <Button
                  variant={selectedLevel === 'info' ? 'default' : 'outline'}
                  onClick={() => setSelectedLevel('info')}
                  size="sm"
                >
                  Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Entradas de Log</CardTitle>
            <CardDescription>
              {filteredLogs.length} de {logs.length} entradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getLevelBadgeVariant(log.level) as any}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{log.category}</Badge>
                            <span className="text-sm text-white/60">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-white font-medium">{log.message}</p>
                          {log.details && (
                            <details className="mt-2">
                              <summary className="text-sm text-white/60 cursor-pointer hover:text-white">
                                Ver detalhes
                              </summary>
                              <pre className="mt-2 p-2 bg-black/20 rounded text-xs text-white/80 overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredLogs.length === 0 && (
                  <div className="text-center py-12 text-white/60">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum log encontrado com os filtros aplicados</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemLogs;
