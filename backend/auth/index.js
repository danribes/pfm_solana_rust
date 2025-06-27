// Authentication module exports
// Centralized exports for all authentication-related functionality

const walletAuth = require('./wallet');
const signatureService = require('./signature');

module.exports = {
  // Wallet authentication
  generateAuthChallenge: walletAuth.generateAuthChallenge,
  authenticateWallet: walletAuth.authenticateWallet,
  isValidWalletAddress: walletAuth.isValidWalletAddress,
  validateSessionToken: walletAuth.validateSessionToken,
  getSupportedWallets: walletAuth.getSupportedWallets,
  logoutWallet: walletAuth.logoutWallet,
  
  // Signature verification
  verifySignature: signatureService.verifySignature,
  
  // Constants
  SUPPORTED_WALLETS: walletAuth.SUPPORTED_WALLETS
}; 