
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features?: string[];
  progress?: number;
  estimatedDate?: string;
  onBack?: () => void;
}

export default function ComingSoonPage({ 
  title, 
  description, 
  icon: Icon, 
  features = [],
  progress = 0,
  estimatedDate,
  onBack 
}: ComingSoonPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      )}

      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Icon className="w-10 h-10 text-white" />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Em Desenvolvimento
          </Badge>
          {estimatedDate && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Previsão: {estimatedDate}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Funcionalidades Planejadas
            </CardTitle>
            <CardDescription>
              O que está sendo desenvolvido para esta seção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.length > 0 ? features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              )) : (
                <li className="text-sm text-gray-500 dark:text-gray-400">
                  Detalhes das funcionalidades serão anunciados em breve
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Progresso do Desenvolvimento
            </CardTitle>
            <CardDescription>
              Status atual da implementação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {progress < 25 && "Planejamento e design inicial"}
              {progress >= 25 && progress < 50 && "Desenvolvimento da interface"}
              {progress >= 50 && progress < 75 && "Implementação das funcionalidades"}
              {progress >= 75 && progress < 100 && "Testes e refinamentos"}
              {progress === 100 && "Pronto para lançamento"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Quer ser notificado?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Receba atualizações sobre o progresso desta funcionalidade
          </p>
          <Button variant="outline" disabled>
            <Sparkles className="w-4 h-4 mr-2" />
            Notificações em breve
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
