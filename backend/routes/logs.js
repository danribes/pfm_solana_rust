const express = require('express');
const rateLimit = require('express-rate-limit');
const { logger, logError } = require('../utils/logger');

const router = express.Router();

// Rate limiting for log ingestion
const logRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 log requests per windowMs
  message: 'Too many log requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate log entries
const validateLogEntry = (req, res, next) => {
  const { logs } = req.body;
  
  if (!Array.isArray(logs)) {
    return res.status(400).json({ 
      error: 'Invalid request: logs must be an array' 
    });
  }
  
  if (logs.length === 0) {
    return res.status(400).json({ 
      error: 'Invalid request: logs array cannot be empty' 
    });
  }
  
  if (logs.length > 50) {
    return res.status(400).json({ 
      error: 'Invalid request: maximum 50 log entries per request' 
    });
  }
  
  // Validate each log entry
  for (const log of logs) {
    if (!log.timestamp || !log.level || !log.message || !log.service) {
      return res.status(400).json({ 
        error: 'Invalid log entry: missing required fields (timestamp, level, message, service)' 
      });
    }
    
    if (!['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(log.level)) {
      return res.status(400).json({ 
        error: 'Invalid log entry: level must be DEBUG, INFO, WARN, or ERROR' 
      });
    }
  }
  
  next();
};

// POST /api/logs - Receive logs from frontend
router.post('/', logRateLimit, validateLogEntry, async (req, res) => {
  try {
    const { logs } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Process each log entry
    for (const logEntry of logs) {
      const logMethod = logEntry.level.toLowerCase();
      const enhancedEntry = {
        ...logEntry,
        source: 'frontend',
        clientIp,
        userAgent,
        receivedAt: new Date().toISOString()
      };
      
      // Log using appropriate level
      if (logger[logMethod]) {
        logger[logMethod](logEntry.message, enhancedEntry);
      } else {
        logger.info(logEntry.message, enhancedEntry);
      }
    }
    
    res.status(200).json({ 
      message: 'Logs received successfully',
      count: logs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logError(error, { 
      endpoint: '/api/logs',
      method: 'POST',
      clientIp: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(500).json({ 
      error: 'Internal server error while processing logs' 
    });
  }
});

// GET /api/logs/search - Search logs (admin only)
router.get('/search', async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied: admin privileges required' 
      });
    }
    
    const { 
      level, 
      service, 
      category,
      startDate,
      endDate,
      limit = 100,
      offset = 0 
    } = req.query;
    
    // This would integrate with your log storage system
    // For now, return a placeholder response
    const searchResults = {
      logs: [],
      total: 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: {
        level,
        service,
        category,
        startDate,
        endDate
      }
    };
    
    logger.info('Log search performed', {
      category: 'ADMIN',
      userId: req.user?.id,
      sessionId: req.session?.id,
      filters: searchResults.filters
    });
    
    res.json(searchResults);
    
  } catch (error) {
    logError(error, { 
      endpoint: '/api/logs/search',
      method: 'GET',
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      error: 'Internal server error while searching logs' 
    });
  }
});

// GET /api/logs/stats - Log statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied: admin privileges required' 
      });
    }
    
    const { period = '24h' } = req.query;
    
    // This would integrate with your log aggregation system
    // For now, return placeholder statistics
    const stats = {
      period,
      totalLogs: 0,
      logsByLevel: {
        DEBUG: 0,
        INFO: 0,
        WARN: 0,
        ERROR: 0
      },
      logsByService: {
        'pfm-backend': 0,
        'pfm-admin': 0,
        'pfm-member': 0
      },
      logsByCategory: {
        API: 0,
        AUTH: 0,
        DATABASE: 0,
        BLOCKCHAIN: 0,
        SECURITY: 0,
        PERFORMANCE: 0,
        BUSINESS: 0
      },
      errorTrends: [],
      topErrors: []
    };
    
    logger.info('Log statistics requested', {
      category: 'ADMIN',
      userId: req.user?.id,
      sessionId: req.session?.id,
      period
    });
    
    res.json(stats);
    
  } catch (error) {
    logError(error, { 
      endpoint: '/api/logs/stats',
      method: 'GET',
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      error: 'Internal server error while retrieving log statistics' 
    });
  }
});

// POST /api/logs/retention - Configure log retention policies (admin only)
router.post('/retention', async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied: admin privileges required' 
      });
    }
    
    const { 
      defaultRetentionDays,
      securityLogRetentionDays,
      auditLogRetentionDays,
      performanceLogRetentionDays 
    } = req.body;
    
    // Validate retention periods
    const retentionConfig = {
      defaultRetentionDays: parseInt(defaultRetentionDays) || 30,
      securityLogRetentionDays: parseInt(securityLogRetentionDays) || 90,
      auditLogRetentionDays: parseInt(auditLogRetentionDays) || 90,
      performanceLogRetentionDays: parseInt(performanceLogRetentionDays) || 14
    };
    
    // Validate minimum retention periods
    if (retentionConfig.defaultRetentionDays < 7 ||
        retentionConfig.securityLogRetentionDays < 30 ||
        retentionConfig.auditLogRetentionDays < 30 ||
        retentionConfig.performanceLogRetentionDays < 1) {
      return res.status(400).json({
        error: 'Invalid retention periods: minimum requirements not met'
      });
    }
    
    // This would update your log retention configuration
    // For now, just log the configuration change
    logger.info('Log retention configuration updated', {
      category: 'ADMIN',
      userId: req.user?.id,
      sessionId: req.session?.id,
      newConfig: retentionConfig
    });
    
    res.json({
      message: 'Log retention configuration updated successfully',
      config: retentionConfig,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    logError(error, { 
      endpoint: '/api/logs/retention',
      method: 'POST',
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      error: 'Internal server error while updating retention configuration' 
    });
  }
});

module.exports = router; 