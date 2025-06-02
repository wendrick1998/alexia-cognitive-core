
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  Settings
} from 'lucide-react';

const InteractiveGuide = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      id: 'step-1',
      title: 'Configuração Inicial',
      description: 'Configure sua conta e preferências básicas',
      category: 'Básico',
      duration: '5 min',
      steps: [
        'Acesse as configurações do sistema',
        'Configure seu perfil de usuário',
        'Defina suas preferências de notificação',
        'Configure integraçõesde terceiros'
      ]
    },
    {
      id: 'step-2',
      title: 'Dashboard Unificado',
      description: 'Aprenda a usar o centro de comando principal',
      category: 'Interface',
      duration: '10 min',
      steps: [
        'Navegue pelas diferentes abas',
        'Personalize widgets do dashboard',
        'Configure métricas importantes',
        'Use filtros e visualizações'
      ]
    },
    {
      id: 'step-3',
      title: 'Sistema de Aprendizado',
      description: 'Configure o aprendizado autônomo da IA',
      category: 'IA',
      duration: '15 min',
      steps: [
        'Ative o aprendizado contínuo',
        'Configure padrões de comportamento',
        'Defina metas de aprendizado',
        'Monitore o progresso'
      ]
    },
    {
      id: 'step-4',
      title: 'Colaboração Multi-Agente',
      description: 'Configure agentes especializados',
      category: 'Avançado',
      duration: '20 min',
      steps: [
        'Crie novos agentes especializados',
        'Configure workflows de colaboração',
        'Monitore performance dos agentes',
        'Otimize distribuição de tarefas'
      ]
    },
    {
      id: 'step-5',
      title: 'Otimização de Performance',
      description: 'Configure cache e otimizações do sistema',
      category: 'Performance',
      duration: '12 min',
      steps: [
        'Configure estratégias de cache',
        'Monitore métricas de performance',
        'Aplique otimizações recomendadas',
        'Configure alertas de performance'
      ]
    }
  ];

  const features = [
    {
      name: 'Dashboard Unificado',
      description: 'Centro de comando com todas as informações importantes',
      status: 'available',
      docs: '/unified-dashboard'
    },
    {
      name: 'Aprendizado Autônomo',
      description: 'IA que aprende continuamente com suas interações',
      status: 'available',
      docs: '/learning'
    },
    {
      name: 'Cache Otimizado',
      description: 'Sistema de cache em múltiplas camadas para performance',
      status: 'available',
      docs: '/cache'
    },
    {
      name: 'Multi-Agente',
      description: 'Colaboração entre agentes especializados',
      status: 'available',
      docs: '/agents'
    }
  ];

  const quickTips = [
    {
      title: 'Uso de Atalhos',
      description: 'Use Ctrl+K para abrir a paleta de comandos rapidamente',
      icon: Zap
    },
    {
      title: 'Personalização',
      description: 'Arraste e solte widgets para reorganizar seu dashboard',
      icon: Settings
    },
    {
      title: 'Colaboração',
      description: 'Agentes podem trabalhar em paralelo para acelerar tarefas',
      icon: Target
    },
    {
      title: 'Performance',
      description: 'O cache semântico reduz tempo de resposta em até 70%',
      icon: Lightbulb
    }
  ];

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Básico': return 'bg-green-100 text-green-800';
      case 'Interface': return 'bg-blue-100 text-blue-800';
      case 'IA': return 'bg-purple-100 text-purple-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      case 'Performance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Guia Interativo</h1>
            <p className="text-white/60">Aprenda a usar o Alex iA Cognitivo passo a passo</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Seu Progresso</CardTitle>
            <CardDescription className="text-white/60">
              {completedSteps.length} de {guideSteps.length} etapas concluídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-white/10 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                style={{ width: `${(completedSteps.length / guideSteps.length) * 100}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {guideSteps.map((step) => (
                <Badge 
                  key={step.id}
                  variant={completedSteps.includes(step.id) ? "default" : "outline"}
                  className={`${
                    completedSteps.includes(step.id) 
                      ? 'bg-green-600 text-white' 
                      : 'border-white/20 text-white/60'
                  }`}
                >
                  {completedSteps.includes(step.id) && <CheckCircle className="w-3 h-3 mr-1" />}
                  {step.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="guide" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full bg-black/20 backdrop-blur-sm">
            <TabsTrigger value="guide">Guia Passo a Passo</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="tips">Dicas Rápidas</TabsTrigger>
          </TabsList>

          {/* Guide Steps */}
          <TabsContent value="guide" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guideSteps.map((step, index) => (
                <Card 
                  key={step.id} 
                  className={`bg-white/5 backdrop-blur-sm border-white/10 ${
                    completedSteps.includes(step.id) ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getCategoryColor(step.category)}`}>
                        {step.category}
                      </Badge>
                      <span className="text-xs text-white/60">{step.duration}</span>
                    </div>
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs text-white">
                          {index + 1}
                        </span>
                      )}
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {step.steps.map((stepItem, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-2 text-sm text-white/80">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {stepItem}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      {!completedSteps.includes(step.id) ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleStepComplete(step.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full bg-green-600/20 border-green-400/50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Concluído
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{feature.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        {feature.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-white/60">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver Documentação
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quick Tips */}
          <TabsContent value="tips" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {quickTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-blue-400 mt-1" />
                        <div>
                          <h3 className="font-medium text-white mb-2">{tip.title}</h3>
                          <p className="text-sm text-white/60">{tip.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Pronto para começar?</h3>
            <p className="text-white/60 mb-4">
              Explore todas as funcionalidades do Alex iA Cognitivo
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowRight className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InteractiveGuide;
