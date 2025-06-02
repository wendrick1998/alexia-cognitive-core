
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb,
  BookOpen,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { useAutonomousLearning } from '@/hooks/useAutonomousLearning';
import { useMultiAgentCollaboration } from '@/hooks/useMultiAgentCollaboration';

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetSkill: string;
  currentLevel: number;
  targetLevel: number;
  deadline: Date;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate: Date;
  }>;
}

interface PersonalizedRecommendation {
  id: string;
  type: 'skill_development' | 'process_optimization' | 'collaboration' | 'mindset';
  title: string;
  description: string;
  priority: number;
  estimatedImpact: number;
  timeToComplete: string;
  resources: string[];
}

const PersonalizedCoaching = () => {
  const {
    patterns,
    preferences,
    anomalies,
    getCurriculumRecommendation,
    learningStats,
    updatePreferences
  } = useAutonomousLearning();

  const {
    agents,
    collaborationStats,
    getCollaborativeRecommendations
  } = useMultiAgentCollaboration();

  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([
    {
      id: '1',
      title: 'Dominar Análise de Dados',
      description: 'Desenvolver expertise em análise estatística e visualização de dados',
      targetSkill: 'data_analysis',
      currentLevel: 6,
      targetLevel: 9,
      deadline: new Date('2024-08-01'),
      milestones: [
        { id: '1-1', title: 'Completar curso de Python para Data Science', completed: true, dueDate: new Date('2024-06-15') },
        { id: '1-2', title: 'Projeto prático com dados reais', completed: false, dueDate: new Date('2024-07-01') },
        { id: '1-3', title: 'Certificação em Machine Learning', completed: false, dueDate: new Date('2024-07-30') }
      ]
    },
    {
      id: '2',
      title: 'Liderança Colaborativa',
      description: 'Aprimorar habilidades de liderança em ambientes colaborativos',
      targetSkill: 'leadership',
      currentLevel: 7,
      targetLevel: 9,
      deadline: new Date('2024-09-01'),
      milestones: [
        { id: '2-1', title: 'Workshop de Comunicação Assertiva', completed: true, dueDate: new Date('2024-06-20') },
        { id: '2-2', title: 'Mentoria de 5 projetos', completed: false, dueDate: new Date('2024-08-15') },
        { id: '2-3', title: 'Feedback 360° completo', completed: false, dueDate: new Date('2024-08-30') }
      ]
    }
  ]);

  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);

  // Generate personalized recommendations
  useEffect(() => {
    const curriculumRec = getCurriculumRecommendation();
    
    const newRecommendations: PersonalizedRecommendation[] = [
      {
        id: '1',
        type: 'skill_development',
        title: 'Expandir Conhecimento em IA',
        description: `Baseado no seu progresso (${curriculumRec.reasoning}), recomendo focar em técnicas avançadas de ML`,
        priority: 8,
        estimatedImpact: 9,
        timeToComplete: '6 semanas',
        resources: ['Curso Neural Networks', 'Projeto AutoML', 'Mentoria especializada']
      },
      {
        id: '2',
        type: 'collaboration',
        title: 'Melhorar Colaboração Multi-Agente',
        description: 'Seus padrões de trabalho mostram oportunidades para maior sinergia em equipe',
        priority: 7,
        estimatedImpact: 8,
        timeToComplete: '3 semanas',
        resources: ['Workshop de Team Building', 'Prática com IA Colaborativa', 'Feedback peers']
      }
    ];

    // Add recommendations based on detected anomalies
    anomalies.forEach(anomaly => {
      if (anomaly.severity > 0.6) {
        newRecommendations.push({
          id: `anomaly-${anomaly.id}`,
          type: 'process_optimization',
          title: 'Otimizar Padrões de Trabalho',
          description: `Detectei ${anomaly.description} - vamos otimizar este processo`,
          priority: Math.floor(anomaly.severity * 10),
          estimatedImpact: 7,
          timeToComplete: '1-2 semanas',
          resources: ['Análise de workflows', 'Automação personalizada', 'Coaching 1:1']
        });
      }
    });

    setRecommendations(newRecommendations.slice(0, 5));
  }, [patterns, anomalies, getCurriculumRecommendation]);

  const handleAcceptRecommendation = (recId: string) => {
    const recommendation = recommendations.find(r => r.id === recId);
    if (recommendation) {
      updatePreferences(recommendation.type, 0.8, ['coaching', 'accepted']);
      setRecommendations(prev => prev.filter(r => r.id !== recId));
    }
  };

  const getGoalProgress = (goal: LearningGoal) => {
    const progressFromLevel = ((goal.currentLevel - 1) / (goal.targetLevel - 1)) * 100;
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const milestoneProgress = (completedMilestones / goal.milestones.length) * 100;
    return Math.min(100, (progressFromLevel + milestoneProgress) / 2);
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Coaching Personalizado
          </h1>
          <p className="text-gray-600 mt-1">Sistema adaptativo de desenvolvimento pessoal e profissional</p>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experiência Total</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.totalExperience}</div>
            <p className="text-xs text-muted-foreground">
              interações registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Padrões Descobertos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.patternsFound}</div>
            <p className="text-xs text-muted-foreground">
              comportamentos identificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaborações Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaborationStats.activeCollaborations}</div>
            <p className="text-xs text-muted-foreground">
              projetos em equipe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferências Aprendidas</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.preferencesLearned}</div>
            <p className="text-xs text-muted-foreground">
              adaptações realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Padrões</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recomendações Personalizadas
              </CardTitle>
              <CardDescription>
                Sugestões baseadas no seu perfil de aprendizado e comportamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{rec.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Badge className={getPriorityColor(rec.priority)}>
                            Prioridade {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            {rec.timeToComplete}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Impacto estimado:</span> {rec.estimatedImpact}/10
                        </div>
                        <Progress value={rec.estimatedImpact * 10} className="w-24 h-2" />
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Recursos recomendados:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.resources.map((resource, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleAcceptRecommendation(rec.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Clock className="w-4 h-4 mr-1" />
                          Agendar
                        </Button>
                        <Button size="sm" variant="ghost">
                          Mais detalhes
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Objetivos de Aprendizado
              </CardTitle>
              <CardDescription>
                Acompanhe seu progresso em metas de desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningGoals.map((goal) => {
                  const progress = getGoalProgress(goal);
                  const daysToDeadline = Math.ceil((goal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{goal.title}</h4>
                          <p className="text-gray-600 text-sm">{goal.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                          <div className="text-xs text-gray-500">{daysToDeadline} dias restantes</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Nível atual: {goal.currentLevel}/10</span>
                          <span>Meta: {goal.targetLevel}/10</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-2">Marcos importantes:</h5>
                        <div className="space-y-2">
                          {goal.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-3 text-sm">
                              {milestone.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                                {milestone.title}
                              </span>
                              <span className="text-gray-400 text-xs ml-auto">
                                {milestone.dueDate.toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Insights Personalizados
              </CardTitle>
              <CardDescription>
                Descobertas sobre seus padrões de aprendizado e trabalho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-green-800 mb-2">Pontos Fortes Identificados</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Excelente capacidade analítica (92% de precisão)</li>
                        <li>• Colaboração efetiva em equipes (8.5/10)</li>
                        <li>• Aprendizado rápido de novas tecnologias</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Oportunidades de Melhoria</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Gestão de tempo em projetos longos</li>
                        <li>• Comunicação em apresentações públicas</li>
                        <li>• Delegação de responsabilidades</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {anomalies.length > 0 && (
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Padrões Atípicos Detectados
                      </h4>
                      <ScrollArea className="h-32">
                        <div className="space-y-2">
                          {anomalies.slice(0, 5).map((anomaly) => (
                            <div key={anomaly.id} className="text-sm border-l-2 border-yellow-300 pl-3">
                              <div className="font-medium">{anomaly.type}</div>
                              <div className="text-gray-600">{anomaly.description}</div>
                              <div className="text-xs text-gray-500">
                                {anomaly.timestamp.toLocaleString('pt-BR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Padrões Comportamentais
              </CardTitle>
              <CardDescription>
                Sequências e hábitos identificados automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <Card key={pattern.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">
                          Padrão: {pattern.pattern.join(' → ')}
                        </h4>
                        <Badge variant="outline">
                          {Math.round(pattern.confidence * 100)}% confiança
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Frequência: {pattern.frequency} ocorrências</span>
                        <span>Contexto: {pattern.context}</span>
                        <span>Última vez: {pattern.lastSeen.toLocaleDateString('pt-BR')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedCoaching;
