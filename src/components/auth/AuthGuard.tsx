
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
  const [forceTimeout, setForceTimeout] = useState(false);

  // LOG CRÍTICO: Estado do AuthGuard
  console.log('🛡️ AuthGuard ESTADO:', {
    path: location.pathname,
    user: !!user,
    loading,
    isAuthenticated,
    forceTimeout
  });

  // Timeout de segurança absoluto - 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('⏰ AuthGuard: TIMEOUT FORÇADO após 3 segundos');
      setForceTimeout(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ESTADO 1: Loading (mas não por muito tempo)
  if (loading && !forceTimeout) {
    console.log('🛡️ AuthGuard: ESTADO LOADING');
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
            <p className="text-gray-400">Carregando Alex iA</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ESTADO 2: Não autenticado - redirecionar para /auth
  if (!isAuthenticated || !user) {
    console.log('🛡️ AuthGuard: USUÁRIO NÃO AUTENTICADO - redirecionando para /auth');
    
    // Se já estamos em /auth, não redirecionar (evitar loop)
    if (location.pathname === '/auth') {
      console.log('🛡️ AuthGuard: Já está em /auth, não redirecionando');
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-xl font-semibold mb-4">🔑 Página de Login</h2>
            <p className="text-gray-400">Você está na página de autenticação</p>
          </div>
        </div>
      );
    }

    return <Navigate to="/auth" replace />;
  }

  // ESTADO 3: Autenticado - renderizar children
  console.log('🛡️ AuthGuard: USUÁRIO AUTENTICADO - renderizando children');
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
};

export default AuthGuard;
