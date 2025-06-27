const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');
const {
  validateWalletAddress,
  validateWalletSignature,
  validateUserData
} = require('../middleware/validation');

// Wallet Authentication Endpoints

// Connect wallet and authenticate
router.post('/wallet/connect',
  validateWalletAddress,
  validateUserData,
  authController.connectWallet
);

// Generate nonce for wallet authentication
router.post('/wallet/nonce',
  validateWalletAddress,
  authController.generateNonce
);

// Verify wallet signature
router.post('/wallet/verify',
  validateWalletSignature,
  authController.verifyWalletSignature
);

// Disconnect wallet
router.post('/wallet/disconnect',
  requireAuth,
  authController.disconnectWallet
);

// Get wallet connection status
router.get('/wallet/:walletAddress/status',
  validateWalletAddress,
  authController.getWalletStatus
);

// Refresh authentication token
router.post('/wallet/refresh',
  requireAuth,
  authController.refreshAuthToken
);

// Legacy Authentication Endpoints (for backward compatibility)

// Login
router.post('/login',
  validateWalletAddress,
  authController.login
);

// Logout
router.post('/logout',
  requireAuth,
  authController.logout
);

// Refresh session
router.post('/refresh',
  requireAuth,
  authController.refreshSession
);

module.exports = router; 