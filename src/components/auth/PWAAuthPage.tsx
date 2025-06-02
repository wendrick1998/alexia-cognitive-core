
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePWAAuth } from '@/hooks/usePWAAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/branding/Logo';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const PWAAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, isAuthenticated, error, clearError } = usePWAAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    clearError();

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro no login",
            description: error,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Você pode fazer login agora",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl" />
      </div>

      {/* Main Content */}
      <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border-gray-700/50 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-6 pb-6">
          {/* Logo */}
          <div className="mx-auto">
            <Logo size="lg" animate />
          </div>
          
          {/* Welcome Text */}
          <div className="space-y-2">
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
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 h-12"
                  placeholder="seu@email.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 pr-11 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 h-12"
                  placeholder="Digite sua senha"
                  minLength={6}
                  disabled={loading}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors touch-target"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={cn(
                "w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200 touch-target",
                loading && "opacity-70"
              )}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isLogin ? 'Entrando...' : 'Cadastrando...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? 'Entrar' : 'Cadastrar'}
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 underline underline-offset-4 touch-target"
              disabled={loading}
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se'
                : 'Já tem uma conta? Faça login'
              }
            </button>
          </div>

          {/* PWA Info */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
            <p>Versão otimizada para Safari e PWA</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAAuthPage;
