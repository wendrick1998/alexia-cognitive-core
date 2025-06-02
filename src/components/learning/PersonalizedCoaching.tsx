
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Award,
  BookOpen,
  Lightbulb
} from 'lucide-react';

const PersonalizedCoaching = () => {
  const coachingTips = [
    {
      id: 1,
      category: 'Produtividade',
      title: 'Organize suas tarefas por prioridade',
      description: 'Use a matriz de Eisenhower para categorizar tarefas por urgência e importância.',
      impact: 'Alto',
      difficulty: 'Fácil'
    },
    {
      id: 2,
      category: 'Comunicação',
      title: 'Pratique escuta ativa em reuniões',
      description: 'Faça perguntas esclarecedoras e reformule o que ouviu para confirmar entendimento.',
      impact: 'Médio',
      difficulty: 'Médio'
    },
    {
      id: 3,
      category: 'Liderança',
      title: 'Desenvolva feedback construtivo',
      description: 'Use a técnica SBI (Situação, Comportamento, Impacto) para dar feedback efetivo.',
      impact: 'Alto',
      difficulty: 'Difícil'
    }
  ];

  const learningGoals = [
    { skill: 'Gestão de Projetos', progress: 75, target: 100 },
    { skill: 'Análise de Dados', progress: 60, target: 85 },
    { skill: 'Comunicação Estratégica', progress: 45, target: 70 },
    { skill: 'Liderança de Equipes', progress: 30, target: 60 }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Alto': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Baixo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-blue-100 text-blue-800';
      case 'Médio': return 'bg-orange-100 text-orange-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="w-8 h-8 text-purple-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Coaching Personalizado</h2>
          <p className="text-white/60">Desenvolvimento baseado em suas necessidades</p>
        </div>
      </div>

      {/* Metas de Aprendizado */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-blue-400" />
            Metas de Aprendizado
          </CardTitle>
          <CardDescription className="text-white/60">
            Progresso em suas habilidades principais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {learningGoals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{goal.skill}</span>
                <span className="text-xs text-white/60">
                  {goal.progress}% / {goal.target}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                  style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas de Coaching */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coachingTips.map((tip) => (
          <Card key={tip.id} className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {tip.category}
                </Badge>
                <div className="flex gap-1">
                  <Badge className={`text-xs ${getImpactColor(tip.impact)}`}>
                    {tip.impact}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(tip.difficulty)}`}>
                    {tip.difficulty}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg text-white">{tip.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/80">{tip.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Aplicar Dica
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Recentes */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Insights Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">
                Padrão de Produtividade Identificado
              </p>
              <p className="text-xs text-white/60 mt-1">
                Você é 30% mais produtivo entre 9h-11h. Considere agendar tarefas importantes neste período.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
            <Award className="w-5 h-5 text-purple-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">
                Conquista Desbloqueada
              </p>
              <p className="text-xs text-white/60 mt-1">
                Você completou 5 projetos este mês. Continue assim!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedCoaching;
