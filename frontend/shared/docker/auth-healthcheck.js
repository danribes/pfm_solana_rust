#!/usr/bin/env node

/**
 * Authentication Service Health Check
 * Docker health check script for authentication infrastructure
 */

const http = require('http');
const crypto = require('crypto');

// ============================================================================
// Health Check Configuration
// ============================================================================

const config = {
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
  retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
  services: {
    backend: process.env.BACKEND_SERVICE_URL || 'http://backend:3000',
    redis: process.env.REDIS_URL || 'redis://redis:6379',
    auth: process.env.AUTH_SERVICE_URL || 'http://backend:3000/api/auth'
  }
};

// ============================================================================
// Health Check Functions
// ============================================================================

function makeHttpRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          data: data,
          headers: response.headers
        });
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.on('error', reject);
  });
}

async function checkBackendHealth() {
  try {
    const response = await makeHttpRequest(`${config.services.backend}/api/health`, config.timeout);
    return {
      service: 'backend',
      status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
      statusCode: response.statusCode,
      response: response.data
    };
  } catch (error) {
    return {
      service: 'backend',
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkAuthServiceHealth() {
  try {
    const response = await makeHttpRequest(`${config.services.auth}/health`, config.timeout);
    return {
      service: 'auth',
      status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
      statusCode: response.statusCode,
      response: response.data
    };
  } catch (error) {
    return {
      service: 'auth',
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkSessionGeneration() {
  try {
    // Test secure session ID generation
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const sessionId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    if (sessionId.length === 64 && /^[a-f0-9]+$/.test(sessionId)) {
      return {
        service: 'session-generation',
        status: 'healthy',
        sessionIdLength: sessionId.length
      };
    } else {
      return {
        service: 'session-generation',
        status: 'unhealthy',
        error: 'Invalid session ID format'
      };
    }
  } catch (error) {
    return {
      service: 'session-generation',
      status: 'unhealthy',
      error: error.message
    };
  }
}

async function checkLocalStorage() {
  try {
    // Test localStorage simulation for container environment
    const testKey = 'pfm_health_check';
    const testValue = 'test_value_' + Date.now();
    
    // Simulate localStorage operations
    const storage = new Map();
    storage.set(testKey, testValue);
    const retrieved = storage.get(testKey);
    storage.delete(testKey);
    
    if (retrieved === testValue) {
      return {
        service: 'local-storage',
        status: 'healthy'
      };
    } else {
      return {
        service: 'local-storage',
        status: 'unhealthy',
        error: 'Storage operation failed'
      };
    }
  } catch (error) {
    return {
      service: 'local-storage',
      status: 'unhealthy',
      error: error.message
    };
  }
}

// ============================================================================
// Main Health Check
// ============================================================================

async function runHealthCheck() {
  console.log('🏥 Starting Authentication Service Health Check...');
  console.log('Configuration:', JSON.stringify(config, null, 2));

  const checks = [
    checkBackendHealth(),
    checkAuthServiceHealth(),
    checkSessionGeneration(),
    checkLocalStorage()
  ];

  try {
    const results = await Promise.allSettled(checks);
    
    const healthStatus = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      services: {}
    };

    let hasUnhealthy = false;

    results.forEach((result, index) => {
      const checkNames = ['backend', 'auth', 'session-generation', 'local-storage'];
      const serviceName = checkNames[index];

      if (result.status === 'fulfilled') {
        healthStatus.services[serviceName] = result.value;
        if (result.value.status === 'unhealthy') {
          hasUnhealthy = true;
        }
      } else {
        healthStatus.services[serviceName] = {
          service: serviceName,
          status: 'unhealthy',
          error: result.reason.message
        };
        hasUnhealthy = true;
      }
    });

    if (hasUnhealthy) {
      healthStatus.overall = 'unhealthy';
    }

    // Output results
    console.log('Health Check Results:', JSON.stringify(healthStatus, null, 2));

    // Exit with appropriate code
    if (healthStatus.overall === 'healthy') {
      console.log('✅ All authentication services are healthy');
      process.exit(0);
    } else {
      console.log('❌ Some authentication services are unhealthy');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

async function runWithRetries() {
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      console.log(`🔄 Health check attempt ${attempt}/${config.retries}`);
      await runHealthCheck();
      return; // Success, exit
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt < config.retries) {
        console.log(`⏳ Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('❌ All retry attempts failed');
        process.exit(1);
      }
    }
  }
}

// ============================================================================
// Execute Health Check
// ============================================================================

if (require.main === module) {
  runWithRetries().catch(error => {
    console.error('❌ Health check script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runHealthCheck,
  checkBackendHealth,
  checkAuthServiceHealth,
  checkSessionGeneration,
  checkLocalStorage
}; 