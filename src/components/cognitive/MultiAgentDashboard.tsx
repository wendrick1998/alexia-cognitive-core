
import React, { useState, useCallback } from 'react';
import { useCognitiveOrchestrator } from '@/hooks/useCognitiveOrchestrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Users, Zap, TrendingUp, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

const MultiAgentDashboard: React.FC = () => {
  const {
    agents,
    orchestrateCognitiveProcess,
    analyzeIntention,
    processing
  } = useCognitiveOrchestrator();

  const [taskInput, setTaskInput] = useState('');
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<'automatic' | 'manual'>('automatic');

  const handleTaskExecution = useCallback(async () => {
    if (!taskInput.trim()) return;

    const task = {
      id: crypto.randomUUID(),
      input: taskInput,
      timestamp: new Date(),
      status: 'processing',
      selectedAgents: executionMode === 'manual' ? selectedAgents : []
    };

    setCurrentTask(task);
    setTaskInput('');

    try {
      const result = await orchestrateCognitiveProcess(
        taskInput,
        { 
          mode: executionMode,
          preferredAgents: selectedAgents.length > 0 ? selectedAgents : undefined
        }
      );

      const completedTask = {
        ...task,
        status: result.success ? 'completed' : 'failed',
        result,
        duration: Date.now() - task.timestamp.getTime()
      };

      setTaskHistory(prev => [completedTask, ...prev.slice(0, 9)]);
      setCurrentTask(null);

    } catch (error) {
      const failedTask = {
        ...task,
        status: 'failed',
        error: error.message,
        duration: Date.now() - task.timestamp.getTime()
      };

      setTaskHistory(prev => [failedTask, ...prev.slice(0, 9)]);
      setCurrentTask(null);
    }
  }, [taskInput, orchestrateCognitiveProcess, executionMode, selectedAgents]);

  const toggleAgentSelection = useCallback((agentName: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentName) 
        ? prev.filter(name => name !== agentName)
        : [...prev, agentName]
    );
  }, []);

  const getAgentStatusIcon = useCallback((agent: any) => {
    if (!agent.available) return <XCircle className="w-4 h-4 text-red-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  }, []);

  const renderAgentGrid = useCallback(() => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <Card 
            key={agent.name}
            className={`cursor-pointer transition-all ${
              selectedAgents.includes(agent.name) && executionMode === 'manual'
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => executionMode === 'manual' && toggleAgentSelection(agent.name)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {agent.description.split(' - ')[0]}
                </CardTitle>
                {getAgentStatusIcon(agent)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-600 mb-3">
                {agent.description.split(' - ')[1]}
              </p>
              <div className="flex flex-wrap gap-1">
                {agent.specialization.slice(0, 3).map(spec => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec.replace('-', ' ')}
                  </Badge>
                ))}
                {agent.specialization.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{agent.specialization.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [agents, selectedAgents, executionMode, toggleAgentSelection, getAgentStatusIcon]);

  const renderTaskHistory = useCallback(() => {
    return (
      <div className="space-y-3">
        {taskHistory.map(task => (
          <Card key={task.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">
                    {task.input.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(task.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{task.duration}ms</span>
                  </div>
                </div>
                <Badge variant={
                  task.status === 'completed' ? 'default' :
                  task.status === 'failed' ? 'destructive' : 'secondary'
                }>
                  {task.status}
                </Badge>
              </div>
              
              {task.result && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Result:</span>
                    <Badge variant="outline" className="text-xs">
                      Quality: {(task.result.qualityScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-gray-700">
                    {typeof task.result.result === 'object' 
                      ? task.result.result.message || JSON.stringify(task.result.result).substring(0, 100)
                      : task.result.result.toString().substring(0, 100)
                    }...
                  </p>
                  {task.result.insights && task.result.insights.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Insights: </span>
                      {task.result.insights.slice(0, 2).join(', ')}
                      {task.result.insights.length > 2 && '...'}
                    </div>
                  )}
                </div>
              )}
              
              {task.error && (
                <div className="mt-3 p-2 bg-red-50 rounded text-xs">
                  <span className="font-medium text-red-700">Error: </span>
                  <span className="text-red-600">{task.error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [taskHistory]);

  return (
    <div className="space-y-6">
      {/* Task Execution Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Multi-Agent Task Execution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Mode:</label>
                <select
                  value={executionMode}
                  onChange={(e) => setExecutionMode(e.target.value as 'automatic' | 'manual')}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  disabled={processing}
                >
                  <option value="automatic">Automatic Agent Selection</option>
                  <option value="manual">Manual Agent Selection</option>
                </select>
              </div>
              
              {executionMode === 'manual' && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedAgents.length} agents
                </div>
              )}
            </div>
            
            <Textarea
              placeholder="Describe the task you want the AI agents to work on..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              rows={3}
              disabled={processing}
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {taskInput.length}/1000 characters
              </div>
              <Button
                onClick={handleTaskExecution}
                disabled={!taskInput.trim() || processing}
                className="flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Execute Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Task Status */}
      {currentTask && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-medium text-blue-800">Task in Progress</p>
                <p className="text-sm text-blue-600">
                  {currentTask.input.substring(0, 80)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Available Agents
            {executionMode === 'manual' && (
              <Badge variant="outline" className="ml-2">
                Click to select
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderAgentGrid()}
        </CardContent>
      </Card>

      {/* Task History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Task History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskHistory.length > 0 ? (
            renderTaskHistory()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks executed yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Execute a task to see results here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {agents.length}
            </div>
            <div className="text-sm text-gray-600">Total Agents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.available).length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {taskHistory.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {taskHistory.length > 0 
                ? (taskHistory.reduce((sum, t) => sum + (t.result?.qualityScore || 0), 0) / taskHistory.length * 100).toFixed(0)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Avg Quality</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiAgentDashboard;
