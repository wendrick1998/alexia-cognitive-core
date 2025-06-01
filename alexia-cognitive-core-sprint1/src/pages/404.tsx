
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '@/hooks/useDarkMode';
import Logo from '@/components/branding/Logo';

const NotFound = () => {
  const navigate = useNavigate();
  const { isOled, isDark } = useDarkMode();

  const backgroundClass = isOled 
    ? 'bg-black' 
    : isDark 
    ? 'bg-slate-900' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-100';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${backgroundClass}`}>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              isOled || isDark ? 'bg-white/10' : 'bg-blue-200/40'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* 404 Display */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              delay: 0.2 
            }}
          >
            <h1 className={`text-8xl font-bold mb-4 bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
              404
            </h1>
            <motion.div
              className={`text-xl font-semibold mb-2 ${
                isOled || isDark ? 'text-white/90' : 'text-slate-700'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Página Não Encontrada
            </motion.div>
            <motion.p
              className={`text-sm ${
                isOled || isDark ? 'text-white/60' : 'text-slate-500'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Esta página decidiu fazer uma pausa para o café ☕
            </motion.p>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className={`${
              isOled ? 'bg-white/5 border-white/10' :
              isDark ? 'bg-white/10 border-white/20' :
              'bg-white/80 border-white/40'
            } backdrop-blur-xl`}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Button>
                  
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Página Anterior
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/search')}
                    variant="ghost"
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Conteúdo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Easter egg */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.button
              className={`text-xs ${
                isOled || isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
              } transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const messages = [
                  "🤖 Alex iA está processando sua frustração...",
                  "🧠 Analisando padrões de navegação perdida...",
                  "✨ Transformando erro 404 em oportunidade de descoberta!",
                  "🎯 Redirecionando energia para experiências melhores..."
                ];
                alert(messages[Math.floor(Math.random() * messages.length)]);
              }}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Modo Alex iA
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
