
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const initTimeoutRef = useRef<number>();
  const mountedRef = useRef(true);

  // Storage seguro com fallbacks para Safari
  const secureStorage = useCallback(() => ({
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        try {
          sessionStorage.setItem(key, value);
        } catch (err) {
          console.warn('Storage write failed:', err);
        }
      }
    },
    getItem: (key: string) => {
      try {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      } catch (error) {
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
  }), []);

  // Login
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        const errorMessage = error.message.includes('Invalid login credentials')
          ? 'Email ou senha incorretos'
          : 'Erro no login. Tente novamente.';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { error: errorMessage };
      }

      if (data.session && data.user) {
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
      const errorMessage = 'Erro de conexão. Verifique sua internet.';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [toast]);

  // Logout
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
        error: null,
        isAuthenticated: false
      });

      return { error: null };
    } catch (err) {
      setState(prev => ({ ...prev, loading: false }));
      return { error: 'Erro no logout' };
    }
  }, [secureStorage]);

  // Cadastro
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
        const errorMessage = error.message.includes('already registered')
          ? 'Este email já está cadastrado'
          : 'Erro no cadastro. Tente novamente.';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { error: errorMessage };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (err) {
      const errorMessage = 'Erro de conexão. Verifique sua internet.';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error: null }));
        return;
      }

      if (data.session && data.user) {
        setState({
          user: data.user,
          session: data.session,
          loading: false,
          error: null,
          isAuthenticated: true
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Inicialização
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    // Timeout de segurança - força saída do loading após 5 segundos
    initTimeoutRef.current = window.setTimeout(() => {
      if (mounted) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 5000);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
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
          setState({
            user: session.user,
            session,
            loading: false,
            error: null,
            isAuthenticated: true
          });
        } else {
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
        if (!mountedRef.current) return;

        // Limpar timeout se recebemos um evento de auth
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }

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
        } else {
          setState(prev => ({ 
            ...prev, 
            loading: false 
          }));
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      mountedRef.current = false;
      subscription.unsubscribe();
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    signIn,
    signOut,
    signUp,
    clearError,
    refreshSession
  };
}
