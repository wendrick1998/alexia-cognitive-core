/**
 * @modified_by Manus AI
 * @date 1 de junho de 2025
 * @description Módulo de segurança para o Alex iA
 * Implementa CSP headers, rate limiting, sanitização e outras proteções
 */

import { sanitize } from 'dompurify';
import { createClient } from '@supabase/supabase-js';

// Configurações de segurança
const RATE_LIMIT_REQUESTS = 100; // Requisições por janela de tempo
const RATE_LIMIT_WINDOW = 60 * 1000; // Janela de tempo em ms (1 minuto)
const RATE_LIMIT_STORAGE_KEY = 'alexia_rate_limit';

// Cache para rate limiting em memória
const rateLimitCache: Record<string, { count: number, timestamp: number }> = {};

/**
 * Sanitiza conteúdo HTML para prevenir XSS
 * @param content Conteúdo a ser sanitizado
 * @returns Conteúdo sanitizado
 */
export const sanitizeContent = (content: string): string => {
  if (!content) return '';
  return sanitize(content);
};

/**
 * Verifica se uma requisição deve ser limitada por rate limiting
 * @param userId ID do usuário ou endereço IP
 * @returns true se a requisição deve ser bloqueada, false caso contrário
 */
export const shouldRateLimit = (userId: string): boolean => {
  const now = Date.now();
  
  // Inicializa ou recupera o registro de rate limit para o usuário
  if (!rateLimitCache[userId]) {
    rateLimitCache[userId] = { count: 0, timestamp: now };
  }
  
  const userLimit = rateLimitCache[userId];
  
  // Reseta o contador se estiver em uma nova janela de tempo
  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    userLimit.count = 0;
    userLimit.timestamp = now;
  }
  
  // Incrementa o contador e verifica se excedeu o limite
  userLimit.count++;
  return userLimit.count > RATE_LIMIT_REQUESTS;
};

/**
 * Gera headers CSP para proteção contra XSS e outras vulnerabilidades
 * @returns Objeto com headers de segurança
 */
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://cdn.jsdelivr.net https://*.supabase.co",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.groq.com https://api.deepseek.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};

/**
 * Valida entrada de usuário para prevenir injeções
 * @param input Entrada a ser validada
 * @returns true se a entrada é segura, false caso contrário
 */
export const validateUserInput = (input: string): boolean => {
  if (!input) return false;
  
  // Verifica tamanho máximo
  if (input.length > 10000) return false;
  
  // Verifica por padrões suspeitos (SQL injection, XSS, etc)
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /union\s+select/gi,
    /exec\(/gi,
    /eval\(/gi
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Registra tentativa de violação de segurança
 * @param userId ID do usuário
 * @param eventType Tipo de evento de segurança
 * @param details Detalhes adicionais
 */
export const logSecurityEvent = async (
  userId: string, 
  eventType: 'rate_limit' | 'xss_attempt' | 'injection_attempt' | 'unauthorized_access',
  details: Record<string, any>
): Promise<void> => {
  try {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string
    );
    
    await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        details,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

/**
 * Middleware para aplicar headers de segurança em respostas HTTP
 * Para uso em Edge Functions do Supabase
 */
export const applySecurityMiddleware = (request: Request, response: Response): Response => {
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
};
