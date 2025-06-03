
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/branding/Logo';
import { Eye, EyeOff, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

// LOG CRÍTICO: Verificar se AuthPage está sendo carregado
console.log('🔑 AUTHPAGE CARREGANDO - FASE 4 COM REDIRECIONAMENTO CORRIGIDO');

const AuthPage = () => {
  console.log('🔑 AuthPage: componente inicializando - FASE 4');
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('🔑 AuthPage: hooks inicializados', {
    isAuthenticated,
    error: !!error,
    isLogin
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    console.log('🔑 AuthPage: verificando autenticação', { isAuthenticated });
    if (isAuthenticated) {
      console.log('🔑 AuthPage: usuário autenticado - redirecionando para / (dashboard)');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching between login/signup
  useEffect(() => {
    console.log('🔑 AuthPage: limpando erros ao trocar modo', { isLogin });
    clearError();
  }, [isLogin, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔑 AuthPage: handleSubmit chamado', { isLogin, email: !!email, password: !!password });
    
    if (!email || !password) {
      console.log('🔑 AuthPage: campos obrigatórios faltando');
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
        console.log('🔑 AuthPage: tentando fazer login...');
        const { error } = await signIn(email, password);
        if (error) {
          console.error('🔑 AuthPage: erro no login:', error);
          toast({
            title: "Erro no login",
            description: error,
            variant: "destructive",
          });
        } else {
          console.log('🔑 AuthPage: login realizado com sucesso! Redirecionando para dashboard...');
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao Alex IA",
          });
          // O redirecionamento será feito pelo useEffect acima quando isAuthenticated mudar
        }
      } else {
        console.log('🔑 AuthPage: tentando fazer cadastro...');
        const { error } = await signUp(email, password);
        if (error) {
          console.error('🔑 AuthPage: erro no cadastro:', error);
          toast({
            title: "Erro no cadastro",
            description: error,
            variant: "destructive",
          });
        } else {
          console.log('🔑 AuthPage: cadastro realizado com sucesso!');
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Verifique seu email para confirmar a conta",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('🔑 AuthPage: erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    console.log('🔑 AuthPage: handleForgotPassword chamado');
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Digite seu email para recuperar a senha",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Email enviado",
      description: "Verifique sua caixa de entrada para recuperar a senha",
    });
    setShowForgotPassword(false);
  };

  console.log('🔑 AuthPage: preparando para renderizar', { showForgotPassword, isLogin });

  if (showForgotPassword) {
    console.log('🔑 AuthPage: renderizando tela de recuperação de senha');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl" />
        </div>

        {/* Forgot Password Form */}
        <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border-gray-700/50 shadow-2xl relative z-10">
          <CardHeader className="text-center space-y-6 pb-6">
            <div className="mx-auto">
              <Logo size="lg" animate />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white">
                Recuperar Senha
              </CardTitle>
              <CardDescription className="text-gray-400">
                Digite seu email para receber as instruções
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
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
                    className="pl-11 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  Enviar Instruções
                </div>
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 underline underline-offset-4"
              >
                Voltar ao login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('🔑 AuthPage: renderizando tela principal de login/cadastro');

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
            <CardTitle className="text-2xl font-bold text-white">
              {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isLogin 
                ? 'Entre na sua conta do Alex IA' 
                : 'Junte-se ao futuro da inteligência artificial'
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
                  className="pl-11 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="seu@email.com"
                  disabled={loading}
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
                  className="pl-11 pr-11 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Digite sua senha"
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                "w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200",
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

          {/* Switch Mode and Forgot Password */}
          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={() => {
                console.log('🔑 AuthPage: alternando modo de login/cadastro');
                setIsLogin(!isLogin);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 underline underline-offset-4"
              disabled={loading}
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se'
                : 'Já tem uma conta? Faça login'
              }
            </button>

            {/* Forgot Password Link */}
            {isLogin && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    console.log('🔑 AuthPage: abrindo recuperação de senha');
                    setShowForgotPassword(true);
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  disabled={loading}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

console.log('🔑 AuthPage: componente definido e pronto para export - FASE 4');
export default AuthPage;
