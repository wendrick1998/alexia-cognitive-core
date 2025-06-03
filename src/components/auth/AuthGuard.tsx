
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, refreshSession, isAuthenticated } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [authCheckAttempts, setAuthCheckAttempts] = useState(0);

  // LOG CRÍTICO: Estado inicial do AuthGuard
  console.log('🛡️ AuthGuard: inicializando - FASE 4 COM REDIRECIONAMENTO AUTOMÁTICO');
  console.log('🛡️ Estado inicial:', { 
    user: !!user, 
    loading, 
    isAuthenticated,
    timeoutReached,
    path: location.pathname,
    attempts: authCheckAttempts
  });

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    if (!loading) return;

    console.log('⏰ AuthGuard: iniciando timeout de 8 segundos...');
    
    const timer = setTimeout(() => {
      if (loading) {
        console.log('⏰ AuthGuard: TIMEOUT ATINGIDO - forçando saída do loading');
        setTimeoutReached(true);
      }
    }, 8000); // 8 segundos de timeout

    return () => {
      console.log('⏰ AuthGuard: limpando timeout');
      clearTimeout(timer);
    };
  }, [loading]);

  // Tentar renovar sessão se necessário
  useEffect(() => {
    if (authCheckAttempts > 2) {
      console.log('🛡️ AuthGuard: máximo de tentativas de auth atingido');
      return;
    }

    if (!user && !loading && refreshSession && authCheckAttempts === 0) {
      console.log('🔑 AuthGuard: tentando renovar sessão automaticamente...');
      setAuthCheckAttempts(prev => prev + 1);
      refreshSession().then(() => {
        console.log('🔑 AuthGuard: tentativa de renovação concluída');
      }).catch((error) => {
        console.error('🔑 AuthGuard: erro na renovação:', error);
      });
    }
  }, [user, loading, refreshSession, authCheckAttempts]);

  // Estados visuais baseados na autenticação
  if (loading && !timeoutReached) {
    console.log('🛡️ AuthGuard: loading - mostrando spinner');
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-6">
          <LoadingSpinner size="large" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-semibold text-white">🔒 Carregando autenticação...</h2>
            <p className="text-gray-400">Verificando credenciais do Alex iA</p>
            <div className="text-xs text-gray-500 mt-4">
              Tentativa: {authCheckAttempts + 1} | Timeout em segundos
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Se timeout foi atingido, mostrar erro e redirecionar para login
  if (timeoutReached) {
    console.log('🚨 AuthGuard: TIMEOUT - redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  // Verificar se usuário está autenticado - REDIRECIONAMENTO AUTOMÁTICO
  if (!isAuthenticated && !user) {
    console.log('🛡️ AuthGuard: NÃO autenticado – redirecionando para /auth');
    console.log('🛡️ AuthGuard: rota atual:', location.pathname);
    
    // REDIRECIONAMENTO AUTOMÁTICO para /auth
    return <Navigate to="/auth" replace />;
  }

  // Usuário autenticado - liberar acesso
  console.log('🛡️ AuthGuard: autenticado - liberando acesso aos children');
  console.log('✅ AuthGuard: usuário', user?.email || 'identificado', 'pode acessar', location.pathname);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
};

export default AuthGuard;
