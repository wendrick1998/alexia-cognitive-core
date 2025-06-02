
/**
 * @file SecurityModule.ts
 * @description Módulo de segurança avançado para Alex iA
 * @author Alex iA Security Team
 */

export interface SecurityConfig {
  enableCSP: boolean;
  enableRateLimit: boolean;
  enableInputSanitization: boolean;
  enableAuditLog: boolean;
  maxRequestsPerMinute: number;
  sessionTimeout: number;
}

export interface SecurityEvent {
  id: string;
  type: 'rate_limit' | 'xss_attempt' | 'sql_injection' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

class SecurityModule {
  private config: SecurityConfig;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private auditLog: SecurityEvent[] = [];
  private sessionTokens: Map<string, { expires: Date; userId: string }> = new Map();

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableCSP: true,
      enableRateLimit: true,
      enableInputSanitization: true,
      enableAuditLog: true,
      maxRequestsPerMinute: 60,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
      ...config
    };

    this.initializeCSP();
    this.startCleanupTasks();
  }

  private initializeCSP() {
    if (!this.config.enableCSP) return;

    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.openai.com https://*.anthropic.com https://*.groq.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://*.openai.com https://*.anthropic.com https://*.groq.com wss://*.supabase.co",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');

    if (typeof document !== 'undefined') {
      let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!cspMeta) {
        cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        document.head.appendChild(cspMeta);
      }
      cspMeta.setAttribute('content', cspPolicy);
    }
  }

  public checkRateLimit(identifier: string): boolean {
    if (!this.config.enableRateLimit) return true;

    const now = Date.now();
    const limit = this.rateLimitMap.get(identifier);

    if (!limit || now > limit.resetTime) {
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + 60000 // 1 minuto
      });
      return true;
    }

    if (limit.count >= this.config.maxRequestsPerMinute) {
      this.logSecurityEvent({
        type: 'rate_limit',
        severity: 'medium',
        ip: identifier,
        userAgent: 'unknown',
        details: { attempts: limit.count, limit: this.config.maxRequestsPerMinute }
      });
      return false;
    }

    limit.count++;
    return true;
  }

  public sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) return input;

    // Detectar tentativas de XSS
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent({
          type: 'xss_attempt',
          severity: 'high',
          ip: 'unknown',
          userAgent: 'unknown',
          details: { input: input.substring(0, 100), pattern: pattern.source }
        });
        break;
      }
    }

    // Detectar tentativas de SQL injection
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(--|#|\/\*|\*\/)/g,
      /('|(\\')|(\")|(\\\")|(;))/g
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        this.logSecurityEvent({
          type: 'sql_injection',
          severity: 'critical',
          ip: 'unknown',
          userAgent: 'unknown',
          details: { input: input.substring(0, 100), pattern: pattern.source }
        });
        break;
      }
    }

    // Sanitizar HTML básico
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  public generateSecureToken(): string {
    // Usar Web Crypto API do browser ao invés do módulo crypto do Node.js
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  public createSession(userId: string): string {
    const token = this.generateSecureToken();
    const expires = new Date(Date.now() + this.config.sessionTimeout);
    
    this.sessionTokens.set(token, { expires, userId });
    
    return token;
  }

  public validateSession(token: string): { valid: boolean; userId?: string } {
    const session = this.sessionTokens.get(token);
    
    if (!session) {
      return { valid: false };
    }

    if (session.expires < new Date()) {
      this.sessionTokens.delete(token);
      return { valid: false };
    }

    return { valid: true, userId: session.userId };
  }

  public revokeSession(token: string): void {
    this.sessionTokens.delete(token);
  }

  public async hashSensitiveData(data: string, salt?: string): Promise<string> {
    // Usar Web Crypto API para hash
    const encoder = new TextEncoder();
    const actualSalt = salt || this.generateSecureToken();
    const dataWithSalt = data + actualSalt;
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataWithSalt));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>) {
    if (!this.config.enableAuditLog) return;

    const securityEvent: SecurityEvent = {
      id: this.generateSecureToken(),
      timestamp: new Date(),
      ...event
    };

    this.auditLog.push(securityEvent);
    
    // Manter apenas os últimos 1000 eventos
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    // Em produção, enviar para sistema de monitoramento
    console.warn('Security Event:', securityEvent);
  }

  private startCleanupTasks() {
    // Limpar rate limits expirados a cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      for (const [key, limit] of this.rateLimitMap.entries()) {
        if (now > limit.resetTime) {
          this.rateLimitMap.delete(key);
        }
      }
    }, 5 * 60 * 1000);

    // Limpar sessões expiradas a cada hora
    setInterval(() => {
      const now = new Date();
      for (const [token, session] of this.sessionTokens.entries()) {
        if (session.expires < now) {
          this.sessionTokens.delete(token);
        }
      }
    }, 60 * 60 * 1000);
  }

  public getSecurityStats() {
    return {
      activeRateLimits: this.rateLimitMap.size,
      activeSessions: this.sessionTokens.size,
      securityEvents: this.auditLog.length,
      recentEvents: this.auditLog.slice(-10)
    };
  }

  public exportAuditLog(): SecurityEvent[] {
    return [...this.auditLog];
  }
}

export const securityModule = new SecurityModule();
