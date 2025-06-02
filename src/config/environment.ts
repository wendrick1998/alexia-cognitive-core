
/**
 * @description Environment configuration with secure fallbacks
 * @created_by Manus AI - Phase 4: Security Implementation
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  openai: {
    apiKey: string;
  };
  project: {
    id: string;
    authSecret: string;
  };
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string, fallback?: string, isRequired = true): string => {
  // In Vite, environment variables are accessed via import.meta.env
  const value = import.meta.env[key] || fallback;
  
  if (isRequired && !value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    if (import.meta.env.NODE_ENV !== 'production') {
      console.warn(`⚠️ Using fallback for ${key} in development mode`);
    }
  }
  
  return value || '';
};

export const config: EnvironmentConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL', 'https://wmxscmwtaqyduotuectx.supabase.co'),
    anonKey: getEnvVar(
      'VITE_SUPABASE_ANON_KEY', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteHNjbXd0YXF5ZHVvdHVlY3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyOTAwNjksImV4cCI6MjA2Mzg2NjA2OX0.QydAwz1AUU0GYB8I3aR6uXvzd4c52HWBpNiCnbhC-OU'
    )
  },
  openai: {
    apiKey: getEnvVar('VITE_OPENAI_API_KEY', '', false)
  },
  project: {
    id: getEnvVar('VITE_PROJECT_ID', 'wmxscmwtaqyduotuectx'),
    authSecret: getEnvVar('VITE_AUTH_SECRET', '', false)
  },
  environment: getEnvVar('VITE_ENVIRONMENT', 'development', false),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
};

// Log configuration status in development
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    environment: config.environment,
    supabaseConfigured: !!config.supabase.url,
    openaiConfigured: !!config.openai.apiKey,
    projectId: config.project.id
  });
}

export default config;
