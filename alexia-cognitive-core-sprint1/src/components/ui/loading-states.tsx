
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Zap } from "lucide-react";
import { useState, useEffect } from "react";

// Loading Quotes
const loadingQuotes = [
  "Organizando pensamentos...",
  "Conectando neurônios...",
  "Processando informações...",
  "Buscando insights...",
  "Analisando contexto...",
  "Preparando resposta...",
  "Sincronizando memórias...",
  "Otimizando resultados..."
];

export const ChatLoadingState = () => {
  const [quote, setQuote] = useState(loadingQuotes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-4 p-6 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center animate-pulse">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-ping" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
            {quote}
          </span>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 animate-shimmer" />
          <Skeleton className="h-4 w-1/2 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const DocumentProcessingState = ({ progress = 0 }: { progress?: number }) => {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Processando documento
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Extraindo conhecimento...
            </p>
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {progress}%
        </div>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2 mb-3 animate-pulse" 
      />
      
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Análise estrutural</span>
        <span>Geração de embeddings</span>
        <span>Indexação inteligente</span>
      </div>
    </div>
  );
};

export const MemoryCardSkeleton = () => (
  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="flex items-center space-x-3 mb-3">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-3/4 mb-3" />
    <div className="flex justify-between">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  </div>
);

export const DocumentCardSkeleton = () => (
  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse">
    <Skeleton className="w-full h-32 rounded-xl mb-3" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2 mb-3" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);
