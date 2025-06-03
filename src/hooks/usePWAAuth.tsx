
/**
 * @description Autenticação otimizada para PWA/Safari
 * @created_by Security Team - Alex iA
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PWAAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function usePWAAuth() {
  const [state, setState] = useState<PWAAuthState>({
    user: null,
    session: null,
    loading: true,
    initializing: true,
    error: null,
    isAuthenticated: false
  });

  const { toast } = useToast();
  const initializedRef = useRef(false);
  const initTimeoutRef = useRef<number>();

  console.log('🔐 usePWAAuth: estado atual', {
    user: !!state.user,
    loading: state.loading,
    initializing: state.initializing,
    isAuthenticated: state.isAuthenticated,
    error: !!state.error
  });

  // Função para verificar se estamos em Safari/PWA
  const isSafariOrPWA = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    return isSafari || isStandalone;
  }, []);

  // Storage seguro com fallbacks para Safari
  const secureStorage = useCallback(() => ({
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('localStorage falhou, usando sessionStorage:', error);
        try {
          sessionStorage.setItem(key, value);
        } catch (err) {
          console.warn('Todo storage falhou:', err);
        }
      }
    },
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      } catch (error) {
        console.warn('Storage read falhou:', error);
        return null;
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Storage removal falhou:', error);
      }
    }
  }), []);

  // Login otimizado
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔐 Iniciando login PWA...', { email, safari: isSafariOrPWA() });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        const errorMessage = error.message.includes('Invalid login credentials')
          ? 'Email ou senha incorretos'
          : 'Erro no login. Tente novamente.';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { error: errorMessage };
      }

      if (data.session && data.user) {
        console.log('✅ Login PWA bem-sucedido:', data.user.email);
        
        setState({
          user: data.user,
          session: data.session,
          loading: false,
          initializing: false,
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
  }, [isSafariOrPWA, toast]);

  // Logout otimizado
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await supabase.auth.signOut();
      const storage = secureStorage();
      storage.removeItem('supabase.auth.token');
      
      setState({
        user: null,
        session: null,
        loading: false,
        initializing: false,
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

  // Cadastro otimizado
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (password.length < 6) {
        const errorMsg = 'Senha deve ter pelo menos 6 caracteres';
        setState(prev => ({ ...prev, loading: false, error: errorMsg }));
        return { error: errorMsg };
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

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshSession = useCallback(async () => {
    if (initializedRef.current) {
      console.log('🔄 refreshSession já foi chamado, ignorando...');
      return;
    }
    
    try {
      console.log('🔄 Tentando renovar sessão...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Erro ao renovar sessão:', error);
        setState(prev => ({ ...prev, loading: false, initializing: false, error: null }));
        return;
      }

      if (data.session && data.user) {
        console.log('✅ Sessão renovada com sucesso');
        setState({
          user: data.user,
          session: data.session,
          loading: false,
          initializing: false,
          error: null,
          isAuthenticated: true
        });
      } else {
        setState(prev => ({ ...prev, loading: false, initializing: false }));
      }
    } catch (err) {
      console.error('❌ Erro inesperado ao renovar sessão:', err);
      setState(prev => ({ ...prev, loading: false, initializing: false }));
    }
  }, []);

  // Inicialização com timeout forçado para Safari
  useEffect(() => {
    if (initializedRef.current) {
      console.log('🔐 usePWAAuth: já inicializado, ignorando...');
      return;
    }
    
    let mounted = true;
    initializedRef.current = true;

    console.log('🔐 usePWAAuth: iniciando inicialização...');

    // Timeout de segurança - força saída do loading após 5 segundos
    initTimeoutRef.current = window.setTimeout(() => {
      if (mounted) {
        console.log('⏰ usePWAAuth: Timeout de inicialização atingido - forçando saída do loading');
        setState(prev => ({ ...prev, loading: false, initializing: false }));
      }
    }, 5000);

    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticação PWA...', { safari: isSafariOrPWA() });

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          if (mounted) {
            setState({
              user: null,
              session: null,
              loading: false,
              initializing: false,
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
            initializing: false,
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
              initializing: false,
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
            initializing: false,
            error: null,
            isAuthenticated: false
          });
        }
      }
    };

    // Listener otimizado para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state change PWA:', event, session?.user?.email);

        // Limpar timeout se recebemos um evento de auth
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }

        if (event === 'SIGNED_IN' && session) {
          setState({
            user: session.user,
            session,
            loading: false,
            initializing: false,
            error: null,
            isAuthenticated: true
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            loading: false,
            initializing: false,
            error: null,
            isAuthenticated: false
          });
        } else {
          // Para outros eventos, apenas atualizar o estado de inicialização
          setState(prev => ({ 
            ...prev, 
            initializing: false,
            loading: false 
          }));
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      initializedRef.current = false;
    };
  }, []); // Array vazio garante execução única

  return {
    ...state,
    signIn,
    signOut,
    signUp,
    clearError,
    refreshSession
  };
}
