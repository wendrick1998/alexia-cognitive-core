
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Logo from '@/components/branding/Logo';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { user, loading, error, isAuthenticated, refreshSession, clearError } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo size="lg" animate />
          <div className="text-white/60">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-900 border-gray-800 text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-red-400">Problema de Autenticação</CardTitle>
            <CardDescription className="text-gray-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={refreshSession}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
              <Button
                onClick={() => {
                  clearError();
                  window.location.href = '/';
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Ir para Login
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Se o problema persistir, verifique sua conexão com a internet
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated - show fallback or redirect
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-900 border-gray-800 text-white">
          <CardHeader className="text-center">
            <Logo size="lg" animate />
            <CardTitle className="text-white">Acesso Restrito</CardTitle>
            <CardDescription className="text-gray-400">
              Você precisa estar logado para acessar esta página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
};

export default AuthGuard;
