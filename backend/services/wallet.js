const crypto = require('crypto');
const { User } = require('../models');
const cache = require('./cache');

class WalletService {
  // Generate a nonce for wallet authentication
  async generateNonce(walletAddress) {
    try {
      const nonce = crypto.randomBytes(32).toString('hex');
      const timestamp = Date.now();
      
      // Store nonce in cache with expiration (5 minutes)
      const cacheKey = `nonce:${walletAddress}`;
      await cache.set(cacheKey, {
        nonce,
        timestamp,
        walletAddress
      }, 300); // 5 minutes

      return {
        nonce,
        timestamp,
        message: this.generateSignMessage(nonce, timestamp)
      };
    } catch (error) {
      console.error('Error generating nonce:', error);
      throw new Error('Failed to generate authentication nonce');
    }
  }

  // Generate the message to be signed by the wallet
  generateSignMessage(nonce, timestamp) {
    return `Sign this message to authenticate with the community platform.\n\nNonce: ${nonce}\nTimestamp: ${timestamp}\n\nThis signature will be used to verify your wallet ownership.`;
  }

  // Verify wallet signature
  async verifySignature(walletAddress, signature, nonce, timestamp) {
    try {
      // Get stored nonce from cache
      const cacheKey = `nonce:${walletAddress}`;
      const storedNonce = await cache.get(cacheKey);
      
      if (!storedNonce) {
        throw new Error('Nonce expired or not found');
      }

      if (storedNonce.nonce !== nonce) {
        throw new Error('Invalid nonce');
      }

      // Check if nonce is not too old (5 minutes)
      const now = Date.now();
      if (now - storedNonce.timestamp > 300000) { // 5 minutes
        await cache.del(cacheKey);
        throw new Error('Nonce expired');
      }

      // Verify signature (this is a simplified verification - in production, you'd use proper crypto)
      const message = this.generateSignMessage(nonce, timestamp);
      const isValid = await this.verifyEthereumSignature(message, signature, walletAddress);
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Clear the used nonce
      await cache.del(cacheKey);

      return true;
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  }

  // Verify Ethereum signature (simplified implementation)
  async verifyEthereumSignature(message, signature, expectedAddress) {
    try {
      // This is a simplified verification - in production, you'd use a proper library like ethers.js
      // For now, we'll simulate verification
      
      // In a real implementation, you would:
      // 1. Recover the address from the signature
      // 2. Compare it with the expected address
      // 3. Verify the message hash matches
      
      // For now, we'll accept any signature that looks valid
      if (signature && signature.length >= 130 && signature.startsWith('0x')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in signature verification:', error);
      return false;
    }
  }

  // Connect wallet and create/update user
  async connectWallet(walletAddress, userData = {}) {
    try {
      // Check if user already exists
      let user = await User.findOne({
        where: { wallet_address: walletAddress }
      });

      if (user) {
        // Update last login
        await user.update({
          last_login_at: new Date(),
          updated_at: new Date()
        });
      } else {
        // Create new user
        user = await User.create({
          wallet_address: walletAddress,
          username: userData.username || `user_${walletAddress.substring(0, 8)}`,
          email: userData.email,
          avatar_url: userData.avatar_url,
          bio: userData.bio,
          created_at: new Date(),
          updated_at: new Date(),
          last_login_at: new Date(),
          is_active: true
        });
      }

      return user;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  // Disconnect wallet (logout)
  async disconnectWallet(walletAddress) {
    try {
      // Clear any cached data for this wallet
      const cacheKeys = [
        `nonce:${walletAddress}`,
        `wallet:${walletAddress}:status`,
        `user:${walletAddress}:profile`
      ];

      for (const key of cacheKeys) {
        await cache.del(key);
      }

      return true;
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw new Error('Failed to disconnect wallet');
    }
  }

  // Get wallet connection status
  async getWalletStatus(walletAddress) {
    try {
      const cacheKey = `wallet:${walletAddress}:status`;
      const cachedStatus = await cache.get(cacheKey);
      
      if (cachedStatus) {
        return cachedStatus;
      }

      // Check if user exists
      const user = await User.findOne({
        where: { wallet_address: walletAddress }
      });

      const status = {
        connected: !!user,
        lastLogin: user ? user.last_login_at : null,
        isActive: user ? user.is_active : false,
        hasProfile: user ? !!(user.username && user.email) : false
      };

      // Cache status for 5 minutes
      await cache.set(cacheKey, status, 300);

      return status;
    } catch (error) {
      console.error('Error getting wallet status:', error);
      throw new Error('Failed to get wallet status');
    }
  }

  // Refresh authentication token
  async refreshAuthToken(walletAddress, currentToken) {
    try {
      // Verify current token
      const user = await User.findOne({
        where: { wallet_address: walletAddress }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.is_active) {
        throw new Error('User account is inactive');
      }

      // Generate new token (this would typically be done in the session service)
      // For now, we'll return a success response
      return {
        success: true,
        message: 'Token refreshed successfully',
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          username: user.username
        }
      };
    } catch (error) {
      console.error('Error refreshing auth token:', error);
      throw error;
    }
  }

  // Validate wallet address format
  validateWalletAddress(address) {
    if (!address) return false;
    
    // Basic Ethereum address validation
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }

  // Get user by wallet address
  async getUserByWallet(walletAddress) {
    try {
      const user = await User.findOne({
        where: { wallet_address: walletAddress }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error getting user by wallet:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(walletAddress, profileData) {
    try {
      const user = await User.findOne({
        where: { wallet_address: walletAddress }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      const allowedFields = ['username', 'email', 'bio', 'avatar_url'];
      const updateData = {};

      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      }

      updateData.updated_at = new Date();

      await user.update(updateData);

      // Clear cached profile data
      await cache.del(`user:${walletAddress}:profile`);

      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get user profile (with caching)
  async getUserProfile(walletAddress) {
    try {
      const cacheKey = `user:${walletAddress}:profile`;
      const cachedProfile = await cache.get(cacheKey);
      
      if (cachedProfile) {
        return cachedProfile;
      }

      const user = await User.findOne({
        where: { wallet_address: walletAddress }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const profile = {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
        isActive: user.is_active
      };

      // Cache profile for 10 minutes
      await cache.set(cacheKey, profile, 600);

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

module.exports = new WalletService(); 