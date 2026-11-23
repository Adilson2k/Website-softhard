/**
 * Sistema de logging estruturado para CMS Zolangola
 * - Desabilita automaticamente logs em produção para manter console limpo
 * - Sanitiza dados sensíveis (Firebase API keys, tokens, senhas)
 * - Previne exposição de dados confidenciais
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: keyof typeof LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface SourceContext {
  file?: string;
  fn?: string;
  userId?: string;
  action?: string;
}

const LOG_LEVEL_NAME: Record<number, keyof typeof LogLevel> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

/**
 * Padrões de dados sensíveis que devem ser sanitizados
 */
const SENSITIVE_PATTERNS = [
  // Firebase
  /FIREBASE_API_KEY|apiKey/i,
  /FIREBASE_AUTH_DOMAIN|authDomain/i,
  /FIREBASE_[A-Z_]+/i,
  /firebaseConfig/i,
  
  // Autenticação
  /password|passwd|pwd/i,
  /token|authorization|bearer/i,
  /secret|api_key|apikey/i,
  /refresh_token|refresh_token/i,
  
  // OAuth
  /client_secret|clientSecret/i,
  /oauth_token|oauthToken/i,
  /access_token|accessToken/i,
  
  // Banco de dados
  /database_url|databaseUrl/i,
  /connection_string|connectionString/i,
  
  // Email/SMTP
  /smtp_pass|smtpPassword/i,
  /email.*password/i,
];

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
    this.isProduction = import.meta.env.MODE === 'production';
    
    // Em produção, desabilitar completamente console
    if (this.isProduction) {
      this.disableConsoleInProduction();
    }
  }

  /**
   * Desabilita console.log, console.warn, console.error em produção
   * para manter o console limpo
   */
  private disableConsoleInProduction() {
    if (!window) return;
    
    // Armazenar métodos originais em caso de necessidade de debugging
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;
    const originalInfo = console.info;
    
    // Substituir com no-ops
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.debug = () => {};
    console.info = () => {};
    
    // Disponibilizar originais em __ZOLANGOLA_CMS_DEBUG__ se necessário
    (window as any).__ZOLANGOLA_CMS_DEBUG__ = {
      originalLog,
      originalWarn,
      originalError,
      originalDebug,
      originalInfo,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  /**
   * Sanitiza dados sensíveis de contexto e valores
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized: LogContext = {};
    
    for (const [key, value] of Object.entries(context)) {
      // Verificar se a chave é sensível
      const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
      
      if (isSensitiveKey) {
        // Mascarar valor sensível
        if (typeof value === 'string' && value.length > 0) {
          sanitized[key] = `***${value.slice(-4)}`;
        } else {
          sanitized[key] = '***REDACTED***';
        }
      } else if (typeof value === 'object' && value !== null && !(value instanceof Error)) {
        // Recursivamente sanitizar objetos aninhados
        sanitized[key] = this.sanitizeContext(value as LogContext);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Sanitiza stack traces removendo caminhos absolutos sensíveis
   */
  private sanitizeStackTrace(stack?: string): string | undefined {
    if (!stack) return undefined;
    
    // Remover caminhos absolutos do sistema
    return stack
      .replace(/\/Users\/[^/]+/g, '/Users/***')
      .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\***')
      .replace(/\/home\/[^/]+/g, '/home/***');
  }

  private normalizeError(error?: unknown) {
    if (!error) return undefined;
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.sanitizeStackTrace(error.stack),
      };
    }

    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  private buildEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LOG_LEVEL_NAME[level],
      message,
      context: this.sanitizeContext(context),
      error: this.normalizeError(error),
    };
  }

  private formatEntry(entry: LogEntry) {
    return JSON.stringify(entry);
  }

  private writeDevLog(entry: LogEntry) {
    const formatted = this.formatEntry(entry);

    switch (entry.level) {
      case 'DEBUG':
        console.debug(formatted);
        break;
      case 'INFO':
        console.info(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(formatted);
        break;
    }
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      const queue = ((window as any).__ZOLANGOLA_CMS_LOGS__ ||= []);
      queue.push(entry);
    } catch {
      // Intencionalmente silencioso em produção para manter o console limpo.
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    if (!this.shouldLog(level)) return;

    const entry = this.buildEntry(level, message, context, error);

    if (this.isProduction) {
      void this.sendToLoggingService(entry);
      return;
    }

    this.writeDevLog(entry);
  }

  private withSource(context?: LogContext, source?: SourceContext): LogContext | undefined {
    if (!context && !source) return undefined;

    return {
      ...context,
      ...(source?.file ? { file: source.file } : {}),
      ...(source?.fn ? { function: source.fn } : {}),
      ...(source?.userId ? { userId: source.userId } : {}),
      ...(source?.action ? { action: source.action } : {}),
    };
  }

  debug(message: string, context?: LogContext, source?: SourceContext) {
    this.log(LogLevel.DEBUG, message, this.withSource(context, source));
  }

  info(message: string, context?: LogContext, source?: SourceContext) {
    this.log(LogLevel.INFO, message, this.withSource(context, source));
  }

  warn(message: string, context?: LogContext, source?: SourceContext) {
    this.log(LogLevel.WARN, message, this.withSource(context, source));
  }

  error(message: string, error?: unknown, context?: LogContext, source?: SourceContext) {
    this.log(LogLevel.ERROR, message, this.withSource(context, source), error);
  }

  fatal(message: string, error?: unknown, context?: LogContext, source?: SourceContext) {
    this.log(LogLevel.FATAL, message, this.withSource(context, source), error);
  }

  audit(action: string, context?: LogContext, source?: SourceContext) {
    this.log(
      LogLevel.INFO,
      `AUDIT:${action}`,
      this.withSource(
        {
          ...context,
          audit: true,
        },
        {
          ...source,
          action,
        }
      )
    );
  }

  auth(action: string, userId?: string, context?: LogContext, source?: SourceContext) {
    this.audit(
      `auth.${action}`,
      context,
      {
        ...source,
        userId,
      }
    );
  }

  api(
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: LogContext,
    source?: SourceContext
  ) {
    this.info(`API:${method} ${url}`, { status, duration, ...context }, source);
  }

  upload(
    fileName: string,
    fileSize: number,
    success: boolean,
    context?: LogContext,
    source?: SourceContext
  ) {
    this.info(`UPLOAD:${fileName}`, { fileSize, success, ...context }, source);
  }

  validation(
    formType: string,
    errors: string[],
    context?: LogContext,
    source?: SourceContext
  ) {
    this.warn(`VALIDATION:${formType}`, { errors, ...context }, source);
  }
}

