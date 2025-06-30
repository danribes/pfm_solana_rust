const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure log directories exist
const logDir = process.env.LOG_DIR || path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Data masking patterns for sensitive information
const SENSITIVE_PATTERNS = [
  { pattern: /password/i, replacement: '[REDACTED]' },
  { pattern: /token/i, replacement: '[REDACTED]' },
  { pattern: /secret/i, replacement: '[REDACTED]' },
  { pattern: /key/i, replacement: '[REDACTED]' },
  { pattern: /private.*key/i, replacement: '[REDACTED]' },
  { pattern: /wallet.*seed/i, replacement: '[REDACTED]' },
  { pattern: /mnemonic/i, replacement: '[REDACTED]' },
  { pattern: /credit.*card/i, replacement: '[REDACTED]' },
  { pattern: /ssn|social.*security/i, replacement: '[REDACTED]' },
  { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, replacement: '[CARD_REDACTED]' }, // Credit card numbers
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' }, // Email addresses
];

// Custom format for masking sensitive data
const maskSensitiveData = winston.format((info) => {
  const messageStr = typeof info.message === 'object' ? JSON.stringify(info.message) : String(info.message);
  
  let maskedMessage = messageStr;
  SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
    maskedMessage = maskedMessage.replace(pattern, replacement);
  });
  
  // Also mask in metadata
  if (info.meta && typeof info.meta === 'object') {
    const metaStr = JSON.stringify(info.meta);
    let maskedMeta = metaStr;
    SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
      maskedMeta = maskedMeta.replace(pattern, replacement);
    });
    try {
      info.meta = JSON.parse(maskedMeta);
    } catch (e) {
      info.meta = { original: '[PARSE_ERROR]' };
    }
  }
  
  info.message = maskedMessage;
  return info;
});

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  maskSensitiveData(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, sessionId, category, method, endpoint, duration, statusCode, ipAddress, userAgent, ...meta }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      service: service || 'pfm-backend',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
      ...(requestId && { requestId }),
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),
      ...(category && { category }),
      ...(method && { method }),
      ...(endpoint && { endpoint }),
      ...(duration && { duration }),
      ...(statusCode && { statusCode }),
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      ...(Object.keys(meta).length > 0 && { meta })
    };
    
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  maskSensitiveData(),
  winston.format.printf(({ timestamp, level, message, service, requestId, category, ...meta }) => {
    const serviceTag = service ? `[${service}]` : '';
    const requestTag = requestId ? `[${requestId}]` : '';
    const categoryTag = category ? `[${category}]` : '';
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    
    return `${timestamp} ${level}${serviceTag}${requestTag}${categoryTag}: ${message}${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: {
    service: 'pfm-backend',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    hostname: require('os').hostname(),
    pid: process.pid
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      format: process.env.NODE_ENV === 'production' ? structuredFormat : consoleFormat
    }),
    
    // File transports for different log levels
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true
    }),
    
    // Audit log for security events
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Performance log
    new winston.transports.File({
      filename: path.join(logDir, 'performance.log'),
      level: 'info',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ],
  
  // Exception handling
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3
    })
  ],
  
  // Rejection handling
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3
    })
  ]
});

// Custom logging methods for different categories
const createCategoryLogger = (category) => ({
  debug: (message, meta = {}) => logger.debug(message, { category, ...meta }),
  info: (message, meta = {}) => logger.info(message, { category, ...meta }),
  warn: (message, meta = {}) => logger.warn(message, { category, ...meta }),
  error: (message, meta = {}) => logger.error(message, { category, ...meta })
});

// Specialized loggers
const authLogger = createCategoryLogger('AUTH');
const dbLogger = createCategoryLogger('DATABASE');
const cacheLogger = createCategoryLogger('CACHE');
const blockchainLogger = createCategoryLogger('BLOCKCHAIN');
const apiLogger = createCategoryLogger('API');
const securityLogger = createCategoryLogger('SECURITY');
const performanceLogger = createCategoryLogger('PERFORMANCE');
const businessLogger = createCategoryLogger('BUSINESS');

// HTTP request logging middleware
const httpLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Log incoming request
  apiLogger.info('HTTP Request', {
    requestId,
    method: req.method,
    endpoint: req.path,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    sessionId: req.session?.id
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel]('HTTP Response', {
      category: 'API',
      requestId,
      method: req.method,
      endpoint: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      sessionId: req.session?.id
    });
    
    // Log to performance log for slow requests
    if (duration > 1000) {
      performanceLogger.warn('Slow Request', {
        requestId,
        method: req.method,
        endpoint: req.path,
        duration,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

// Error logging helper
const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...context
  };
  
  logger.error('Application Error', errorInfo);
  
  // Also log to security logger if it's a security-related error
  if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError' || 
      error.message.toLowerCase().includes('security') || 
      error.message.toLowerCase().includes('unauthorized')) {
    securityLogger.error('Security Error', errorInfo);
  }
};

// Business event logging
const logBusinessEvent = (event, data = {}, userId = null, sessionId = null) => {
  businessLogger.info(`Business Event: ${event}`, {
    event,
    data,
    userId,
    sessionId,
    timestamp: new Date().toISOString()
  });
};

// Performance metrics logging
const logPerformanceMetric = (metric, value, unit = 'ms', context = {}) => {
  performanceLogger.info(`Performance Metric: ${metric}`, {
    metric,
    value,
    unit,
    ...context
  });
};

// Security event logging
const logSecurityEvent = (event, severity = 'medium', data = {}) => {
  securityLogger.warn(`Security Event: ${event}`, {
    event,
    severity,
    data,
    timestamp: new Date().toISOString()
  });
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Application shutting down gracefully');
  logger.end();
});

process.on('SIGTERM', () => {
  logger.info('Application received SIGTERM, shutting down gracefully');
  logger.end();
});

module.exports = {
  logger,
  authLogger,
  dbLogger,
  cacheLogger,
  blockchainLogger,
  apiLogger,
  securityLogger,
  performanceLogger,
  businessLogger,
  httpLogger,
  logError,
  logBusinessEvent,
  logPerformanceMetric,
  logSecurityEvent
}; 