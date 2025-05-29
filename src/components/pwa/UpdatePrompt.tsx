
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simular detecção de atualização (em prod seria através do service worker)
    const checkForUpdates = () => {
      // Simulação - em produção isso viria do service worker
      const hasUpdate = Math.random() > 0.7; // 30% chance para demo
      if (hasUpdate) {
        setTimeout(() => setShowUpdate(true), 3000);
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Em produção, isso ativaria o service worker para atualizar
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular download
      
      toast({
        title: "🎉 Atualização Concluída!",
        description: "Alex iA foi atualizado com novas funcionalidades",
      });
      
      // Em produção, recarregaria a página
      window.location.reload();
    } catch (error) {
      toast({
        title: "❌ Erro na Atualização",
        description: "Tente novamente em alguns minutos",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    
    toast({
      title: "📝 Atualização Adiada",
      description: "Você pode atualizar depois nas configurações",
    });
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 max-w-sm"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
        >
          <Card className="overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 oled:from-white/5 oled:to-blue-500/5 oled:border-white/20 shadow-xl backdrop-blur-xl">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Nova Atualização</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      v2.1.0
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={handleDismiss}
                  disabled={isUpdating}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Zap className="w-3 h-3 text-green-500" />
                  Performance 40% mais rápida
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  Novas funcionalidades de IA
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Download className="w-3 h-3 text-blue-500" />
                  Modo offline melhorado
                </div>
              </div>

              {/* Progress bar */}
              {isUpdating && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Baixando atualização...</span>
                    <span>2.3MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs h-8"
                >
                  {isUpdating ? (
                    <motion.div
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <Download className="w-3 h-3 mr-2" />
                  )}
                  {isUpdating ? 'Atualizando...' : 'Atualizar Agora'}
                </Button>
                
                {!isUpdating && (
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                    className="text-xs h-8 px-3"
                  >
                    Depois
                  </Button>
                )}
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 mt-2 text-center">
                Atualização automática • Sem perda de dados
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdatePrompt;
