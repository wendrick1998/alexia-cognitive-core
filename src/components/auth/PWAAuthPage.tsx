import { useState, useEffect } from 'react';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/branding/Logo';
import { Eye, EyeOff, Mail, Lock, Smartphone } from 'lucide-react';
import EnhancedButton from '@/components/ui/EnhancedButton';
import EnhancedInput from '@/components/ui/EnhancedInput';
import { showNotification } from '@/components/ui/NotificationToast';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';

const PWAAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, isAuthenticated, error, clearError } = usePWAAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching between login/signup
  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showNotification({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha",
        type: "error",
      });
      return;
    }

    setLoading(true);
    clearError();

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          showNotification({
            title: "Erro no login",
            description: error,
            type: "error",
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          showNotification({
            title: "Erro no cadastro",
            description: error,
            type: "error",
          });
        } else {
          showNotification({
            title: "Cadastro realizado com sucesso!",
            description: "Você pode fazer login agora",
            type: "success",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      showNotification({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border-gray-700/50 shadow-2xl relative z-10">
          <CardHeader className="text-center space-y-6 pb-6">
            {/* Logo */}
            <motion.div 
              className="mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Logo size="lg" animate />
            </motion.div>
            
            {/* Welcome Text */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Modo PWA</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                {isLogin ? 'Entre na sua conta' : 'Criar nova conta'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {isLogin 
                  ? 'Versão otimizada para dispositivos móveis' 
                  : 'Junte-se ao Alex IA'
                }
              </CardDescription>
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div 
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.form 
              className="space-y-4" 
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* Email Field */}
              <EnhancedInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="w-5 h-5" />}
                placeholder="seu@email.com"
                disabled={loading}
                floating
              />

              {/* Password Field */}
              <div className="relative">
                <EnhancedInput
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock className="w-5 h-5" />}
                  placeholder="Digite sua senha"
                  disabled={loading}
                  floating
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Submit Button */}
              <EnhancedButton
                type="submit"
                loading={loading}
                loadingText={isLogin ? 'Entrando...' : 'Cadastrando...'}
                gradient
                className="w-full h-12"
                disabled={loading}
                aria-label={isLogin ? 'Fazer login na conta' : 'Criar nova conta'}
              >
                {isLogin ? 'Entrar' : 'Cadastrar'}
              </EnhancedButton>
            </motion.form>

            {/* Switch Mode */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 underline underline-offset-4"
                disabled={loading}
              >
                {isLogin 
                  ? 'Não tem uma conta? Cadastre-se'
                  : 'Já tem uma conta? Faça login'
                }
              </button>
            </motion.div>

            {/* PWA Info */}
            <motion.div 
              className="text-center text-xs text-gray-500 border-t border-gray-700 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <p>Versão otimizada para Safari e PWA</p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </PageTransition>
  );
};

export default PWAAuthPage;
