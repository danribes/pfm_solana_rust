// Signature verification for Solana wallet authentication
const bs58 = require('bs58');
const { PublicKey } = require('@solana/web3.js');

/**
 * Verify a Solana wallet signature
 * @param {string} walletAddress - Base58 encoded public key
 * @param {string} message - The original message that was signed
 * @param {string} signature - Base58 encoded signature
 * @returns {boolean} true if valid, false otherwise
 */
function verifySignature(walletAddress, message, signature) {
  try {
    const pubkey = new PublicKey(walletAddress);
    const msgBuffer = Buffer.from(message);
    const sigBuffer = bs58.decode(signature);
    return pubkey.verify(msgBuffer, sigBuffer);
  } catch (err) {
    // Invalid public key or signature
    return false;
  }
}

module.exports = {
  verifySignature,
}; 