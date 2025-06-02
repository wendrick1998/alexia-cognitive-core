
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, refreshSession } = useAuth();

  useEffect(() => {
    // Tentar renovar a sessão se não há usuário mas ainda está carregando
    if (!user && !loading) {
      refreshSession?.();
    }
  }, [user, loading, refreshSession]);

  if (loading) {
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
