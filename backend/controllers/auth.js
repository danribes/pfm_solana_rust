const walletService = require('../services/wallet');
const { createSessionForUser, logoutSession, refreshSession } = require('../session/auth');

class AuthController {
  // Connect wallet and authenticate
  async connectWallet(req, res) {
    try {
      const { walletAddress, signature, nonce, timestamp, userData } = req.body;

      // Validate wallet address
      if (!walletService.validateWalletAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address format'
        });
      }

      // Verify signature if provided
      if (signature && nonce && timestamp) {
        try {
          await walletService.verifySignature(walletAddress, signature, nonce, timestamp);
        } catch (error) {
          return res.status(401).json({
            success: false,
            error: error.message
          });
        }
      }

      // Connect wallet and create/update user
      const user = await walletService.connectWallet(walletAddress, userData);

      // Create session
      const token = await createSessionForUser(user.id, walletAddress, req, res);

      res.json({
        success: true,
        message: 'Wallet connected successfully',
        data: {
          token,
          user: {
            id: user.id,
            walletAddress: user.wallet_address,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatar_url
          }
        }
      });
    } catch (error) {
      console.error('Connect wallet error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to connect wallet'
      });
    }
  }

  // Generate nonce for wallet authentication
  async generateNonce(req, res) {
    try {
      const { walletAddress } = req.body;

      if (!walletService.validateWalletAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address format'
        });
      }

      const nonceData = await walletService.generateNonce(walletAddress);

      res.json({
        success: true,
        data: nonceData
      });
    } catch (error) {
      console.error('Generate nonce error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate nonce'
      });
    }
  }

  // Verify wallet signature
  async verifyWalletSignature(req, res) {
    try {
      const { walletAddress, signature, nonce, timestamp } = req.body;

      if (!walletService.validateWalletAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address format'
        });
      }

      if (!signature || !nonce || !timestamp) {
        return res.status(400).json({
          success: false,
          error: 'Signature, nonce, and timestamp are required'
        });
      }

      await walletService.verifySignature(walletAddress, signature, nonce, timestamp);

      res.json({
        success: true,
        message: 'Signature verified successfully'
      });
    } catch (error) {
      console.error('Verify signature error:', error);
      
      if (error.message.includes('expired') || error.message.includes('Invalid')) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to verify signature'
      });
    }
  }

  // Disconnect wallet
  async disconnectWallet(req, res) {
    try {
      const walletAddress = req.session.walletAddress;
      
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'No wallet connected'
        });
      }

      // Disconnect wallet
      await walletService.disconnectWallet(walletAddress);

      // Logout session
      await logoutSession(req, res);

      res.json({
        success: true,
        message: 'Wallet disconnected successfully'
      });
    } catch (error) {
      console.error('Disconnect wallet error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to disconnect wallet'
      });
    }
  }

  // Get wallet connection status
  async getWalletStatus(req, res) {
    try {
      const { walletAddress } = req.params;

      if (!walletService.validateWalletAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address format'
        });
      }

      const status = await walletService.getWalletStatus(walletAddress);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get wallet status error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get wallet status'
      });
    }
  }

  // Refresh authentication token
  async refreshAuthToken(req, res) {
    try {
      const walletAddress = req.session.walletAddress;
      const currentToken = req.session.token;

      if (!walletAddress || !currentToken) {
        return res.status(401).json({
          success: false,
          error: 'No active session found'
        });
      }

      const result = await walletService.refreshAuthToken(walletAddress, currentToken);

      // Refresh session token
      const newToken = await refreshSession(req, res);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          user: result.user
        }
      });
    } catch (error) {
      console.error('Refresh auth token error:', error);
      
      if (error.message.includes('not found') || error.message.includes('inactive')) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to refresh token'
      });
    }
  }

  // Legacy login endpoint (for backward compatibility)
  async login(req, res) {
    try {
      const { walletAddress, signature } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Wallet address required'
        });
      }

      if (!walletService.validateWalletAddress(walletAddress)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address format'
        });
      }

      // For backward compatibility, we'll simulate successful authentication
      // In a real implementation, you would verify the signature
      const user = await walletService.connectWallet(walletAddress);
      
      // Create session for user
      const token = await createSessionForUser(user.id, walletAddress, req, res);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            walletAddress: user.wallet_address,
            username: user.username
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  // Legacy logout endpoint (for backward compatibility)
  async logout(req, res) {
    try {
      await logoutSession(req, res);
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  // Legacy session refresh endpoint (for backward compatibility)
  async refreshSession(req, res) {
    try {
      const newToken = await refreshSession(req, res);
      if (newToken) {
        res.json({
          success: true,
          message: 'Session refreshed',
          data: {
            token: newToken
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Session refresh failed'
        });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Session refresh failed'
      });
    }
  }
}

module.exports = new AuthController(); 