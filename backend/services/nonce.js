// Nonce management service for wallet authentication
// Provides functions to generate, store, retrieve, and invalidate nonces

const crypto = require('crypto');

// In-memory nonce store (replace with Redis in production)
const nonceStore = new Map();

/**
 * Generate a secure random nonce
 * @returns {string} nonce
 */
function generateNonce() {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Store a nonce for a wallet address
 * @param {string} walletAddress
 * @param {string} nonce
 */
function storeNonce(walletAddress, nonce) {
  nonceStore.set(walletAddress, { nonce, createdAt: Date.now() });
}

/**
 * Retrieve a nonce for a wallet address
 * @param {string} walletAddress
 * @returns {string|null}
 */
function getNonce(walletAddress) {
  const entry = nonceStore.get(walletAddress);
  return entry ? entry.nonce : null;
}

/**
 * Invalidate a nonce for a wallet address
 * @param {string} walletAddress
 */
function invalidateNonce(walletAddress) {
  nonceStore.delete(walletAddress);
}

module.exports = {
  generateNonce,
  storeNonce,
  getNonce,
  invalidateNonce,
}; 