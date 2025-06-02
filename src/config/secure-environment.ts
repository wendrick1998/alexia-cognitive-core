
/**
 * @description Secure environment configuration with proper validation
 * @created_by Security Audit - Alex iA
 */

interface SecureEnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
  };
  security: {
    enableCSP: boolean;
    enableRateLimit: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  
  if (!value && !fallback) {
    console.error(`❌ Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || fallback || '';
};

// Validate Supabase URL format
const validateSupabaseUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('supabase.co') || 
           parsed.hostname.includes('localhost') ||
           parsed.hostname.includes('127.0.0.1');
  } catch {
    return false;
  }
};

// Validate Supabase anon key format
const validateSupabaseKey = (key: string): boolean => {
  return key.startsWith('eyJ') && key.length > 100; // JWT format check
};

export const secureConfig: SecureEnvironmentConfig = {
  supabase: {
    url: (() => {
      const url = getEnvVar('VITE_SUPABASE_URL', 'https://wmxscmwtaqyduotuectx.supabase.co');
      if (!validateSupabaseUrl(url)) {
        throw new Error('Invalid Supabase URL format');
      }
      return url;
    })(),
    anonKey: (() => {
      const key = getEnvVar(
        'VITE_SUPABASE_ANON_KEY',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteHNjbXd0YXF5ZHVvdHVlY3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyOTAwNjksImV4cCI6MjA2Mzg2NjA2OX0.QydAwz1AUU0GYB8I3aR6uXvzd4c52HWBpNiCnbhC-OU'
      );
      if (!validateSupabaseKey(key)) {
        console.warn('⚠️ Supabase key format appears invalid');
      }
      return key;
    })()
  },
  app: {
    environment: getEnvVar('VITE_ENVIRONMENT', 'development'),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  },
  security: {
    enableCSP: true,
    enableRateLimit: true,
    logLevel: import.meta.env.DEV ? 'debug' : 'warn'
  }
};

// Security configuration logging (safe for development)
if (secureConfig.app.isDevelopment) {
  console.log('🔧 Secure Configuration Loaded:', {
    environment: secureConfig.app.environment,
    supabaseConfigured: !!secureConfig.supabase.url,
    securityEnabled: secureConfig.security.enableCSP
  });
}

export default secureConfig;
