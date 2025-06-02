
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ConnectionRetry() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900 border-gray-800 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-red-400">Problema de Conexão</CardTitle>
          <CardDescription className="text-gray-400">
            Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
