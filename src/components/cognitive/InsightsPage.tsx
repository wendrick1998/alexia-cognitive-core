
import { useState } from 'react';
import { useCognitiveInsights } from '@/hooks/useCognitiveInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lightbulb, CheckCircle, Clock, Filter, Search, Eye, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const InsightsPage = () => {
  const { insights, loading, markAsRead, markAsActedUpon } = useCognitiveInsights();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || insight.status === statusFilter;
    const matchesType = typeFilter === 'all' || insight.insight_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'read': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'acted_upon': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-400';
    if (priority >= 3) return 'text-orange-400';
    if (priority >= 2) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const uniqueTypes = [...new Set(insights.map(i => i.insight_type))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Insights Cognitivos</h1>
          <p className="text-white/70">Insights automáticos gerados pela Alex IA</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
            {insights.filter(i => i.status === 'pending').length} novos
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {insights.length} total
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <Input
                  placeholder="Buscar insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="read">Lido</SelectItem>
                  <SelectItem value="acted_upon">Implementado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-white/70 text-sm">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Insights */}
      <Card className="bg-gray-900/50 border-white/10">
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
                  <TableHead className="text-white/70">Data</TableHead>
                  <TableHead className="text-white/70">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInsights.map((insight) => (
                  <TableRow key={insight.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          {insight.title}
                          {insight.status === 'pending' && (
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-white/60 text-sm mt-1">
                          {insight.content.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {insight.insight_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getPriorityColor(insight.priority_level)}`}>
                        Prioridade {insight.priority_level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(insight.status)}>
                        {insight.status === 'pending' && 'Pendente'}
                        {insight.status === 'read' && 'Lido'}
                        {insight.status === 'acted_upon' && 'Implementado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/60">
                      {formatDistanceToNow(new Date(insight.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {insight.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(insight.id)}
                            className="h-8"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Marcar como Lido
                          </Button>
                        )}
                        {insight.status !== 'acted_upon' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => markAsActedUpon(insight.id)}
                            className="h-8 bg-green-600 hover:bg-green-700"
                          >
                            <Target className="w-3 h-3 mr-1" />
                            Implementado
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
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Continue usando Alex IA para gerar insights automáticos'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InsightsPage;
