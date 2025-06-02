
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  Check,
  X,
  Zap,
  Star
} from 'lucide-react';

const SubscriptionManagement = () => {
  const { toast } = useToast();
  const [currentPlan] = useState({
    name: 'Premium',
    price: 29.90,
    billing: 'monthly',
    nextBilling: '2024-01-15',
    status: 'active'
  });

  const [usage] = useState({
    llmCalls: { used: 8450, limit: 10000 },
    storage: { used: 2.1, limit: 10 }, // GB
    documents: { used: 156, limit: 500 },
    insights: { used: 34, limit: 100 }
  });

  const plans = [
    {
      name: 'Free',
      price: 0,
      billing: 'month',
      features: [
        '1.000 chamadas LLM/mês',
        '1 GB de armazenamento',
        '50 documentos',
        '10 insights/mês',
        'Suporte por email'
      ],
      limitations: [
        'Sem análise avançada',
        'Sem API access',
        'Sem prioridade'
      ],
      current: false
    },
    {
      name: 'Premium',
      price: 29.90,
      billing: 'month',
      features: [
        '10.000 chamadas LLM/mês',
        '10 GB de armazenamento',
        '500 documentos',
        '100 insights/mês',
        'Análise avançada',
        'Suporte prioritário',
        'API access'
      ],
      limitations: [],
      current: true,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 99.90,
      billing: 'month',
      features: [
        'Chamadas LLM ilimitadas',
        '100 GB de armazenamento',
        'Documentos ilimitados',
        'Insights ilimitados',
        'Análise avançada',
        'Suporte 24/7',
        'API access',
        'White-label',
        'Deploy on-premise'
      ],
      limitations: [],
      current: false
    }
  ];

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Upgrade iniciado",
      description: `Redirecionando para checkout do plano ${planName}...`,
    });
  };

  const handleDowngrade = () => {
    toast({
      title: "Downgrade solicitado",
      description: "Entre em contato conosco para processar o downgrade.",
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return (used / limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="h-full overflow-y-auto scroll-container premium-scrollbar">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Assinatura</h1>
          <p className="text-white/60">Gerencie seu plano e acompanhe o uso</p>
        </div>

        {/* Current Plan */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Plano Atual: {currentPlan.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-white/60">Valor</p>
                <p className="text-2xl font-bold text-white">
                  R$ {currentPlan.price.toFixed(2)}
                  <span className="text-sm font-normal text-white/60">/{currentPlan.billing}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-white/60">Próxima cobrança</p>
                <p className="text-white font-medium">{currentPlan.nextBilling}</p>
              </div>
              <div className="space-y-2">
                <p className="text-white/60">Status</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {currentPlan.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Uso Atual
            </CardTitle>
            <CardDescription>Acompanhe seu consumo mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white/60">Chamadas LLM</p>
                  <p className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.llmCalls.used, usage.llmCalls.limit))}`}>
                    {usage.llmCalls.used.toLocaleString()} / {usage.llmCalls.limit.toLocaleString()}
                  </p>
                </div>
                <Progress value={getUsagePercentage(usage.llmCalls.used, usage.llmCalls.limit)} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white/60">Armazenamento</p>
                  <p className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.storage.used, usage.storage.limit))}`}>
                    {usage.storage.used} GB / {usage.storage.limit} GB
                  </p>
                </div>
                <Progress value={getUsagePercentage(usage.storage.used, usage.storage.limit)} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white/60">Documentos</p>
                  <p className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.documents.used, usage.documents.limit))}`}>
                    {usage.documents.used} / {usage.documents.limit}
                  </p>
                </div>
                <Progress value={getUsagePercentage(usage.documents.used, usage.documents.limit)} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white/60">Insights</p>
                  <p className={`text-sm font-medium ${getUsageColor(getUsagePercentage(usage.insights.used, usage.insights.limit))}`}>
                    {usage.insights.used} / {usage.insights.limit}
                  </p>
                </div>
                <Progress value={getUsagePercentage(usage.insights.used, usage.insights.limit)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Planos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.current ? 'border-blue-500/50 bg-blue-500/5' : ''} ${plan.popular ? 'border-yellow-500/50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-black border-0">
                      <Star className="w-3 h-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {plan.name}
                    {plan.current && <Badge variant="outline">Atual</Badge>}
                  </CardTitle>
                  <div className="text-3xl font-bold text-white">
                    R$ {plan.price.toFixed(2)}
                    <span className="text-sm font-normal text-white/60">/{plan.billing}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white/80">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-white/60">{limitation}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4">
                    {plan.current ? (
                      <Button disabled className="w-full">
                        Plano Atual
                      </Button>
                    ) : plan.price > currentPlan.price ? (
                      <Button 
                        onClick={() => handleUpgrade(plan.name)}
                        className="w-full flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Fazer Upgrade
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={handleDowngrade}
                        className="w-full"
                      >
                        Fazer Downgrade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Histórico de Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: '2023-12-15', amount: 29.90, status: 'paid', description: 'Plano Premium - Dezembro' },
                { date: '2023-11-15', amount: 29.90, status: 'paid', description: 'Plano Premium - Novembro' },
                { date: '2023-10-15', amount: 29.90, status: 'paid', description: 'Plano Premium - Outubro' }
              ].map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">{bill.description}</p>
                      <p className="text-sm text-white/60">{bill.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">R$ {bill.amount.toFixed(2)}</span>
                    <Badge variant={bill.status === 'paid' ? 'default' : 'secondary'}>
                      {bill.status === 'paid' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
