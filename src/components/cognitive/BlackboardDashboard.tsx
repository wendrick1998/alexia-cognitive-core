
import React, { useState, useEffect, useCallback } from 'react';
import { useBlackboardSystem } from '@/hooks/useBlackboardSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Layers, 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain
} from 'lucide-react';

const BlackboardDashboard: React.FC = () => {
  const {
    blackboardState,
    processWithBlackboard,
    addBlackboardEntry,
    getBlackboardStatus,
    isInitialized,
    isProcessing
  } = useBlackboardSystem();

  const [queryInput, setQueryInput] = useState('');
  const [processingHistory, setProcessingHistory] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const handleBlackboardProcessing = useCallback(async () => {
    if (!queryInput.trim()) return;

    const processingTask = {
      id: crypto.randomUUID(),
      input: queryInput,
      timestamp: new Date(),
      status: 'processing'
    };

    setProcessingHistory(prev => [processingTask, ...prev]);
    setQueryInput('');

    try {
      const result = await processWithBlackboard(queryInput, {
        source: 'dashboard',
        timestamp: new Date().toISOString()
      });

      const completedTask = {
        ...processingTask,
        status: result.success ? 'completed' : 'failed',
        result,
        duration: result.totalProcessingTime
      };

      setProcessingHistory(prev => 
        prev.map(task => task.id === processingTask.id ? completedTask : task)
      );

    } catch (error) {
      const failedTask = {
        ...processingTask,
        status: 'failed',
        error: error.message,
        duration: Date.now() - processingTask.timestamp.getTime()
      };

      setProcessingHistory(prev => 
        prev.map(task => task.id === processingTask.id ? failedTask : task)
      );
    }
  }, [queryInput, processWithBlackboard]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const getEntryTypeColor = useCallback((agentType: string) => {
    const colors = {
      'analytical': 'bg-blue-100 text-blue-800',
      'creative': 'bg-purple-100 text-purple-800', 
      'technical': 'bg-green-100 text-green-800',
      'integration': 'bg-orange-100 text-orange-800',
      'memory': 'bg-pink-100 text-pink-800',
      'search': 'bg-cyan-100 text-cyan-800'
    };
    return colors[agentType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }, []);

  const renderBlackboardEntries = useCallback(() => {
    return (
      <div className="space-y-2">
        {blackboardState.entries.slice(0, 10).map(entry => (
          <Card 
            key={entry.id}
            className={`border cursor-pointer transition-all ${
              selectedEntry === entry.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getEntryTypeColor(entry.agentType)}>
                    {entry.agentType}
                  </Badge>
                  <span className="text-sm font-medium">
                    Priority {entry.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(entry.status)}
                  <span className="text-xs text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Confidence: {(entry.confidence * 100).toFixed(0)}%
                </span>
                <Progress value={entry.confidence * 100} className="w-16 h-2" />
              </div>
              
              {entry.dependencies.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Dependencies: {entry.dependencies.length}
                </div>
              )}
              
              {selectedEntry === entry.id && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <pre className="whitespace-pre-wrap text-gray-700">
                    {JSON.stringify(entry.content, null, 2).substring(0, 300)}...
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [blackboardState.entries, selectedEntry, getEntryTypeColor, getStatusIcon]);

  const renderProcessingHistory = useCallback(() => {
    return (
      <div className="space-y-3">
        {processingHistory.slice(0, 5).map(task => (
          <Card key={task.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">
                    {task.input.substring(0, 80)}...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{task.timestamp.toLocaleTimeString()}</span>
                    {task.duration && (
                      <>
                        <span>•</span>
                        <span>{task.duration}ms</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <Badge variant={
                    task.status === 'completed' ? 'default' :
                    task.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {task.status}
                  </Badge>
                </div>
              </div>
              
              {task.result && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Quality Score:</span>
                    <Badge variant="outline">
                      {(task.result.qualityScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  {task.result.agentContributions && (
                    <div className="text-xs">
                      <span className="font-medium">Agents Used: </span>
                      {task.result.agentContributions.map((contrib: any) => contrib.agent).join(', ')}
                    </div>
                  )}
                  
                  {task.result.synthesizedInsights && task.result.synthesizedInsights.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium">Insights: </span>
                      {task.result.synthesizedInsights.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              )}
              
              {task.error && (
                <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                  <span className="font-medium text-red-700">Error: </span>
                  <span className="text-red-600">{task.error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [processingHistory, getStatusIcon]);

  const renderKnowledgeSources = useCallback(() => {
    return (
      <div className="space-y-2">
        {blackboardState.knowledgeSources.slice(0, 8).map(source => (
          <Card key={source.id} className="border border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {source.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm">
                    {source.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Relevance: {(source.relevance * 100).toFixed(0)}%</span>
                  <span>•</span>
                  <span>{source.lastAccessed.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [blackboardState.knowledgeSources]);

  const status = getBlackboardStatus();

  return (
    <div className="space-y-6">
      {/* Blackboard Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Blackboard System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {status.totalEntries}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {status.activeAgents.length}
              </div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {status.knowledgeSourcesCount}
              </div>
              <div className="text-sm text-gray-600">Knowledge Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {status.queueLength}
              </div>
              <div className="text-sm text-gray-600">Queue Length</div>
            </div>
          </div>
          
          {!isInitialized && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Blackboard system is initializing...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Cooperative Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter a complex task for multi-agent cooperative processing..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              rows={3}
              disabled={!isInitialized || isProcessing}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {queryInput.length}/1000 characters
              </div>
              <Button
                onClick={handleBlackboardProcessing}
                disabled={!queryInput.trim() || !isInitialized || isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Process with Blackboard
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blackboard Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Blackboard Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blackboardState.entries.length > 0 ? (
            renderBlackboardEntries()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No blackboard entries yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Processing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processingHistory.length > 0 ? (
            renderProcessingHistory()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No processing history yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Knowledge Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blackboardState.knowledgeSources.length > 0 ? (
            renderKnowledgeSources()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No knowledge sources loaded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlackboardDashboard;
