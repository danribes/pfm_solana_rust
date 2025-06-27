const sessionStore = require('./store');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto-js');

/**
 * Generate a new session token (JWT-like, but stored in Redis)
 */
function generateSessionToken(userId, walletAddress) {
  const payload = {
    userId,
    walletAddress,
    issuedAt: Date.now(),
    tokenId: uuidv4(),
  };
  // Optionally, sign/encrypt the token for extra security
  const token = crypto.AES.encrypt(JSON.stringify(payload), process.env.SESSION_ENCRYPTION_KEY || 'default-session-key').toString();
  return token;
}

/**
 * Validate a session token
 */
function validateSessionToken(token) {
  try {
    const decrypted = crypto.AES.decrypt(token, process.env.SESSION_ENCRYPTION_KEY || 'default-session-key');
    const payload = JSON.parse(decrypted.toString(crypto.enc.Utf8));
    // Optionally, add more validation (expiration, user status, etc.)
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Create a new session after successful wallet authentication
 */
async function createSessionForUser(userId, walletAddress, req, res) {
  const sessionId = uuidv4();
  const token = generateSessionToken(userId, walletAddress);
  
  // Set session data - let express-session handle Redis storage
  req.session.sessionId = sessionId;
  req.session.userId = userId;
  req.session.walletAddress = walletAddress;
  req.session.token = token;
  
  // Save the session to ensure the cookie is set
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Create a new wallet-only session (no user ID)
 */
async function createWalletOnlySession(walletAddress, req, res) {
  const sessionId = uuidv4();
  const token = generateSessionToken(null, walletAddress);
  
  // Set session data - let express-session handle Redis storage
  req.session.sessionId = sessionId;
  req.session.walletAddress = walletAddress;
  req.session.token = token;
  req.session.sessionType = 'wallet-only';
  
  // Save the session to ensure the cookie is set
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Validate wallet session (supports both user and wallet-only sessions)
 */
async function validateWalletSession(req) {
  if (!req.session || !req.session.sessionId || !req.session.token) {
    return null;
  }

  // Validate token
  const payload = validateSessionToken(req.session.token);
  if (!payload) {
    return null;
  }

  // Check if wallet address matches
  if (payload.walletAddress !== req.session.walletAddress) {
    return null;
  }

  // Return session data from req.session
  return {
    sessionId: req.session.sessionId,
    userId: req.session.userId,
    walletAddress: req.session.walletAddress,
    token: req.session.token,
    sessionType: req.session.sessionType
  };
}

/**
 * Refresh a session (issue new token, update expiration)
 */
async function refreshSession(req, res) {
  if (!req.session || !req.session.sessionId) return null;
  
  // Issue new token
  const newToken = generateSessionToken(req.session.userId, req.session.walletAddress);
  req.session.token = newToken;
  
  // Save the session
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(newToken);
      }
    });
  });
}

/**
 * Invalidate a session (logout)
 */
async function logoutSession(req, res) {
  if (req.session) {
    req.session.destroy(() => {});
  }
}

/**
 * Middleware: Require authenticated session
 */
function requireAuthenticatedSession(req, res, next) {
  if (req.session && req.session.userId && req.session.token) {
    const payload = validateSessionToken(req.session.token);
    if (payload && payload.userId === req.session.userId) {
      return next();
    }
  }
  res.status(401).json({ error: 'Authentication required' });
}

/**
 * Middleware: Require wallet authentication (supports both user and wallet-only sessions)
 */
async function requireWalletAuthentication(req, res, next) {
  const sessionData = await validateWalletSession(req);
  if (sessionData) {
    req.walletSession = sessionData;
    return next();
  }
  res.status(401).json({ error: 'Wallet authentication required' });
}

/**
 * Middleware: Optional wallet authentication (doesn't fail if not authenticated)
 */
async function optionalWalletAuthentication(req, res, next) {
  const sessionData = await validateWalletSession(req);
  if (sessionData) {
    req.walletSession = sessionData;
  }
  next();
}

module.exports = {
  generateSessionToken,
  validateSessionToken,
  createSessionForUser,
  createWalletOnlySession,
  validateWalletSession,
  refreshSession,
  logoutSession,
  requireAuthenticatedSession,
  requireWalletAuthentication,
  optionalWalletAuthentication,
}; 