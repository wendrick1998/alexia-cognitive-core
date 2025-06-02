
/**
 * @description Autenticação otimizada para PWA/Safari
 * @created_by Security Team - Alex iA
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PWAAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function usePWAAuth() {
  const [state, setState] = useState<PWAAuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  const { toast } = useToast();

  // Função para verificar se estamos em Safari/PWA
  const isSafariOrPWA = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return /Safari/.test(userAgent) || isStandalone;
  }, []);

  // Armazenamento seguro para Safari/PWA
  const secureStorage = useCallback({
    setItem: (key: string, value: string) => {
      try {
        if (isSafariOrPWA()) {
          // Para Safari/PWA, usar sessionStorage como fallback
          sessionStorage.setItem(key, value);
        }
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Storage failed, using memory storage:', error);
      }
    },
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      } catch (error) {
        console.warn('Storage read failed:', error);
        return null;
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Storage removal failed:', error);
      }
    }
  }, [isSafariOrPWA]);

  // Login simplificado para PWA
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('🔐 Iniciando login PWA...', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message.includes('Invalid login credentials')
            ? 'Email ou senha incorretos'
            : 'Erro no login. Tente novamente.'
        }));
        return { error: error.message };
      }

      if (data.session && data.user) {
        console.log('✅ Login PWA bem-sucedido:', data.user.email);
        
        // Armazenar sessão de forma segura
        secureStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        
        setState({
          user: data.user,
          session: data.session,
          loading: false,
          error: null,
          isAuthenticated: true
        });

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${data.user.email}`,
        });

        return { error: null };
      }

      return { error: 'Sessão não encontrada' };
    } catch (err) {
      console.error('❌ Erro inesperado no login PWA:', err);
      const errorMessage = 'Erro de conexão. Verifique sua internet.';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [secureStorage, toast]);

  // Logout simplificado
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await supabase.auth.signOut();
      secureStorage.removeItem('supabase.auth.token');
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });

      console.log('✅ Logout PWA realizado');
      return { error: null };
    } catch (err) {
      console.error('❌ Erro no logout PWA:', err);
      setState(prev => ({ ...prev, loading: false }));
      return { error: 'Erro no logout' };
    }
  }, [secureStorage]);

  // Cadastro simplificado
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validação básica
      if (password.length < 6) {
        setState(prev => ({ ...prev, loading: false, error: 'Senha deve ter pelo menos 6 caracteres' }));
        return { error: 'Senha deve ter pelo menos 6 caracteres' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        const errorMessage = error.message.includes('already registered')
          ? 'Este email já está cadastrado'
          : 'Erro no cadastro. Tente novamente.';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { error: errorMessage };
      }

      setState(prev => ({ ...prev, loading: false }));
      console.log('✅ Cadastro PWA realizado:', data.user?.email);
      
      return { error: null };
    } catch (err) {
      console.error('❌ Erro inesperado no cadastro PWA:', err);
      const errorMessage = 'Erro de conexão. Verifique sua internet.';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Inicialização da autenticação
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticação PWA...');

        // Verificar sessão existente
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          if (mounted) {
            setState({
              user: null,
              session: null,
              loading: false,
              error: null,
              isAuthenticated: false
            });
          }
          return;
        }

        if (session && session.user && mounted) {
          console.log('✅ Sessão encontrada:', session.user.email);
          setState({
            user: session.user,
            session,
            loading: false,
            error: null,
            isAuthenticated: true
          });
        } else {
          console.log('ℹ️ Nenhuma sessão encontrada');
          if (mounted) {
            setState({
              user: null,
              session: null,
              loading: false,
              error: null,
              isAuthenticated: false
            });
          }
        }
      } catch (err) {
        console.error('❌ Erro na inicialização PWA:', err);
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            error: null,
            isAuthenticated: false
          });
        }
      }
    };

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state change PWA:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session) {
          setState({
            user: session.user,
            session,
            loading: false,
            error: null,
            isAuthenticated: true
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            loading: false,
            error: null,
            isAuthenticated: false
          });
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    signIn,
    signOut,
    signUp,
    clearError
  };
}
