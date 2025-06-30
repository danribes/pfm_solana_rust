/**
 * Monitoring and Metrics Middleware for PFM Backend
 * Task 6.4.1: Monitoring & Alerting for All Services
 */

const promClient = require('prom-client');
const express = require('express');

// Create a Registry
const register = new promClient.Registry();

// Default labels
register.setDefaultLabels({
  app: 'pfm-backend',
  environment: process.env.NODE_ENV || 'development'
});

// Collect default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const votesTotal = new promClient.Counter({
  name: 'pfm_votes_total',
  help: 'Total number of votes cast'
});

const walletConnectionsTotal = new promClient.Counter({
  name: 'pfm_wallet_connections_total',
  help: 'Total number of successful wallet connections'
});

const walletConnectionFailuresTotal = new promClient.Counter({
  name: 'pfm_wallet_connection_failures_total',
  help: 'Total number of failed wallet connections'
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(votesTotal);
register.registerMetric(walletConnectionsTotal);
register.registerMetric(walletConnectionFailuresTotal);

// HTTP metrics middleware
const trackHttpMetrics = (req, res, next) => {
  const start = Date.now();

  const end = () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;

    httpRequestDuration.labels(method, route, statusCode).observe(duration);
    httpRequestsTotal.labels(method, route, statusCode).inc();
  };

  res.on('finish', end);
  res.on('close', end);
  next();
};

// Health check
const createHealthCheck = (dependencies = {}) => {
  return async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dependencies: {}
    };

    try {
      // Check database
      if (dependencies.database) {
        await dependencies.database.authenticate();
        health.dependencies.database = { status: 'healthy' };
      }

      // Check Redis
      if (dependencies.redis) {
        await dependencies.redis.ping();
        health.dependencies.redis = { status: 'healthy' };
      }

      res.status(200).json(health);
    } catch (error) {
      health.status = 'unhealthy';
      res.status(503).json(health);
    }
  };
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error.message);
  }
};

// Create monitoring router
const createMonitoringRouter = (dependencies = {}) => {
  const router = express.Router();
  
  router.get('/health', createHealthCheck(dependencies));
  router.get('/metrics', metricsEndpoint);
  
  return router;
};

module.exports = {
  trackHttpMetrics,
  createMonitoringRouter,
  votesTotal,
  walletConnectionsTotal,
  walletConnectionFailuresTotal
};
