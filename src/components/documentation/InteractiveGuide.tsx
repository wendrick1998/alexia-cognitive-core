
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, 
  Code, 
  Lightbulb, 
  Settings, 
  Play,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PremiumCard } from '@/components/ui/premium-card';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  code?: string;
  demo?: React.ComponentType;
  completed: boolean;
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const InteractiveGuide = () => {
  const { toast } = useToast();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      description: 'Aprenda os conceitos básicos da Alexia',
      difficulty: 'beginner',
      steps: [
        {
          id: 'setup',
          title: 'Configuração Inicial',
          description: 'Configure seu ambiente e credenciais',
          completed: false,
          code: `// Configuração básica
import { useAuth } from '@/hooks/useAuth';

const { user, login } = useAuth();

// Fazer login
await login('email@example.com', 'password');`
        },
        {
          id: 'first-conversation',
          title: 'Primeira Conversa',
          description: 'Inicie sua primeira conversa com a IA',
          completed: false,
          code: `// Iniciar conversa
import { useConversations } from '@/hooks/useConversations';

const { createConversation, sendMessage } = useConversations();

const conversation = await createConversation();
await sendMessage('Olá, Alexia!');`
        }
      ]
    },
    {
      id: 'memory-system',
      title: 'Sistema de Memória',
      description: 'Como funciona o sistema de memória integrada',
      difficulty: 'intermediate',
      steps: [
        {
          id: 'memory-concepts',
          title: 'Conceitos de Memória',
          description: 'Entenda os tipos de memória: trabalho, episódica, semântica',
          completed: false,
          code: `// Tipos de memória
interface MemoryTypes {
  working: 'Memória de trabalho (sessão atual)',
  episodic: 'Memória episódica (conversas passadas)',
  semantic: 'Memória semântica (conhecimento geral)',
  procedural: 'Memória procedural (como fazer)'
}`
        },
        {
          id: 'memory-usage',
          title: 'Usando a Memória',
          description: 'Como acessar e utilizar informações da memória',
          completed: false,
          code: `// Usar memória integrada
import { useIntegratedMemory } from '@/hooks/useIntegratedMemory';

const { searchMemory, consolidateMemory } = useIntegratedMemory();

// Buscar na memória
const results = await searchMemory('machine learning');

// Consolidar memória
await consolidateMemory();`
        }
      ]
    },
    {
      id: 'autonomous-projects',
      title: 'Projetos Autônomos',
      description: 'Gerencie projetos com execução automática',
      difficulty: 'advanced',
      steps: [
        {
          id: 'create-project',
          title: 'Criar Projeto',
          description: 'Configure um projeto autônomo com tarefas e dependências',
          completed: false,
          code: `// Criar projeto autônomo
import { useTaskExecutor } from '@/hooks/useTaskExecutor';

const { createProject, addTask } = useTaskExecutor();

const project = await createProject({
  name: 'Website Redesign',
  description: 'Modernizar interface do usuário'
});

await addTask(project.id, {
  title: 'Análise de Usabilidade',
  type: 'analysis',
  dependencies: []
});`
        }
      ]
    }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para sua área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código",
        variant: "destructive"
      });
    }
  };

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    toast({
      title: "Passo concluído! 🎉",
      description: "Você completou mais um passo do guia",
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getProgress = () => {
    const totalSteps = guideSections.reduce((sum, section) => sum + section.steps.length, 0);
    const completedCount = completedSteps.size;
    return Math.round((completedCount / totalSteps) * 100);
  };

  const getDifficultyColor = (difficulty: GuideSection['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                📚 Guia Interativo
              </h1>
              <p className="text-white/60 text-lg mt-2">
                Aprenda a usar todos os recursos da Alexia
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <PremiumCard className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{getProgress()}%</div>
                  <div className="text-sm text-white/60">Progresso</div>
                </div>
              </PremiumCard>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Progresso
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full bg-black/20 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="interactive" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Guia Interativo
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Referência API
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Exemplos
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guideSections.map((section) => (
                <PremiumCard key={section.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <Badge className={getDifficultyColor(section.difficulty)}>
                        {section.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-white/60">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-white/60">
                        {section.steps.filter(step => completedSteps.has(step.id)).length} de {section.steps.length} concluídos
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(section.steps.filter(step => completedSteps.has(step.id)).length / section.steps.length) * 100}%` 
                          }}
                        />
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setActiveSection('interactive')}
                      >
                        Começar
                      </Button>
                    </div>
                  </CardContent>
                </PremiumCard>
              ))}
            </div>
          </TabsContent>

          {/* Interactive Guide */}
          <TabsContent value="interactive" className="space-y-6">
            <div className="space-y-4">
              {guideSections.map((section) => (
                <PremiumCard key={section.id}>
                  <Collapsible
                    open={expandedSections.has(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedSections.has(section.id) ? 
                              <ChevronDown className="w-5 h-5" /> : 
                              <ChevronRight className="w-5 h-5" />
                            }
                            <div>
                              <CardTitle className="text-left">{section.title}</CardTitle>
                              <CardDescription className="text-left">
                                {section.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getDifficultyColor(section.difficulty)}>
                            {section.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-4">
                          {section.steps.map((step) => (
                            <div key={step.id} className="border border-white/10 rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-white flex items-center gap-2">
                                  {completedSteps.has(step.id) ? 
                                    <CheckCircle className="w-5 h-5 text-green-400" /> :
                                    <div className="w-5 h-5 border-2 border-white/30 rounded-full" />
                                  }
                                  {step.title}
                                </h4>
                                <Button
                                  size="sm"
                                  variant={completedSteps.has(step.id) ? "secondary" : "default"}
                                  onClick={() => markStepCompleted(step.id)}
                                  disabled={completedSteps.has(step.id)}
                                >
                                  {completedSteps.has(step.id) ? 'Concluído' : 'Marcar como Feito'}
                                </Button>
                              </div>
                              
                              <p className="text-white/70">{step.description}</p>
                              
                              {step.code && (
                                <div className="bg-black/40 rounded-lg p-4 relative">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-white/50">Código de exemplo</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(step.code!)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <pre className="text-sm text-white/80 overflow-x-auto">
                                    <code>{step.code}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </PremiumCard>
              ))}
            </div>
          </TabsContent>

          {/* API Reference */}
          <TabsContent value="api" className="space-y-6">
            <PremiumCard>
              <CardHeader>
                <CardTitle>Referência da API</CardTitle>
                <CardDescription>
                  Documentação completa dos hooks e componentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Hooks Principais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>useIntegratedMemory</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>useAutonomousLearning</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>useMultiAgentCollaboration</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>useTaskExecutor</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Componentes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>UnifiedDashboard</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>PersonalizedCoaching</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>ProcessOptimization</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <code>ExecutionDashboard</code>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </PremiumCard>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <PremiumCard>
                <CardHeader>
                  <CardTitle>Exemplo: Projeto de Desenvolvimento</CardTitle>
                  <CardDescription>
                    Como configurar um projeto completo com IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-black/40 rounded-lg p-4">
                      <pre className="text-sm text-white/80">
{`// Exemplo completo
const project = await createProject({
  name: 'E-commerce App',
  type: 'development',
  agents: ['technical', 'creative', 'analytical']
});

// Adicionar tarefas
await addTask(project.id, {
  title: 'Design da UI',
  assignedTo: 'creative-agent',
  dependencies: []
});

// Monitorar execução
const status = await getProjectStatus(project.id);`}
                      </pre>
                    </div>
                    <Button size="sm" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Executar Exemplo
                    </Button>
                  </div>
                </CardContent>
              </PremiumCard>

              <PremiumCard>
                <CardHeader>
                  <CardTitle>Exemplo: Análise de Dados</CardTitle>
                  <CardDescription>
                    Usando IA para análise automática
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-black/40 rounded-lg p-4">
                      <pre className="text-sm text-white/80">
{`// Análise automatizada
const analysis = await startAnalysis({
  data: salesData,
  type: 'trends',
  depth: 'comprehensive'
});

// Obter insights
const insights = await getInsights(analysis.id);

// Gerar relatório
const report = await generateReport(insights);`}
                      </pre>
                    </div>
                    <Button size="sm" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Executar Exemplo
                    </Button>
                  </div>
                </CardContent>
              </PremiumCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InteractiveGuide;
