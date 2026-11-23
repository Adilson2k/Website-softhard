/**
 * Logger Melhorado com Proteção para Produção
 * 
 * - Não exibe logs em produção
 * - Sanitiza dados sensíveis
 * - Estrutura logs com contexto
 */

const IS_PRODUCTION = import.meta.env.MODE === 'production' || import.meta.env.PROD;
const IS_DEVELOPMENT = import.meta.env.MODE === 'development' || import.meta.env.DEV;

// Padrões de dados sensíveis a sanitizar
const SENSITIVE_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  apiKey: /api[_-]?key[:\s]*([a-zA-Z0-9_-]{20,})/gi,
  token: /token[:\s]*([a-zA-Z0-9_.-]{20,})/gi,
  password: /password[:\s]*([^,\s}]+)/gi,
  bearer: /bearer\s+([a-zA-Z0-9_.-]+)/gi,
};

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

interface LogContext {
  [key: string]: any;
}

/**
 * Sanitiza dados sensíveis de um objeto
 */
function sanitizeContext(context: any): any {
  if (!context) return context;
  
  const sanitized = { ...context };
  
  // Sanitizar strings sensíveis
  Object.keys(sanitized).forEach((key) => {
    const value = sanitized[key];
    if (typeof value === 'string') {
      let sanitizedValue = value;
      Object.values(SENSITIVE_PATTERNS).forEach((pattern) => {
        sanitizedValue = sanitizedValue.replace(pattern, '[REDACTED]');
      });
      sanitized[key] = sanitizedValue;
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeContext(value);
    }
  });
  
  return sanitized;
}

/**
 * Formata mensagem de log
 */
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

class Logger {
  /**
   * Log de debug (apenas desenvolvimento)
   */
  debug(message: string, context?: LogContext): void {
    if (IS_PRODUCTION) return;
    console.debug(formatLog(LogLevel.DEBUG, message, sanitizeContext(context)));
  }

  /**
   * Log de informação
   */
  info(message: string, context?: LogContext): void {
    if (IS_PRODUCTION) return;
    console.info(formatLog(LogLevel.INFO, message, sanitizeContext(context)));
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: LogContext): void {
    if (IS_PRODUCTION) return;
    console.warn(formatLog(LogLevel.WARN, message, sanitizeContext(context)));
  }

  /**
   * Log de erro
   */
  error(message: string, context?: LogContext): void {
    if (IS_PRODUCTION) return;
    console.error(formatLog(LogLevel.ERROR, message, sanitizeContext(context)));
  }

  /**
   * Log fatal
   */
  fatal(message: string, context?: LogContext): void {
    if (IS_PRODUCTION) return;
    console.error(formatLog(LogLevel.FATAL, message, sanitizeContext(context)));
  }

  /**
   * Registra action de usuário (útil para analytics)
   */
  action(action: string, details?: LogContext): void {
    if (IS_PRODUCTION) return;
    this.info(`[ACTION] ${action}`, sanitizeContext(details));
  }

  /**
   * Registra performance metrics
   */
  performance(metric: string, duration: number, context?: LogContext): void {
    if (IS_PRODUCTION) return;
    this.info(`[PERF] ${metric}: ${duration}ms`, sanitizeContext(context));
  }
}

export const log = new Logger();
