
import { Crown, Zap, Star, Check, ArrowRight, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SubscriptionPage = () => {
  const currentPlan = 'Free';

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        '50 mensagens por mês',
        '1 GB de armazenamento',
        'Suporte básico por email',
        'Modelos básicos de IA'
      ],
      limitations: [
        'Funcionalidades limitadas',
        'Sem acesso prioritário'
      ],
      current: true
    },
    {
      name: 'Pro',
      price: 'R$ 29',
      period: '/mês',
      description: 'Para uso profissional',
      features: [
        'Mensagens ilimitadas',
        '10 GB de armazenamento',
        'Suporte prioritário',
        'Todos os modelos de IA',
        'API access',
        'Integração com ferramentas',
        'Memória expandida',
        'Análises avançadas'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'R$ 99',
      period: '/mês',
      description: 'Para equipes e empresas',
      features: [
        'Tudo do Pro',
        'Armazenamento ilimitado',
        'Suporte 24/7',
        'Modelos personalizados',
        'API premium',
        'Múltiplos usuários',
        'Dashboard de admin',
        'Relatórios customizados',
        'SLA garantido'
      ]
    }
  ];

  const usageStats = {
    messages: { used: 32, limit: 50, percentage: 64 },
    storage: { used: 0.8, limit: 1, percentage: 80 },
    apiCalls: { used: 0, limit: 0, percentage: 0 }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-600" />
            Gerenciamento de Assinatura
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades. Upgrade ou downgrade a qualquer momento.
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Plano Atual: {currentPlan}
            </CardTitle>
            <CardDescription>
              Seu uso este mês
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mensagens</span>
                  <span>{usageStats.messages.used}/{usageStats.messages.limit}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${usageStats.messages.percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Armazenamento</span>
                  <span>{usageStats.storage.used}GB/{usageStats.storage.limit}GB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${usageStats.storage.percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls</span>
                  <span>Não disponível</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${plan.current ? 'border-green-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                  Mais Popular
                </Badge>
              )}
              {plan.current && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                  Plano Atual
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {plan.limitations && (
                  <>
                    <Separator />
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-4 h-4 flex-shrink-0 rounded-full border border-gray-300" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                
                <div className="pt-4">
                  {plan.current ? (
                    <Button disabled className="w-full">
                      Plano Atual
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informações de Pagamento
            </CardTitle>
            <CardDescription>
              Gerencie seus métodos de pagamento e histórico de faturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Adicionar Cartão
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Ver Faturas
              </Button>
            </div>
            
            <Separator />
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Próxima cobrança:</strong> Não aplicável (Plano Free)</p>
              <p><strong>Método de pagamento:</strong> Nenhum configurado</p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sim, você pode cancelar sua assinatura a qualquer momento. O acesso continuará até o final do período pago.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">O que acontece com meus dados se eu cancelar?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seus dados ficam seguros por 30 dias após o cancelamento. Você pode reativar a conta neste período.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Há desconto para pagamento anual?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sim! Pagando anualmente você economiza 20% em qualquer plano pago.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;
