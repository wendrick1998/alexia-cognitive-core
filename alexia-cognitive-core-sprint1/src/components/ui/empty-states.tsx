
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, 
  FileText, 
  Brain, 
  Search,
  Plus,
  Upload,
  Sparkles
} from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondary?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  secondary 
}: EmptyStateProps) => {
  return (
    <Card className="p-12 text-center max-w-md mx-auto bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-dashed border-2 border-slate-200 dark:border-slate-700">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="space-y-3">
        {action && (
          <Button 
            onClick={action.onClick}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {action.label}
          </Button>
        )}
        
        {secondary && (
          <Button 
            variant="outline" 
            onClick={secondary.onClick}
            className="w-full"
          >
            {secondary.label}
          </Button>
        )}
      </div>
    </Card>
  );
};

export const ChatEmptyState = ({ onNewChat }: { onNewChat: () => void }) => (
  <EmptyState
    icon={<MessageCircle className="w-10 h-10 text-blue-600" />}
    title="Bem-vindo à AlexIA"
    description="Pronto para começar uma conversa inteligente? Faça uma pergunta ou explore suas memórias e documentos."
    action={{
      label: "Nova Conversa",
      onClick: onNewChat
    }}
    secondary={{
      label: "Explorar Recursos",
      onClick: () => console.log("Explore features")
    }}
  />
);

export const DocumentsEmptyState = ({ onUpload }: { onUpload: () => void }) => (
  <EmptyState
    icon={<FileText className="w-10 h-10 text-green-600" />}
    title="Nenhum documento ainda"
    description="Faça upload de PDFs, textos ou imagens para que eu possa aprender com eles e te ajudar melhor."
    action={{
      label: "Fazer Upload",
      onClick: onUpload
    }}
    secondary={{
      label: "Ver Formatos Suportados",
      onClick: () => console.log("Show supported formats")
    }}
  />
);

export const MemoriesEmptyState = ({ onCreateMemory }: { onCreateMemory: () => void }) => (
  <EmptyState
    icon={<Brain className="w-10 h-10 text-purple-600" />}
    title="Suas memórias estão vazias"
    description="Crie memórias para que eu possa lembrar de informações importantes sobre você e suas preferências."
    action={{
      label: "Criar Primeira Memória",
      onClick: onCreateMemory
    }}
    secondary={{
      label: "Importar de Chat",
      onClick: () => console.log("Import from chat")
    }}
  />
);

export const SearchEmptyState = () => (
  <EmptyState
    icon={<Search className="w-10 h-10 text-orange-600" />}
    title="Nenhum resultado encontrado"
    description="Tente usar termos diferentes ou explore outras seções da AlexIA para encontrar o que procura."
    action={{
      label: "Limpar Filtros",
      onClick: () => console.log("Clear filters")
    }}
    secondary={{
      label: "Buscar em Tudo",
      onClick: () => console.log("Search everywhere")
    }}
  />
);

export const NetworkErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    icon={<Sparkles className="w-10 h-10 text-red-600" />}
    title="Ops! Algo deu errado"
    description="Parece que houve um problema de conexão. Verifique sua internet e tente novamente."
    action={{
      label: "Tentar Novamente",
      onClick: onRetry
    }}
    secondary={{
      label: "Modo Offline",
      onClick: () => console.log("Enable offline mode")
    }}
  />
);
