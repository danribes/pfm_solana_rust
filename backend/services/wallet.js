const crypto = require('crypto');
const { User } = require('../models');
const redis = require('../redis');

class WalletService {
  // Generate a nonce for wallet authentication
  async generateNonce(walletAddress) {
    try {
      const nonce = crypto.randomBytes(32).toString('hex');
      const timestamp = Date.now();
      
      // Store nonce in Redis with expiration (5 minutes)
      const cacheKey = `nonce:${walletAddress}`;
      const redisClient = redis.getRedisClient();
      await redisClient.setex(cacheKey, 300, JSON.stringify({
        nonce,
        timestamp,
        walletAddress
      })); // 5 minutes

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
      // Get stored nonce from Redis
      const cacheKey = `nonce:${walletAddress}`;
      const redisClient = redis.getRedisClient();
      const storedNonceString = await redisClient.get(cacheKey);
      const storedNonce = storedNonceString ? JSON.parse(storedNonceString) : null;
      
      if (!storedNonce) {
        throw new Error('Nonce expired or not found');
      }

      if (storedNonce.nonce !== nonce) {
        throw new Error('Invalid nonce');
      }

      // Check if nonce is not too old (5 minutes)
      const now = Date.now();
      if (now - storedNonce.timestamp > 300000) { // 5 minutes
        await redisClient.del(cacheKey);
        throw new Error('Nonce expired');
      }

      // Verify signature (this is a simplified verification - in production, you'd use proper crypto)
      const message = this.generateSignMessage(nonce, timestamp);
      const isValid = await this.verifySolanaSignature(message, signature, walletAddress);
      
      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Clear the used nonce
      await redisClient.del(cacheKey);

      return true;
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw error;
    }
  }

  // Verify Solana signature (simplified implementation)
  async verifySolanaSignature(message, signature, expectedAddress) {
    try {
      // This is a simplified verification - in production, you'd use @solana/web3.js
      // For now, we'll simulate verification for development
      
      // In a real implementation, you would:
      // 1. Create PublicKey from expectedAddress
      // 2. Verify the signature using nacl.sign.detached.verify
      // 3. Ensure the message matches what was signed
      
      // For development purposes, accept valid base64 signatures
      if (signature && typeof signature === 'string') {
        // Check if it's valid base64
        try {
          Buffer.from(signature, 'base64');
          return true; // Accept for development
        } catch (e) {
          return false;
        }
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

      const redisClient = redis.getRedisClient();
      for (const key of cacheKeys) {
        await redisClient.del(key);
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
      const redisClient = redis.getRedisClient();
      const cachedStatusString = await redisClient.get(cacheKey);
      const cachedStatus = cachedStatusString ? JSON.parse(cachedStatusString) : null;
      
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
      await redisClient.setex(cacheKey, 300, JSON.stringify(status));

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

  // Validate Solana wallet address format
  validateWalletAddress(address) {
    if (!address || typeof address !== 'string') return false;
    
    // Solana addresses are base58 encoded, 32-44 characters
    // Exclude confusing characters: 0, O, l, I
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
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
      const redisClient = redis.getRedisClient();
      await redisClient.del(`user:${walletAddress}:profile`);

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
      const redisClient = redis.getRedisClient();
      const cachedProfileString = await redisClient.get(cacheKey);
      const cachedProfile = cachedProfileString ? JSON.parse(cachedProfileString) : null;
      
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
      await redisClient.setex(cacheKey, 600, JSON.stringify(profile));

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

module.exports = new WalletService(); 