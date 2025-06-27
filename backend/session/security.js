const sessionStore = require('./store');
const fs = require('fs');
const path = require('path');

const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '3600000', 10); // 1 hour
const AUDIT_LOG_PATH = process.env.SESSION_AUDIT_LOG_PATH || path.join(__dirname, '../../logs/session_audit.log');

/**
 * Middleware: Protect against session hijacking (user agent & IP binding)
 */
function hijackingProtection(req, res, next) {
  if (req.session && req.session.userId) {
    const currentUA = req.headers['user-agent'] || '';
    const currentIP = req.ip || req.connection.remoteAddress || '';
    if (
      req.session.userAgent && req.session.userAgent !== currentUA ||
      req.session.ipAddress && req.session.ipAddress !== currentIP
    ) {
      // Log the event
      logAuditEvent('Hijacking detected', req.session.userId, req.session.sessionId, currentIP, currentUA);
      // Destroy session
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session hijacking detected. You have been logged out.' });
    }
  }
  next();
}

/**
 * Middleware: Enforce session timeout and automatic logout
 */
function sessionTimeoutEnforcement(req, res, next) {
  if (req.session && req.session.lastAccessed) {
    const now = Date.now();
    if (now - req.session.lastAccessed > SESSION_TIMEOUT) {
      logAuditEvent('Session timeout', req.session.userId, req.session.sessionId, req.ip, req.headers['user-agent']);
      req.session.destroy(() => {});
      return res.status(440).json({ error: 'Session expired. Please log in again.' });
    }
    // Update last accessed
    req.session.lastAccessed = now;
  }
  next();
}

/**
 * Middleware: Enforce concurrent session limits (defense-in-depth)
 */
async function concurrentSessionLimit(req, res, next) {
  if (req.session && req.session.userId) {
    const userSessions = await sessionStore.getUserSessions(req.session.userId);
    const maxSessions = sessionStore.maxSessionsPerUser;
    if (userSessions.length > maxSessions) {
      // Remove oldest session(s)
      const sorted = userSessions.sort((a, b) => a.createdAt - b.createdAt);
      for (let i = 0; i < userSessions.length - maxSessions; i++) {
        await sessionStore.deleteSession(sorted[i].sessionId);
        logAuditEvent('Concurrent session limit enforced', req.session.userId, sorted[i].sessionId, req.ip, req.headers['user-agent']);
      }
    }
  }
  next();
}

/**
 * Log session audit events
 */
function logAuditEvent(event, userId, sessionId, ip, userAgent) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    sessionId,
    ip,
    userAgent,
  };
  const line = JSON.stringify(logEntry) + '\n';
  fs.appendFile(AUDIT_LOG_PATH, line, (err) => {
    if (err) console.error('Failed to write session audit log:', err.message);
  });
}

module.exports = {
  hijackingProtection,
  sessionTimeoutEnforcement,
  concurrentSessionLimit,
  logAuditEvent,
}; 