const { cacheClient } = require('./client');

class CacheMiddleware {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
    this.enableCache = process.env.ENABLE_API_CACHE !== 'false';
  }

  // Cache-aside middleware for GET requests
  cacheAside(options = {}) {
    return async (req, res, next) => {
      if (!this.enableCache || req.method !== 'GET') {
        return next();
      }

      const ttl = options.ttl || this.defaultTTL;
      const prefix = options.prefix || 'api';
      const key = this.generateCacheKey(req, options);

      try {
        // Try to get from cache first
        const cached = await cacheClient.get(key, { prefix, ttl });
        
        if (cached) {
          return res.json({
            ...cached,
            _cached: true,
            _cacheKey: key
          });
        }

        // If not in cache, store original send method
        const originalSend = res.json;
        
        // Override res.json to cache the response
        res.json = function(data) {
          // Cache the response
          cacheClient.set(key, data, { prefix, ttl }).catch(err => {
            console.error('Cache set error:', err);
          });

          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Write-through cache middleware for POST/PUT/DELETE requests
  writeThrough(options = {}) {
    return async (req, res, next) => {
      if (!this.enableCache || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const prefix = options.prefix || 'api';
      const invalidationPatterns = options.invalidate || [];

      try {
        // Store original send method
        const originalSend = res.json;
        
        // Override res.json to invalidate cache after successful response
        res.json = function(data) {
          // Invalidate cache patterns
          if (data.success !== false && invalidationPatterns.length > 0) {
            invalidationPatterns.forEach(pattern => {
              cacheClient.invalidatePattern(pattern, { prefix }).catch(err => {
                console.error('Cache invalidation error:', err);
              });
            });
          }

          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Write-through cache middleware error:', error);
        next();
      }
    };
  }

  // Cache warming middleware
  warmCache(data, options = {}) {
    return async (req, res, next) => {
      try {
        await cacheClient.warmCache(data, options);
        next();
      } catch (error) {
        console.error('Cache warming error:', error);
        next();
      }
    };
  }

  // Cache statistics middleware
  cacheStats() {
    return async (req, res, next) => {
      try {
        const stats = cacheClient.getStats();
        const info = await cacheClient.getInfo();
        
        res.json({
          cache: {
            stats,
            info: info ? 'Available' : 'Not available',
            isConnected: cacheClient.isConnected
          }
        });
      } catch (error) {
        console.error('Cache stats error:', error);
        res.status(500).json({ error: 'Failed to get cache stats' });
      }
    };
  }

  // Cache health check middleware
  cacheHealth() {
    return async (req, res, next) => {
      try {
        const isHealthy = await cacheClient.ping();
        
        if (isHealthy) {
          res.json({ 
            status: 'healthy',
            cache: 'connected',
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(503).json({ 
            status: 'unhealthy',
            cache: 'disconnected',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Cache health check error:', error);
        res.status(503).json({ 
          status: 'unhealthy',
          cache: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  // Cache invalidation middleware
  invalidateCache(options = {}) {
    return async (req, res, next) => {
      const prefix = options.prefix || 'api';
      const patterns = options.patterns || [];

      try {
        const results = await Promise.all(
          patterns.map(pattern => 
            cacheClient.invalidatePattern(pattern, { prefix })
          )
        );

        const totalInvalidated = results.reduce((sum, count) => sum + count, 0);
        
        res.json({
          success: true,
          invalidated: totalInvalidated,
          patterns: patterns.length
        });
      } catch (error) {
        console.error('Cache invalidation error:', error);
        res.status(500).json({ error: 'Failed to invalidate cache' });
      }
    };
  }

  // Cache bypass middleware
  bypassCache() {
    return (req, res, next) => {
      req.bypassCache = true;
      next();
    };
  }

  // Cache control headers middleware
  cacheControl(options = {}) {
    const maxAge = options.maxAge || 300;
    const staleWhileRevalidate = options.staleWhileRevalidate || 60;
    
    return (req, res, next) => {
      if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
      } else {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      next();
    };
  }

  // Utility methods
  generateCacheKey(req, options = {}) {
    const { url, method, query, params, body } = req;
    
    // Use custom key generator if provided
    if (options.keyGenerator) {
      return options.keyGenerator(req);
    }

    // Default key generation
    const keyParts = [
      method,
      url,
      JSON.stringify(query),
      JSON.stringify(params)
    ];

    // Include body for non-GET requests if specified
    if (options.includeBody && method !== 'GET' && body) {
      keyParts.push(JSON.stringify(body));
    }

    // Include user ID if available
    if (req.user && req.user.id) {
      keyParts.push(`user:${req.user.id}`);
    }

    // Include session ID if available
    if (req.session && req.session.sessionId) {
      keyParts.push(`session:${req.session.sessionId}`);
    }

    return keyParts.join('|');
  }

  // Cache key patterns for common invalidation scenarios
  static getInvalidationPatterns() {
    return {
      userProfile: (userId) => `user:profile:${userId}`,
      userPermissions: (userId) => `user:permissions:${userId}:*`,
      communityData: (communityId) => `community:*:${communityId}`,
      votingResults: (questionId) => `voting:results:${questionId}`,
      votingQuestions: (communityId) => `voting:questions:list:${communityId}:*`,
      apiResponses: (prefix) => `${prefix}:*`
    };
  }

  // Cache configuration middleware
  configureCache(config) {
    return (req, res, next) => {
      req.cacheConfig = {
        ...this.defaultConfig,
        ...config
      };
      next();
    };
  }

  get defaultConfig() {
    return {
      ttl: this.defaultTTL,
      enableCache: this.enableCache,
      compression: true,
      versioning: true
    };
  }
}

// Create singleton instance
const cacheMiddleware = new CacheMiddleware();

module.exports = {
  CacheMiddleware,
  cacheMiddleware
}; 