
import React, { useState, useCallback } from 'react';
import { useNeuralSystem } from '@/hooks/useNeuralSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Clock, Zap, TrendingUp, Archive, AlertCircle } from 'lucide-react';

const MemoryConsolidationPanel: React.FC = () => {
  const {
    memoryConsolidations,
    isProcessing,
    consolidateMemory
  } = useNeuralSystem();

  const [consolidationType, setConsolidationType] = useState<'automatic' | 'manual'>('automatic');

  const handleConsolidation = useCallback(async () => {
    const result = await consolidateMemory(consolidationType);
    if (result) {
      console.log('✅ Memory consolidation completed:', result);
    }
  }, [consolidateMemory, consolidationType]);

  const getQualityColor = useCallback((quality: number) => {
    if (quality >= 0.8) return 'text-green-600';
    if (quality >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getQualityBadge = useCallback((quality: number) => {
    if (quality >= 0.8) return 'default';
    if (quality >= 0.6) return 'secondary';
    return 'destructive';
  }, []);

  const renderConsolidationStats = useCallback(() => {
    if (memoryConsolidations.length === 0) return null;

    const totalNodes = memoryConsolidations.reduce((sum, c) => sum + c.nodes_processed, 0);
    const avgQuality = memoryConsolidations.reduce((sum, c) => sum + c.consolidation_quality, 0) / memoryConsolidations.length;
    const lastConsolidation = memoryConsolidations[0];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{memoryConsolidations.length}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalNodes}</div>
            <div className="text-sm text-gray-600">Nodes Processed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getQualityColor(avgQuality)}`}>
              {(avgQuality * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Avg Quality</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {lastConsolidation ? new Date(lastConsolidation.completed_at).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Last Session</div>
          </CardContent>
        </Card>
      </div>
    );
  }, [memoryConsolidations, getQualityColor]);

  const renderConsolidationHistory = useCallback(() => {
    return (
      <div className="space-y-3">
        {memoryConsolidations.slice(0, 10).map((consolidation) => (
          <Card key={consolidation.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="font-medium capitalize">
                    {consolidation.session_type} Consolidation
                  </span>
                </div>
                <Badge variant={getQualityBadge(consolidation.consolidation_quality)}>
                  {(consolidation.consolidation_quality * 100).toFixed(0)}% Quality
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Nodes Processed:</span>
                  <span className="font-mono">{consolidation.nodes_processed}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Quality Score:</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={consolidation.consolidation_quality * 100} 
                      className="w-16 h-2" 
                    />
                    <span className="font-mono">
                      {(consolidation.consolidation_quality * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-mono">
                    {new Date(consolidation.completed_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [memoryConsolidations, getQualityBadge]);

  const renderConsolidationTrends = useCallback(() => {
    if (memoryConsolidations.length < 2) return null;

    // Calculate trends
    const recentConsolidations = memoryConsolidations.slice(0, 5);
    const avgRecentQuality = recentConsolidations.reduce((sum, c) => sum + c.consolidation_quality, 0) / recentConsolidations.length;
    const avgRecentNodes = recentConsolidations.reduce((sum, c) => sum + c.nodes_processed, 0) / recentConsolidations.length;

    const qualityTrend = recentConsolidations.length >= 2 ? 
      recentConsolidations[0].consolidation_quality - recentConsolidations[1].consolidation_quality : 0;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Consolidation Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-lg font-bold ${getQualityColor(avgRecentQuality)}`}>
                {(avgRecentQuality * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Recent Avg Quality</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {avgRecentNodes.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Avg Nodes/Session</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                qualityTrend > 0 ? 'text-green-600' : qualityTrend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {qualityTrend > 0 ? '↗' : qualityTrend < 0 ? '↘' : '→'}
                {Math.abs(qualityTrend * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Quality Trend</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [memoryConsolidations, getQualityColor]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Memory Consolidation Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <select
                value={consolidationType}
                onChange={(e) => setConsolidationType(e.target.value as 'automatic' | 'manual')}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                disabled={isProcessing}
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            
            <Button
              onClick={handleConsolidation}
              disabled={isProcessing}
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
                  Start Consolidation
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">About Memory Consolidation</p>
                <p>
                  Memory consolidation transfers important information from working memory to long-term storage, 
                  strengthening neural connections and improving recall. Higher quality scores indicate better 
                  pattern recognition and knowledge integration.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {renderConsolidationStats()}

      {/* Trends */}
      {renderConsolidationTrends()}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Consolidation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memoryConsolidations.length > 0 ? (
            renderConsolidationHistory()
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No consolidation history available</p>
              <p className="text-xs text-gray-400 mt-1">
                Start a consolidation session to see results here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Processing Indicator */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-medium text-blue-800">Memory Consolidation in Progress</p>
                <p className="text-sm text-blue-600">
                  Processing cognitive nodes and strengthening neural pathways...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemoryConsolidationPanel;
