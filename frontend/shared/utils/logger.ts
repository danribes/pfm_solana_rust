export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  category?: string;
  meta?: Record<string, any>;
  environment: string;
  userAgent?: string;
  url?: string;
  stack?: string;
}

// Sensitive data patterns for masking
const SENSITIVE_PATTERNS = [
  { pattern: /password/i, replacement: '[REDACTED]' },
  { pattern: /token/i, replacement: '[REDACTED]' },
  { pattern: /secret/i, replacement: '[REDACTED]' },
  { pattern: /key/i, replacement: '[REDACTED]' },
  { pattern: /private.*key/i, replacement: '[REDACTED]' },
  { pattern: /wallet.*seed/i, replacement: '[REDACTED]' },
  { pattern: /mnemonic/i, replacement: '[REDACTED]' },
  { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, replacement: '[CARD_REDACTED]' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' }
];

class Logger {
  private logLevel: LogLevel;
  private service: string;
  private environment: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 100;
  private flushInterval: number = 30000; // 30 seconds
  private logEndpoint: string;
  private isContainerMode: boolean;

  constructor(service: string) {
    this.service = service;
    this.environment = process.env.NODE_ENV || 'development';
    this.logLevel = this.getLogLevelFromEnv();
    this.logEndpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT || '/api/logs';
    this.isContainerMode = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true';
    
    // Start auto-flush in browser environment
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), this.flushInterval);
      
      // Flush logs on page unload
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
      
      // Flush logs on visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }

  private getLogLevelFromEnv(): LogLevel {
    const level = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase() || 'info';
    switch (level) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private maskSensitiveData(message: string, meta?: Record<string, any>): { message: string; meta?: Record<string, any> } {
    let maskedMessage = message;
    let maskedMeta = meta;

    // Mask message
    SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
      maskedMessage = maskedMessage.replace(pattern, replacement);
    });

    // Mask metadata
    if (meta) {
      const metaStr = JSON.stringify(meta);
      let maskedMetaStr = metaStr;
      SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
        maskedMetaStr = maskedMetaStr.replace(pattern, replacement);
      });
      
      try {
        maskedMeta = JSON.parse(maskedMetaStr);
      } catch (e) {
        maskedMeta = { original: '[PARSE_ERROR]' };
      }
    }

    return { message: maskedMessage, meta: maskedMeta };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    component?: string,
    meta?: Record<string, any>,
    category?: string
  ): LogEntry {
    const { message: maskedMessage, meta: maskedMeta } = this.maskSensitiveData(message, meta);
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message: maskedMessage,
      service: this.service,
      environment: this.environment,
      ...(component && { component }),
      ...(category && { category }),
      ...(maskedMeta && { meta: maskedMeta })
    };

    // Add browser-specific information
    if (typeof window !== 'undefined') {
      entry.userAgent = navigator.userAgent;
      entry.url = window.location.href;
      
      // Try to get user/session info from localStorage or context
      try {
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          entry.userId = user.id;
        }
        
        const sessionInfo = localStorage.getItem('session');
        if (sessionInfo) {
          const session = JSON.parse(sessionInfo);
          entry.sessionId = session.id;
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    return entry;
  }

  private log(
    level: LogLevel,
    message: string,
    component?: string,
    meta?: Record<string, any>,
    category?: string
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, component, meta, category);

    // Console output with appropriate method
    if (typeof console !== 'undefined') {
      const logMethod = level === LogLevel.ERROR ? 'error' :
                       level === LogLevel.WARN ? 'warn' :
                       level === LogLevel.DEBUG ? 'debug' : 'log';
      
      if (this.environment === 'development') {
        console[logMethod](`[${entry.timestamp}] ${entry.level} [${entry.service}${component ? `/${component}` : ''}]: ${entry.message}`, meta || '');
      } else {
        console[logMethod](JSON.stringify(entry));
      }
    }

    // Add to buffer for remote logging
    this.logBuffer.push(entry);

    // Auto-flush if buffer is full
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }

    // For critical errors, flush immediately
    if (level === LogLevel.ERROR) {
      this.flush();
    }
  }

  public debug(message: string, component?: string, meta?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, component, meta, 'DEBUG');
  }

  public info(message: string, component?: string, meta?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, component, meta, 'INFO');
  }

  public warn(message: string, component?: string, meta?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, component, meta, 'WARNING');
  }

  public error(message: string, component?: string, meta?: Record<string, any>, error?: Error): void {
    const errorMeta = { ...meta };
    
    if (error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.log(LogLevel.ERROR, message, component, errorMeta, 'ERROR');
  }

  // Business event logging
  public business(event: string, data?: Record<string, any>, component?: string): void {
    this.log(LogLevel.INFO, `Business Event: ${event}`, component, data, 'BUSINESS');
  }

  // Performance logging
  public performance(metric: string, value: number, unit: string = 'ms', component?: string): void {
    this.log(LogLevel.INFO, `Performance: ${metric}`, component, { metric, value, unit }, 'PERFORMANCE');
  }

  // Security event logging
  public security(event: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', data?: Record<string, any>): void {
    this.log(LogLevel.WARN, `Security Event: ${event}`, undefined, { ...data, severity }, 'SECURITY');
  }

  // User interaction logging
  public interaction(action: string, component: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, `User Interaction: ${action}`, component, data, 'INTERACTION');
  }

  // Analytics event logging
  public analytics(event: string, properties?: Record<string, any>): void {
    this.log(LogLevel.INFO, `Analytics: ${event}`, undefined, properties, 'ANALYTICS');
  }

  // Flush logs to remote endpoint
  public async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      if (typeof fetch !== 'undefined') {
        await fetch(this.logEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logs: logsToSend }),
        });
      }
    } catch (error) {
      // Re-add logs to buffer if sending failed
      this.logBuffer.unshift(...logsToSend);
      console.error('Failed to send logs to remote endpoint:', error);
    }
  }

  // Get current log level
  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  // Set log level
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Create child logger with component context
  public child(component: string): ComponentLogger {
    return new ComponentLogger(this, component);
  }
}

class ComponentLogger {
  constructor(private parent: Logger, private component: string) {}

  public debug(message: string, meta?: Record<string, any>): void {
    this.parent.debug(message, this.component, meta);
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.parent.info(message, this.component, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.parent.warn(message, this.component, meta);
  }

  public error(message: string, meta?: Record<string, any>, error?: Error): void {
    this.parent.error(message, this.component, meta, error);
  }

  public business(event: string, data?: Record<string, any>): void {
    this.parent.business(event, data, this.component);
  }

  public performance(metric: string, value: number, unit?: string): void {
    this.parent.performance(metric, value, unit, this.component);
  }

  public interaction(action: string, data?: Record<string, any>): void {
    this.parent.interaction(action, this.component, data);
  }
}

// Create logger instances for different services
export const adminLogger = new Logger('pfm-admin');
export const memberLogger = new Logger('pfm-member');
export const sharedLogger = new Logger('pfm-shared');

// Export logger class for custom instances
export { Logger }; 