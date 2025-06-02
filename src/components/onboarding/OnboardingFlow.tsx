
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageCircle, FileText, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { InteractiveButton } from "@/components/ui/microinteractions";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo à AlexIA",
    description: "Sua assistente de IA cognitiva pessoal",
    icon: <Brain className="w-8 h-8 text-blue-600" />,
    features: [
      "Conversas inteligentes e contextuais",
      "Memória persistente das suas preferências",
      "Processamento avançado de documentos"
    ]
  },
  {
    id: "chat",
    title: "Converse Naturalmente",
    description: "Faça perguntas, peça ajuda ou explore ideias",
    icon: <MessageCircle className="w-8 h-8 text-green-600" />,
    features: [
      "Respostas contextualizadas e precisas",
      "Histórico de conversas organizadas",
      "Suporte a múltiplos idiomas"
    ]
  },
  {
    id: "documents",
    title: "Upload de Documentos",
    description: "Deixe a AlexIA aprender com seus arquivos",
    icon: <FileText className="w-8 h-8 text-purple-600" />,
    features: [
      "Análise inteligente de PDFs e textos",
      "Extração automática de informações",
      "Busca semântica nos documentos"
    ]
  },
  {
    id: "memories",
    title: "Memórias Inteligentes",
    description: "Construa uma base de conhecimento personalizada",
    icon: <Sparkles className="w-8 h-8 text-orange-600" />,
    features: [
      "Armazenamento de preferências pessoais",
      "Conexões automáticas entre informações",
      "Melhoria contínua da personalização"
    ]
  }
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg p-8 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800 animate-scale-in">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Passo {currentStep + 1} de {onboardingSteps.length}
            </span>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {Math.round(progress)}%
            </Badge>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-blue-600 scale-125'
                  : completedSteps.has(index)
                  ? 'bg-green-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center">
            {currentStepData.icon}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {currentStepData.title}
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Features List */}
          <div className="space-y-3">
            {currentStepData.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center text-left bg-slate-50 dark:bg-slate-800 rounded-lg p-3 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="flex-1"
          >
            Pular Tutorial
          </Button>
          
          <InteractiveButton 
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {currentStep === onboardingSteps.length - 1 ? (
              "Começar"
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </InteractiveButton>
        </div>

        {/* Skip Link */}
        <div className="text-center mt-4">
          <button 
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors story-link"
          >
            Já sei como usar, pular para o app
          </button>
        </div>
      </Card>
    </div>
  );
};
