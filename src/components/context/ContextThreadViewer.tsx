
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, MessageSquare, Shield, Search, Filter } from 'lucide-react';
import { useContextThread, ContextNode } from '@/hooks/useContextThread';

interface ContextThreadViewerProps {
  projectId?: string;
  conversationId?: string;
}

export default function ContextThreadViewer({ projectId, conversationId }: ContextThreadViewerProps) {
  const {
    loading,
    getContextThread,
    getHighConfidenceContext,
    getSensitiveContext
  } = useContextThread();

  const [contextNodes, setContextNodes] = useState<ContextNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<ContextNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [nodeTypeFilter, setNodeTypeFilter] = useState('all');

  const loadContext = async () => {
    const nodes = await getContextThread(projectId, conversationId, 100);
    setContextNodes(nodes);
    setFilteredNodes(nodes);
  };

  const loadHighConfidenceContext = async () => {
    const nodes = await getHighConfidenceContext(projectId, conversationId, 0.7);
    setContextNodes(nodes);
    setFilteredNodes(nodes);
  };

  const loadSensitiveContext = async () => {
    const nodes = await getSensitiveContext(projectId, conversationId);
    setContextNodes(nodes);
    setFilteredNodes(nodes);
  };

  useEffect(() => {
    loadContext();
  }, [projectId, conversationId]);

  useEffect(() => {
    let filtered = contextNodes;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(node => 
        node.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.title && node.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por confiança
    if (confidenceFilter !== 'all') {
      const minConfidence = parseFloat(confidenceFilter);
      filtered = filtered.filter(node => node.global_confidence >= minConfidence);
    }

    // Filtro por tipo de nó
    if (nodeTypeFilter !== 'all') {
      filtered = filtered.filter(node => node.node_type === nodeTypeFilter);
    }

    setFilteredNodes(filtered);
  }, [contextNodes, searchTerm, confidenceFilter, nodeTypeFilter]);

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNodeTypeIcon = (type: string) => {
    const icons = {
      memory: Brain,
      conversation: MessageSquare,
      default: Brain
    };
    const Icon = icons[type as keyof typeof icons] || icons.default;
    return <Icon className="w-4 h-4" />;
  };

  const getNodeTypeBadgeColor = (type: string) => {
    const colors = {
      memory: 'bg-blue-500',
      conversation: 'bg-purple-500',
      question: 'bg-orange-500',
      answer: 'bg-green-500',
      decision: 'bg-red-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Thread de Contexto</h2>
          <p className="text-muted-foreground">
            Recuperação profunda de contexto cronológico
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="high-confidence">Alta Confiança</TabsTrigger>
          <TabsTrigger value="sensitive">Sensíveis</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar no contexto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por confiança" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as confianças</SelectItem>
              <SelectItem value="0.8">Alta (≥80%)</SelectItem>
              <SelectItem value="0.6">Média (≥60%)</SelectItem>
              <SelectItem value="0.4">Baixa (≥40%)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={nodeTypeFilter} onValueChange={setNodeTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="memory">Memórias</SelectItem>
              <SelectItem value="conversation">Conversas</SelectItem>
              <SelectItem value="question">Perguntas</SelectItem>
              <SelectItem value="answer">Respostas</SelectItem>
              <SelectItem value="decision">Decisões</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Mostrando {filteredNodes.length} de {contextNodes.length} nós de contexto
          </div>
          <ContextNodesList nodes={filteredNodes} loading={loading} />
        </TabsContent>

        <TabsContent value="high-confidence" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Contexto de alta confiança (≥70%)
            </p>
            <Button onClick={loadHighConfidenceContext} disabled={loading}>
              Carregar Alta Confiança
            </Button>
          </div>
          <ContextNodesList nodes={filteredNodes} loading={loading} />
        </TabsContent>

        <TabsContent value="sensitive" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Dados marcados como sensíveis
            </p>
            <Button onClick={loadSensitiveContext} disabled={loading}>
              Carregar Dados Sensíveis
            </Button>
          </div>
          <ContextNodesList nodes={filteredNodes} loading={loading} showSensitiveWarning />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ContextNodesListProps {
  nodes: ContextNode[];
  loading: boolean;
  showSensitiveWarning?: boolean;
}

function ContextNodesList({ nodes, loading, showSensitiveWarning }: ContextNodesListProps) {
  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNodeTypeIcon = (type: string) => {
    const icons = {
      memory: Brain,
      conversation: MessageSquare,
      default: Brain
    };
    const Icon = icons[type as keyof typeof icons] || icons.default;
    return <Icon className="w-4 h-4" />;
  };

  const getNodeTypeBadgeColor = (type: string) => {
    const colors = {
      memory: 'bg-blue-500',
      conversation: 'bg-purple-500',
      question: 'bg-orange-500',
      answer: 'bg-green-500',
      decision: 'bg-red-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Nenhum contexto encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showSensitiveWarning && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Aviso:</strong> Você está visualizando dados marcados como sensíveis. 
                Mantenha a confidencialidade adequada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {nodes.map((node) => (
        <Card key={node.node_id} className={node.is_sensitive ? 'border-yellow-500' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getNodeTypeIcon(node.node_type)}
                <CardTitle className="text-base">
                  {node.title || `${node.node_type} - ${node.context_position}`}
                </CardTitle>
                {node.is_sensitive && (
                  <Shield className="w-4 h-4 text-yellow-600" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getNodeTypeBadgeColor(node.node_type)}>
                  {node.node_type}
                </Badge>
                <Badge className={getConfidenceBadgeColor(node.global_confidence)}>
                  {Math.round(node.global_confidence * 100)}%
                </Badge>
              </div>
            </div>
            <CardDescription>
              {new Date(node.created_at).toLocaleString()} • 
              Relevância: {Math.round(node.relevance_score * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{node.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
