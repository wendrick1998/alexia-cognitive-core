
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, refreshSession } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Debug logs críticos
  console.log('🛡️ AuthGuard estado:', { 
    user: !!user, 
    loading, 
    timeoutReached,
    path: location.pathname,
    hasRefreshSession: !!refreshSession 
  });

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('⏰ AuthGuard timeout atingido - forçando saída do loading');
        setTimeoutReached(true);
      }
    }, 10000); // 10 segundos de timeout

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    console.log('🔄 AuthGuard useEffect executando:', { 
      user: !!user, 
      loading, 
      path: location.pathname 
    });
    
    // Só tentar renovar sessão uma vez e apenas em condições específicas
    if (!user && !loading && location.pathname !== '/auth' && refreshSession) {
      console.log('🔑 Tentando renovar sessão...');
      refreshSession();
    }
  }, [user, loading, location.pathname]); // Removido refreshSession das dependências para evitar loops

  // Se loading durou muito tempo, força bypass
  if (loading && !timeoutReached) {
    console.log('⏳ AuthGuard mostrando loading...');
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
            <h2 className="text-xl font-semibold text-white">Alex iA</h2>
            <p className="text-gray-400">Inicializando assistente premium...</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Se timeout foi atingido, mostrar erro e permitir acesso
  if (timeoutReached) {
    console.log('🚨 AuthGuard timeout - liberando acesso com aviso');
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <div className="bg-yellow-600 text-white px-4 py-2 text-center text-sm">
          ⚠️ Problema de conectividade detectado - funcionando em modo offline
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  // Redirecionar para auth apenas se necessário e não estiver já lá
  if (!user && location.pathname !== '/auth') {
    console.log('🚫 AuthGuard redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('✅ AuthGuard liberando acesso aos children');
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
