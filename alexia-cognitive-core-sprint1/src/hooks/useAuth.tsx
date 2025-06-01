
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearError = () => setError(null);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        setError('Sessão expirada. Faça login novamente.');
        await signOut();
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setError(null);
      }
    } catch (err) {
      console.error('Erro inesperado ao renovar sessão:', err);
      setError('Erro de conexão. Verifique sua internet.');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear any previous errors on successful auth
        if (session && event === 'SIGNED_IN') {
          setError(null);
          
          // Create or update user in our users table
          setTimeout(async () => {
            try {
              const { error } = await supabase
                .from('users')
                .upsert({
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.name || null
                }, {
                  onConflict: 'id'
                });
              
              if (error) {
                console.error('Erro ao criar/atualizar usuário:', error);
              }
            } catch (err) {
              console.error('Erro no upsert do usuário:', err);
            }
          }, 0);
        }
        
        // Handle auth errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          setError('Sessão expirada. Faça login novamente.');
        }
        
        if (event === 'SIGNED_OUT') {
          setError(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
          if (error.message.includes('refresh_token_not_found')) {
            setError('Sessão expirada. Faça login novamente.');
            await supabase.auth.signOut();
          } else {
            setError('Erro de autenticação. Tente novamente.');
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Erro inesperado na inicialização da auth:', err);
        setError('Erro de conexão. Verifique sua internet.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        const friendlyMessage = error.message.includes('already registered') 
          ? 'Este email já está cadastrado. Tente fazer login.'
          : error.message.includes('password') 
          ? 'A senha deve ter pelo menos 6 caracteres.'
          : error.message;
        setError(friendlyMessage);
      }
      
      return { error };
    } catch (err) {
      const errorMsg = 'Erro inesperado no cadastro';
      setError(errorMsg);
      return { error: { message: errorMsg } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const friendlyMessage = error.message.includes('Invalid login credentials') 
          ? 'Email ou senha incorretos.'
          : error.message.includes('Email not confirmed')
          ? 'Confirme seu email antes de fazer login.'
          : error.message;
        setError(friendlyMessage);
      }
      
      return { error };
    } catch (err) {
      const errorMsg = 'Erro inesperado no login';
      setError(errorMsg);
      return { error: { message: errorMsg } };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
      }
      
      return { error };
    } catch (err) {
      const errorMsg = 'Erro ao fazer logout';
      setError(errorMsg);
      return { error: { message: errorMsg } };
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!(session && user),
    signUp,
    signIn,
    signOut,
    refreshSession,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
