
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // LOG CRÍTICO: Estado inicial do AuthGuard
  console.log('🛡️ AuthGuard RENDERIZANDO:', {
    path: location.pathname,
    user: !!user,
    loading,
    isAuthenticated,
    timeoutReached,
    initializing
  });

  // Controle de inicialização
  useEffect(() => {
    console.log('🛡️ AuthGuard: useEffect de inicialização executado');
    
    // Marcar como não inicializando após um pequeno delay
    const initTimer = setTimeout(() => {
      console.log('🛡️ AuthGuard: saindo do estado de inicialização');
      setInitializing(false);
    }, 100);

    return () => {
      console.log('🛡️ AuthGuard: limpando timer de inicialização');
      clearTimeout(initTimer);
    };
  }, []);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    if (!loading) {
      console.log('🛡️ AuthGuard: não está em loading, não configurando timeout');
      return;
    }

    console.log('⏰ AuthGuard: iniciando timeout de 5 segundos...');
    
    const timer = setTimeout(() => {
      if (loading) {
        console.log('⏰ AuthGuard: TIMEOUT ATINGIDO - forçando redirecionamento');
        setTimeoutReached(true);
      }
    }, 5000); // 5 segundos de timeout

    return () => {
      console.log('⏰ AuthGuard: limpando timeout');
      clearTimeout(timer);
    };
  }, [loading]);

  // SEMPRE retornar algo - NUNCA retornar null ou undefined
  
  // Estado 1: Inicializando
  if (initializing) {
    console.log('🛡️ AuthGuard: ESTADO 1 - Inicializando');
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-6">
          <LoadingSpinner size="large" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-semibold text-white">🔄 Inicializando...</h2>
            <p className="text-gray-400">Preparando o Alex iA</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Estado 2: Loading (verificando autenticação)
  if (loading && !timeoutReached) {
    console.log('🛡️ AuthGuard: ESTADO 2 - Loading autenticação');
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center space-y-6">
          <LoadingSpinner size="large" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-semibold text-white">🔒 Verificando autenticação...</h2>
            <p className="text-gray-400">Carregando credenciais do Alex iA</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Estado 3: Timeout atingido - redirecionar para auth
  if (timeoutReached) {
    console.log('🛡️ AuthGuard: ESTADO 3 - Timeout atingido, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  // Estado 4: Não autenticado - redirecionar para auth
  if (!loading && !isAuthenticated && !user) {
    console.log('🛡️ AuthGuard: ESTADO 4 - Não autenticado, redirecionando para /auth');
    console.log('🛡️ AuthGuard: Detalhes:', { 
      loading, 
      isAuthenticated, 
      user: !!user, 
      currentPath: location.pathname 
    });
    
    // Evitar loop de redirecionamento se já estiver em /auth
    if (location.pathname === '/auth') {
      console.log('🛡️ AuthGuard: Já está em /auth, não redirecionando');
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-xl font-semibold mb-4">🔑 Área de Login</h2>
            <p className="text-gray-400">Você está na página de autenticação</p>
          </div>
        </div>
      );
    }

    return <Navigate to="/auth" replace />;
  }

  // Estado 5: Autenticado - renderizar children
  if (!loading && isAuthenticated && user) {
    console.log('🛡️ AuthGuard: ESTADO 5 - Autenticado, renderizando children');
    console.log('✅ AuthGuard: usuário', user.email, 'autenticado para', location.pathname);
    
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
  }

  // Estado 6: Fallback para qualquer caso não coberto
  console.log('🛡️ AuthGuard: ESTADO 6 - Fallback para estado não determinado');
  console.log('🚨 AuthGuard: Estado não determinado:', { 
    loading, 
    isAuthenticated, 
    user: !!user, 
    timeoutReached,
    initializing 
  });
  
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-6">
        <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Estado Indeterminado</h2>
          <p className="text-gray-400">Verificando status de autenticação...</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthGuard;
