const redis = require('redis');
const { promisify } = require('util');
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify: utilPromisify } = require('util');

class CacheClient {
  constructor(options = {}) {
    this.options = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      db: process.env.REDIS_CACHE_DB || 1, // Use separate DB for cache
      keyPrefix: process.env.CACHE_KEY_PREFIX || 'cache:',
      defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL) || 3600, // 1 hour
      compressionThreshold: parseInt(process.env.CACHE_COMPRESSION_THRESHOLD) || 1024, // 1KB
      enableCompression: process.env.CACHE_ENABLE_COMPRESSION !== 'false',
      enableVersioning: process.env.CACHE_ENABLE_VERSIONING !== 'false',
      versionSeparator: '::',
      ...options
    };

    this.client = null;
    this.isConnected = false;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };

    // Promisify Redis methods
    this.getAsync = null;
    this.setAsync = null;
    this.delAsync = null;
    this.existsAsync = null;
    this.expireAsync = null;
    this.ttlAsync = null;
    this.keysAsync = null;
    this.flushdbAsync = null;
    this.infoAsync = null;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: this.options.host,
        port: this.options.port,
        password: this.options.password,
        db: this.options.db,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      // Promisify Redis methods
      this.getAsync = promisify(this.client.get).bind(this.client);
      this.setAsync = promisify(this.client.set).bind(this.client);
      this.delAsync = promisify(this.client.del).bind(this.client);
      this.existsAsync = promisify(this.client.exists).bind(this.client);
      this.expireAsync = promisify(this.client.expire).bind(this.client);
      this.ttlAsync = promisify(this.client.ttl).bind(this.client);
      this.keysAsync = promisify(this.client.keys).bind(this.client);
      this.flushdbAsync = promisify(this.client.flushdb).bind(this.client);
      this.infoAsync = promisify(this.client.info).bind(this.client);

      // Set up event handlers
      this.client.on('connect', () => {
        console.log('Cache client connected to Redis');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('Cache client error:', err);
        this.isConnected = false;
        this.stats.errors++;
      });

      this.client.on('end', () => {
        console.log('Cache client disconnected from Redis');
        this.isConnected = false;
      });

      return true;
    } catch (error) {
      console.error('Failed to connect cache client:', error);
      this.stats.errors++;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Key naming conventions
  generateKey(prefix, identifier, version = null) {
    const key = `${this.options.keyPrefix}${prefix}:${identifier}`;
    return version && this.options.enableVersioning 
      ? `${key}${this.options.versionSeparator}${version}`
      : key;
  }

  // Serialization and compression
  async serialize(data) {
    try {
      const jsonString = JSON.stringify(data);
      
      if (this.options.enableCompression && jsonString.length > this.options.compressionThreshold) {
        const compressed = await utilPromisify(zlib.gzip)(jsonString);
        return {
          data: compressed.toString('base64'),
          compressed: true
        };
      }
      
      return {
        data: jsonString,
        compressed: false
      };
    } catch (error) {
      throw new Error(`Serialization failed: ${error.message}`);
    }
  }

  async deserialize(serializedData) {
    try {
      if (serializedData.compressed) {
        const buffer = Buffer.from(serializedData.data, 'base64');
        const decompressed = await utilPromisify(zlib.gunzip)(buffer);
        return JSON.parse(decompressed.toString());
      }
      
      return JSON.parse(serializedData.data);
    } catch (error) {
      throw new Error(`Deserialization failed: ${error.message}`);
    }
  }

  // Core cache operations
  async get(key, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('Cache client not connected');
      }

      const fullKey = this.generateKey(options.prefix || 'default', key, options.version);
      const cached = await this.getAsync(fullKey);

      if (cached) {
        this.stats.hits++;
        const serializedData = JSON.parse(cached);
        return await this.deserialize(serializedData);
      } else {
        this.stats.misses++;
        return null;
      }
    } catch (error) {
      this.stats.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('Cache client not connected');
      }

      const ttl = options.ttl || this.options.defaultTTL;
      const fullKey = this.generateKey(options.prefix || 'default', key, options.version);
      const serializedData = await this.serialize(value);
      
      const result = await this.setAsync(fullKey, JSON.stringify(serializedData));
      
      if (ttl > 0) {
        await this.expireAsync(fullKey, ttl);
      }

      this.stats.sets++;
      return result;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }

  async delete(key, options = {}) {
    try {
      if (!this.isConnected) {
        throw new Error('Cache client not connected');
      }

      const fullKey = this.generateKey(options.prefix || 'default', key, options.version);
      const result = await this.delAsync(fullKey);
      
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key, options = {}) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const fullKey = this.generateKey(options.prefix || 'default', key, options.version);
      const result = await this.existsAsync(fullKey);
      return result > 0;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async ttl(key, options = {}) {
    try {
      if (!this.isConnected) {
        return -1;
      }

      const fullKey = this.generateKey(options.prefix || 'default', key, options.version);
      return await this.ttlAsync(fullKey);
    } catch (error) {
      this.stats.errors++;
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  // Cache versioning and invalidation
  async invalidatePattern(pattern, options = {}) {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const fullPattern = this.generateKey(options.prefix || 'default', pattern);
      const keys = await this.keysAsync(fullPattern);
      
      if (keys.length > 0) {
        const result = await this.delAsync(...keys);
        this.stats.deletes += result;
        return result;
      }
      
      return 0;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  async invalidatePrefix(prefix) {
    return this.invalidatePattern('*', { prefix });
  }

  async invalidateAll() {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.flushdbAsync();
      this.stats.deletes++;
      return result === 'OK';
    } catch (error) {
      this.stats.errors++;
      console.error('Cache invalidate all error:', error);
      return false;
    }
  }

  // Cache statistics and monitoring
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      isConnected: this.isConnected
    };
  }

  async getInfo() {
    try {
      if (!this.isConnected) {
        return null;
      }

      const info = await this.infoAsync();
      return info;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache info error:', error);
      return null;
    }
  }

  // Utility methods
  async ping() {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.getAsync('ping');
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  // Cache warming
  async warmCache(data, options = {}) {
    const promises = data.map(item => 
      this.set(item.key, item.value, { 
        prefix: options.prefix || 'warm',
        ttl: options.ttl || this.options.defaultTTL,
        ...item.options 
      })
    );

    try {
      await Promise.all(promises);
      console.log(`Cache warmed with ${data.length} items`);
      return true;
    } catch (error) {
      console.error('Cache warming failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const cacheClient = new CacheClient();

module.exports = {
  CacheClient,
  cacheClient
}; 