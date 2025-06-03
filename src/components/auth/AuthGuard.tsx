
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
  console.log('🛡️ AuthGuard: inicializando - FASE 3');
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

    if (!user && !loading && location.pathname !== '/auth' && refreshSession && authCheckAttempts === 0) {
      console.log('🔑 AuthGuard: tentando renovar sessão automaticamente...');
      setAuthCheckAttempts(prev => prev + 1);
      refreshSession().then(() => {
        console.log('🔑 AuthGuard: tentativa de renovação concluída');
      }).catch((error) => {
        console.error('🔑 AuthGuard: erro na renovação:', error);
      });
    }
  }, [user, loading, location.pathname, refreshSession, authCheckAttempts]);

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
              Tentativa: {authCheckAttempts + 1} | Timeout: {8 - Math.floor((Date.now() % 8000) / 1000)}s
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Se timeout foi atingido, mostrar erro e permitir acesso limitado
  if (timeoutReached) {
    console.log('🚨 AuthGuard: TIMEOUT - liberando acesso com aviso de erro');
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <div className="bg-red-600 text-white px-4 py-3 text-center">
          <div className="font-semibold">⚠️ ERRO NO AUTHGUARD - Timeout de autenticação</div>
          <div className="text-sm mt-1">
            Problema detectado na verificação de login. 
            <button 
              onClick={() => window.location.reload()} 
              className="underline ml-2 hover:text-red-200"
            >
              Clique aqui para recarregar
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-xl font-bold mb-4">🔴 Erro de Autenticação</h2>
            <p className="text-gray-300 mb-4">O sistema não conseguiu verificar seu login</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar se usuário está autenticado
  if (!isAuthenticated && !user) {
    console.log('🛡️ AuthGuard: NÃO autenticado – redirecionando para /auth');
    
    // Evitar loop de redirecionamento
    if (location.pathname === '/auth') {
      console.log('🛡️ AuthGuard: já está em /auth, não redirecionando');
      return <>{children}</>;
    }

    // Mostrar tela de redirecionamento antes de navegar
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-semibold text-white">⛔ Redirecionando para login...</h2>
            <p className="text-gray-400">Acesso restrito - Autenticação necessária</p>
          </motion.div>
        </div>
      </motion.div>
    );
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
