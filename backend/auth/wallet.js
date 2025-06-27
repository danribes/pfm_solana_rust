// Wallet authentication service for Solana wallet-based authentication
const nonceService = require('../services/nonce');
const signatureService = require('./signature');
const crypto = require('crypto');

// Rate limiting store (in-memory for now, should use Redis in production)
const rateLimitStore = new Map();

// Supported wallet types
const SUPPORTED_WALLETS = ['phantom', 'solflare', 'slope', 'backpack', 'metamask'];

/**
 * Generate authentication challenge for wallet
 * @param {string} walletAddress - Base58 encoded public key
 * @returns {Object} Challenge object with nonce and message
 */
function generateAuthChallenge(walletAddress) {
  // Validate wallet address
  if (!walletAddress || !isValidWalletAddress(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  // Check rate limiting
  if (isRateLimited(walletAddress)) {
    throw new Error('Rate limit exceeded');
  }

  // Generate nonce
  const nonce = nonceService.generateNonce();
  
  // Store nonce for wallet
  nonceService.storeNonce(walletAddress, nonce);
  
  // Update rate limiting
  updateRateLimit(walletAddress);

  // Create message to sign
  const message = `Sign this message to authenticate with Community Voting System.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;

  return {
    nonce,
    message,
    walletAddress,
    timestamp: Date.now()
  };
}

/**
 * Authenticate wallet using signature
 * @param {string} walletAddress - Base58 encoded public key
 * @param {string} signature - Base58 encoded signature
 * @param {string} message - Original message that was signed
 * @returns {Object} Authentication result with session data
 */
function authenticateWallet(walletAddress, signature, message) {
  try {
    // Validate inputs
    if (!walletAddress || !signature || !message) {
      throw new Error('Missing required authentication parameters');
    }

    if (!isValidWalletAddress(walletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    // Extract nonce from message
    const nonceMatch = message.match(/Nonce: ([a-fA-F0-9]+)/);
    if (!nonceMatch) {
      throw new Error('Invalid message format: nonce not found');
    }
    const nonce = nonceMatch[1];

    // Verify nonce exists and is valid
    const storedNonce = nonceService.getNonce(walletAddress);
    if (!storedNonce || storedNonce !== nonce) {
      throw new Error('Invalid or expired nonce');
    }

    // Check if nonce is expired (5 minutes)
    const nonceEntry = getNonceEntry(walletAddress);
    if (nonceEntry && Date.now() - nonceEntry.createdAt > 5 * 60 * 1000) {
      nonceService.invalidateNonce(walletAddress);
      throw new Error('Nonce expired');
    }

    // Verify signature
    if (!signatureService.verifySignature(walletAddress, message, signature)) {
      throw new Error('Invalid signature');
    }

    // Invalidate nonce to prevent replay attacks
    nonceService.invalidateNonce(walletAddress);

    // Generate session token
    const sessionToken = generateSessionToken(walletAddress);

    // Create authentication result
    const authResult = {
      success: true,
      walletAddress,
      sessionToken,
      authenticatedAt: Date.now(),
      walletType: detectWalletType(walletAddress, signature)
    };

    return authResult;

  } catch (error) {
    // Clean up on authentication failure
    nonceService.invalidateNonce(walletAddress);
    throw error;
  }
}

/**
 * Validate wallet address format
 * @param {string} walletAddress - Wallet address to validate
 * @returns {boolean} True if valid
 */
function isValidWalletAddress(walletAddress) {
  // Check for null/undefined
  if (!walletAddress) return false;
  
  // Basic Solana public key validation (base58, 32-44 characters)
  // Exclude: 0, O, l, I to avoid confusion
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(walletAddress);
}

/**
 * Check if wallet is rate limited
 * @param {string} walletAddress - Wallet address to check
 * @returns {boolean} True if rate limited
 */
function isRateLimited(walletAddress) {
  const entry = rateLimitStore.get(walletAddress);
  if (!entry) return false;

  // Allow 5 challenges per minute
  const now = Date.now();
  const oneMinute = 60 * 1000;
  
  // Remove old entries
  entry.timestamps = entry.timestamps.filter(timestamp => now - timestamp < oneMinute);
  
  if (entry.timestamps.length >= 5) {
    return true;
  }

  return false;
}

/**
 * Update rate limiting for wallet
 * @param {string} walletAddress - Wallet address to update
 */
function updateRateLimit(walletAddress) {
  const entry = rateLimitStore.get(walletAddress) || { timestamps: [] };
  entry.timestamps.push(Date.now());
  rateLimitStore.set(walletAddress, entry);
}

/**
 * Get nonce entry with timestamp
 * @param {string} walletAddress - Wallet address
 * @returns {Object|null} Nonce entry with timestamp
 */
function getNonceEntry(walletAddress) {
  // This would need to be implemented in the nonce service
  // For now, return null as the nonce service doesn't expose timestamps
  return null;
}

/**
 * Generate secure session token
 * @param {string} walletAddress - Wallet address
 * @returns {string} Session token
 */
function generateSessionToken(walletAddress) {
  const tokenData = {
    walletAddress,
    timestamp: Date.now(),
    random: crypto.randomBytes(16).toString('hex')
  };
  
  // Create token hash
  const tokenString = JSON.stringify(tokenData);
  return crypto.createHash('sha256').update(tokenString).digest('hex');
}

/**
 * Detect wallet type based on signature characteristics
 * @param {string} walletAddress - Wallet address
 * @param {string} signature - Signature
 * @returns {string} Detected wallet type
 */
function detectWalletType(walletAddress, signature) {
  // This is a simplified detection - in practice, you might need more sophisticated logic
  // For now, return 'unknown' as we can't reliably detect wallet type from signature alone
  return 'unknown';
}

/**
 * Validate session token
 * @param {string} sessionToken - Session token to validate
 * @param {string} walletAddress - Expected wallet address
 * @returns {boolean} True if valid
 */
function validateSessionToken(sessionToken, walletAddress) {
  // This would need to be implemented with proper session storage
  // For now, return true as a placeholder
  return true;
}

/**
 * Get supported wallet types
 * @returns {Array} Array of supported wallet types
 */
function getSupportedWallets() {
  return [...SUPPORTED_WALLETS];
}

/**
 * Logout wallet (invalidate session)
 * @param {string} walletAddress - Wallet address to logout
 * @returns {boolean} True if successful
 */
function logoutWallet(walletAddress) {
  // This would need to be implemented with proper session storage
  // For now, return true as a placeholder
  return true;
}

module.exports = {
  generateAuthChallenge,
  authenticateWallet,
  isValidWalletAddress,
  validateSessionToken,
  getSupportedWallets,
  logoutWallet,
  isRateLimited,
  SUPPORTED_WALLETS
}; 