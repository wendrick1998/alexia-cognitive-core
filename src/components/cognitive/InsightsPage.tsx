
import { useState } from 'react';
import { useCognitiveInsights } from '@/hooks/useCognitiveInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lightbulb, Eye, CheckCircle, Clock, Filter, Search, Sparkles, Target, Brain } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const InsightsPage = () => {
  const { insights, loading, markAsRead, markAsActedUpon } = useCognitiveInsights();
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern_detection': return <Brain className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (level: number) => {
    if (level >= 4) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (level >= 3) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (level >= 2) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'acted_upon': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || insight.status === statusFilter;
    const matchesType = typeFilter === 'all' || insight.insight_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const unreadCount = insights.filter(i => i.status === 'pending').length;
  const highPriorityCount = insights.filter(i => i.priority_level >= 3).length;
  const avgConfidence = insights.reduce((acc, i) => acc + i.confidence_score, 0) / Math.max(insights.length, 1);

  const insightTypes = [...new Set(insights.map(i => i.insight_type))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Insights Automáticos</h1>
          <p className="text-white/70">Insights gerados automaticamente pela Alex IA</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {unreadCount} não lidos
          </Badge>
          <Badge variant="secondary" className="bg-red-500/20 text-red-400">
            {highPriorityCount} alta prioridade
          </Badge>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total de Insights</p>
                <p className="text-white text-2xl font-bold">{insights.length}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Não Lidos</p>
                <p className="text-yellow-400 text-2xl font-bold">{unreadCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Alta Prioridade</p>
                <p className="text-red-400 text-2xl font-bold">{highPriorityCount}</p>
              </div>
              <Target className="w-8 h-8 text-red-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Confiança Média</p>
                <p className="text-green-400 text-2xl font-bold">
                  {(avgConfidence * 100).toFixed(0)}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <Input
                  placeholder="Buscar insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="read">Lidos</SelectItem>
                <SelectItem value="acted_upon">Implementados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {insightTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Insights */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Insights Gerados</CardTitle>
          <CardDescription className="text-white/60">
            {filteredInsights.length} insights encontrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Insight</TableHead>
                  <TableHead className="text-white/70">Tipo</TableHead>
                  <TableHead className="text-white/70">Prioridade</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Confiança</TableHead>
                  <TableHead className="text-white/70">Data</TableHead>
                  <TableHead className="text-white/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsights.map((insight) => (
                  <TableRow key={insight.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {insight.status === 'pending' && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        )}
                        <div>
                          <div className="font-medium text-white">{insight.title}</div>
                          <div className="text-white/60 text-sm line-clamp-1">
                            {insight.content.substring(0, 80)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.insight_type)}
                        <Badge variant="outline" className="text-xs">
                          {insight.insight_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(insight.priority_level)}>
                        Nível {insight.priority_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(insight.status)}>
                        {insight.status === 'pending' && 'Pendente'}
                        {insight.status === 'read' && 'Lido'}
                        {insight.status === 'acted_upon' && 'Implementado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/60">
                      {(insight.confidence_score * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell className="text-white/60">
                      {formatDistanceToNow(new Date(insight.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8"
                              onClick={() => {
                                setSelectedInsight(insight);
                                if (insight.status === 'pending') {
                                  markAsRead(insight.id);
                                }
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white flex items-center gap-2">
                                {getInsightIcon(insight.insight_type)}
                                {insight.title}
                              </DialogTitle>
                              <DialogDescription className="text-gray-300">
                                {insight.insight_type.replace('_', ' ')} • Criado em {new Date(insight.created_at).toLocaleDateString('pt-BR')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-white font-medium mb-2">Conteúdo do Insight:</h4>
                                <p className="text-gray-300 whitespace-pre-wrap">{insight.content}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-white/60">Nível de Prioridade:</span>
                                  <div className="text-white">{insight.priority_level}/5</div>
                                </div>
                                <div>
                                  <span className="text-white/60">Score de Confiança:</span>
                                  <div className="text-white">{(insight.confidence_score * 100).toFixed(1)}%</div>
                                </div>
                              </div>

                              {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                                <div>
                                  <h4 className="text-white font-medium mb-2">Metadados:</h4>
                                  <pre className="text-gray-300 bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(insight.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}

                              <div className="flex gap-2 pt-4">
                                {insight.status !== 'acted_upon' && (
                                  <Button
                                    onClick={() => markAsActedUpon(insight.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Marcar como Implementado
                                  </Button>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {insight.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(insight.id)}
                            className="h-8 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filteredInsights.length === 0 && !loading && (
        <Card className="bg-gray-900/50 border-white/10 text-center py-12">
          <CardContent>
            <Lightbulb className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">Nenhum Insight Encontrado</h3>
            <p className="text-white/60">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? "Ajuste os filtros para ver mais resultados"
                : "A Alex IA ainda não gerou insights automáticos. Continue usando o sistema!"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsightsPage;
