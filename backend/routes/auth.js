const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');
const { walletAuthLimit, walletVotingLimit } = require('../middleware/walletAuth');
const {
  validateWalletAddress,
  validateWalletAddressParam,
  validateWalletSignature,
  validateUserData
} = require('../middleware/validation');

// Wallet Authentication Endpoints

// Connect wallet and authenticate
router.post('/wallet/connect',
  walletAuthLimit,
  validateWalletAddress,
  validateUserData,
  authController.connectWallet
);

// Generate nonce for wallet authentication
router.post('/wallet/nonce',
  walletAuthLimit,
  validateWalletAddress,
  authController.generateNonce
);

// Verify wallet signature
router.post('/wallet/verify',
  walletAuthLimit,
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
  validateWalletAddressParam,
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