export const logger = new Logger(
  import.meta.env.MODE === 'production' ? LogLevel.INFO : LogLevel.DEBUG
);

export const log = {
  debug: (message: string, context?: LogContext, source?: SourceContext) =>
    logger.debug(message, context, source),
  info: (message: string, context?: LogContext, source?: SourceContext) =>
    logger.info(message, context, source),
  warn: (message: string, context?: LogContext, source?: SourceContext) =>
    logger.warn(message, context, source),
  error: (
    message: string,
    error?: unknown,
    context?: LogContext,
    source?: SourceContext
  ) => logger.error(message, error, context, source),
  fatal: (
    message: string,
    error?: unknown,
    context?: LogContext,
    source?: SourceContext
  ) => logger.fatal(message, error, context, source),
  audit: (action: string, context?: LogContext, source?: SourceContext) =>
    logger.audit(action, context, source),
  auth: (
    action: string,
    userId?: string,
    context?: LogContext,
    source?: SourceContext
  ) => logger.auth(action, userId, context, source),
  api: (
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: LogContext,
    source?: SourceContext
  ) => logger.api(method, url, status, duration, context, source),
  upload: (
    fileName: string,
    fileSize: number,
    success: boolean,
    context?: LogContext,
    source?: SourceContext
  ) => logger.upload(fileName, fileSize, success, context, source),
  validation: (
    formType: string,
    errors: string[],
    context?: LogContext,
    source?: SourceContext
  ) => logger.validation(formType, errors, context, source),
};
