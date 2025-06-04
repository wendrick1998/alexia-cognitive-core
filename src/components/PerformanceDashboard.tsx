
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LLMMetricsDashboard from '@/components/dashboard/LLMMetricsDashboard';

const PerformanceDashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Performance Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitoramento e análise de performance do sistema
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Métricas do Sistema LLM</CardTitle>
            <CardDescription>
              Análise detalhada do desempenho dos modelos de linguagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LLMMetricsDashboard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
