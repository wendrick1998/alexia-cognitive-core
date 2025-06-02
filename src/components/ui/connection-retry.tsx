
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Wifi, AlertTriangle } from 'lucide-react';
import { useEnvironmentValidation } from '@/hooks/useEnvironmentValidation';

interface ConnectionRetryProps {
  onRetry?: () => void;
}

export const ConnectionRetry = ({ onRetry }: ConnectionRetryProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const status = useEnvironmentValidation();

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      } else {
        // Force reload the app
        window.location.reload();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            {status.supabaseConnected ? (
              <Wifi className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle>
            {status.supabaseConnected ? 'Configuração Opcional' : 'Problema de Conexão'}
          </CardTitle>
          <CardDescription>
            {status.connectionError || 'Algumas funcionalidades podem estar limitadas'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                Configurações Opcionais:
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                {status.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1"
              variant={status.supabaseConnected ? "outline" : "default"}
            >
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Tentar Novamente
            </Button>
            
            {status.supabaseConnected && (
              <Button 
                onClick={() => window.location.reload()}
                variant="default"
                className="flex-1"
              >
                Continuar
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Alex iA funciona offline quando necessário
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
