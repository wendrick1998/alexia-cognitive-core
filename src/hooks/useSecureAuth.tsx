
/**
 * @description Secure authentication hook with enhanced validation
 * @created_by Security Audit - Alex iA
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/secure-client';
import { errorHandler } from '@/lib/error-handler';
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter';
import { validateSafely } from '@/lib/validation';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Email inválido').max(255);
const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter ao menos: 1 minúscula, 1 maiúscula, 1 número');

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  securityMetrics: {
    failedAttempts: number;
    lastActivity: Date | null;
    isRateLimited: boolean;
  };
}

export function useSecureAuth(): SecureAuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Check rate limiting
  const isRateLimited = useCallback((action: string): boolean => {
    const identifier = `auth_${action}_${Date.now()}`;
    return !rateLimiter.isAllowed({
      maxRequests: 5,
      windowMs: 300000, // 5 attempts per 5 minutes
      identifier
    });
  }, []);

  // Secure sign up
  const signUp = useCallback(async (email: string, password: string) => {
    if (isRateLimited('signup')) {
      const errorMsg = 'Muitas tentativas de cadastro. Aguarde 5 minutos.';
      setError(errorMsg);
      return { error: errorMsg };
    }

    // Validate inputs
    const emailValidation = validateSafely(emailSchema, email, 'signup_email');
    if (!emailValidation.success) {
      setError(emailValidation.error);
      return { error: emailValidation.error };
    }

    const passwordValidation = validateSafely(passwordSchema, password, 'signup_password');
    if (!passwordValidation.success) {
      setError(passwordValidation.error);
      return { error: passwordValidation.error };
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email: emailValidation.data,
        password: passwordValidation.data,
      });

      if (error) {
        await errorHandler.logSecurityEvent({
          action: 'signup_failed',
          resource: 'auth',
          severity: 'low',
          details: { email: emailValidation.data, reason: error.message }
        });

        const friendlyMessage = error.message.includes('already registered')
          ? 'Este email já está cadastrado. Tente fazer login.'
          : error.message.includes('password')
          ? 'Senha não atende aos critérios de segurança.'
          : 'Erro no cadastro. Tente novamente.';
        
        setError(friendlyMessage);
        setFailedAttempts(prev => prev + 1);
        return { error: friendlyMessage };
      }

      await errorHandler.logSecurityEvent({
        action: 'signup_success',
        resource: 'auth',
        severity: 'low',
        details: { email: emailValidation.data }
      });

      return { error: null };
    } catch (err) {
      const errorMsg = errorHandler.handleUserError(err, 'signup');
      setError(errorMsg);
      return { error: errorMsg };
    }
  }, [isRateLimited]);

  // Secure sign in
  const signIn = useCallback(async (email: string, password: string) => {
    if (isRateLimited('signin')) {
      const errorMsg = 'Muitas tentativas de login. Aguarde 5 minutos.';
      setError(errorMsg);
      return { error: errorMsg };
    }

    // Basic validation (less strict for login)
    const emailValidation = validateSafely(
      z.string().email().max(255), 
      email, 
      'signin_email'
    );
    if (!emailValidation.success) {
      setError(emailValidation.error);
      return { error: emailValidation.error };
    }

    if (!password || password.length > 128) {
      setError('Credenciais inválidas');
      return { error: 'Credenciais inválidas' };
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: emailValidation.data,
        password,
      });

      if (error) {
        await errorHandler.logSecurityEvent({
          action: 'signin_failed',
          resource: 'auth',
          severity: 'medium',
          details: { email: emailValidation.data, reason: error.message }
        });

        const friendlyMessage = error.message.includes('Invalid login credentials')
          ? 'Email ou senha incorretos.'
          : error.message.includes('Email not confirmed')
          ? 'Confirme seu email antes de fazer login.'
          : 'Erro no login. Tente novamente.';
        
        setError(friendlyMessage);
        setFailedAttempts(prev => prev + 1);
        return { error: friendlyMessage };
      }

      await errorHandler.logSecurityEvent({
        action: 'signin_success',
        resource: 'auth',
        severity: 'low',
        details: { email: emailValidation.data }
      });

      setFailedAttempts(0);
      setLastActivity(new Date());
      return { error: null };
    } catch (err) {
      const errorMsg = errorHandler.handleUserError(err, 'signin');
      setError(errorMsg);
      setFailedAttempts(prev => prev + 1);
      return { error: errorMsg };
    }
  }, [isRateLimited]);

  // Secure sign out
  const signOut = useCallback(async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();

      if (error) {
        const errorMsg = errorHandler.handleUserError(error, 'signout');
        setError(errorMsg);
        return { error: errorMsg };
      }

      if (user) {
        await errorHandler.logSecurityEvent({
          userId: user.id,
          action: 'signout_success',
          resource: 'auth',
          severity: 'low',
          details: {}
        });
      }

      setFailedAttempts(0);
      setLastActivity(null);
      return { error: null };
    } catch (err) {
      const errorMsg = errorHandler.handleUserError(err, 'signout');
      setError(errorMsg);
      return { error: errorMsg };
    }
  }, [user]);

  // Refresh session with security checks
  const refreshSession = useCallback(async () => {
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
        setLastActivity(new Date());
      }
    } catch (err) {
      console.error('Erro inesperado ao renovar sessão:', err);
      setError('Erro de conexão. Verifique sua internet.');
    }
  }, [signOut]);

  // Initialize auth with security monitoring
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔐 Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);
        setLastActivity(new Date());

        if (session && event === 'SIGNED_IN') {
          setError(null);
          setFailedAttempts(0);

          // Create or update user in our users table
          try {
            const { error } = await supabase
              .from('users')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || null,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              });

            if (error) {
              console.error('Erro ao criar/atualizar usuário:', error);
            }
          } catch (err) {
            console.error('Erro no upsert do usuário:', err);
          }
        }

        if (event === 'TOKEN_REFRESHED' && !session) {
          setError('Sessão expirada. Faça login novamente.');
        }

        if (event === 'SIGNED_OUT') {
          setError(null);
          setFailedAttempts(0);
          setLastActivity(null);
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
          if (session) {
            setLastActivity(new Date());
          }
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

  return {
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
    securityMetrics: {
      failedAttempts,
      lastActivity,
      isRateLimited: isRateLimited('general')
    }
  };
}
