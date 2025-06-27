// Unit tests for wallet authentication service
const walletAuth = require('../../auth/wallet');
const nonceService = require('../../services/nonce');
const signatureService = require('../../auth/signature');

// Mock dependencies
jest.mock('../../services/nonce');
jest.mock('../../auth/signature');

describe('Wallet Authentication Service', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    nonceService.generateNonce.mockReturnValue('abcdef1234567890');
    nonceService.storeNonce.mockImplementation(() => {});
    nonceService.getNonce.mockReturnValue('abcdef1234567890');
    nonceService.invalidateNonce.mockImplementation(() => {});
    
    signatureService.verifySignature.mockReturnValue(true);
  });

  describe('generateAuthChallenge', () => {
    test('should generate valid authentication challenge', () => {
      const walletAddress = '11111111111111111111111111111111';
      
      const result = walletAuth.generateAuthChallenge(walletAddress);
      
      expect(result).toBeDefined();
      expect(result.nonce).toBe('abcdef1234567890');
      expect(result.walletAddress).toBe(walletAddress);
      expect(result.message).toContain('Sign this message to authenticate');
      expect(result.message).toContain('Nonce: abcdef1234567890');
      expect(result.timestamp).toBeDefined();
    });

    test('should store nonce for wallet address', () => {
      const walletAddress = '22222222222222222222222222222222';
      
      walletAuth.generateAuthChallenge(walletAddress);
      
      expect(nonceService.storeNonce).toHaveBeenCalledWith(walletAddress, 'abcdef1234567890');
    });

    test('should throw error for invalid wallet address', () => {
      expect(() => {
        walletAuth.generateAuthChallenge('invalid-wallet');
      }).toThrow('Invalid wallet address format');
    });

    test('should throw error for empty wallet address', () => {
      expect(() => {
        walletAuth.generateAuthChallenge('');
      }).toThrow('Invalid wallet address format');
    });

    test('should throw error for null wallet address', () => {
      expect(() => {
        walletAuth.generateAuthChallenge(null);
      }).toThrow('Invalid wallet address format');
    });

    test('should handle rate limiting', () => {
      const walletAddress = '33333333333333333333333333333333';
      
      // Mock the rateLimitStore to simulate rate limiting
      const walletModule = require('../../auth/wallet');
      const originalRateLimitStore = walletModule.rateLimitStore;
      
      // Create a mock rate limit store with 5 recent timestamps (rate limited)
      const mockRateLimitStore = new Map();
      const now = Date.now();
      mockRateLimitStore.set(walletAddress, {
        timestamps: [now, now, now, now, now] // 5 timestamps = rate limited
      });
      
      // Replace the rateLimitStore temporarily
      walletModule.rateLimitStore = mockRateLimitStore;
      
      expect(() => {
        walletAuth.generateAuthChallenge(walletAddress);
      }).toThrow('Rate limit exceeded');
      
      // Restore original rateLimitStore
      walletModule.rateLimitStore = originalRateLimitStore;
    });
  });

  describe('authenticateWallet', () => {
    test('should authenticate wallet with valid signature', () => {
      const walletAddress = '44444444444444444444444444444444';
      const signature = 'valid-signature';
      
      // Generate actual message using the service
      const challenge = walletAuth.generateAuthChallenge(walletAddress);
      const message = challenge.message;
      
      const result = walletAuth.authenticateWallet(walletAddress, signature, message);
      
      expect(result.success).toBe(true);
      expect(result.walletAddress).toBe(walletAddress);
      expect(result.sessionToken).toBeDefined();
      expect(result.authenticatedAt).toBeDefined();
      expect(result.walletType).toBeDefined();
    });

    test('should invalidate nonce after successful authentication', () => {
      const walletAddress = '55555555555555555555555555555555';
      const signature = 'valid-signature';
      
      // Generate actual message using the service
      const challenge = walletAuth.generateAuthChallenge(walletAddress);
      const message = challenge.message;
      
      walletAuth.authenticateWallet(walletAddress, signature, message);
      
      expect(nonceService.invalidateNonce).toHaveBeenCalledWith(walletAddress);
    });

    test('should throw error for missing parameters', () => {
      expect(() => {
        walletAuth.authenticateWallet('wallet', 'signature', null);
      }).toThrow('Missing required authentication parameters');
      
      expect(() => {
        walletAuth.authenticateWallet('wallet', null, 'message');
      }).toThrow('Missing required authentication parameters');
      
      expect(() => {
        walletAuth.authenticateWallet(null, 'signature', 'message');
      }).toThrow('Missing required authentication parameters');
    });

    test('should throw error for invalid wallet address', () => {
      const signature = 'valid-signature';
      const message = 'Sign this message to authenticate with Community Voting System.\n\nNonce: abcdef1234567890\nTimestamp: 1234567890';
      
      expect(() => {
        walletAuth.authenticateWallet('invalid-wallet', signature, message);
      }).toThrow('Invalid wallet address format');
    });

    test('should throw error for invalid message format', () => {
      const walletAddress = '66666666666666666666666666666666';
      const signature = 'valid-signature';
      const message = 'Invalid message format';
      
      expect(() => {
        walletAuth.authenticateWallet(walletAddress, signature, message);
      }).toThrow('Invalid message format: nonce not found');
    });

    test('should throw error for non-existent nonce', () => {
      const walletAddress = '77777777777777777777777777777777';
      const signature = 'valid-signature';
      
      // Generate actual message using the service
      const challenge = walletAuth.generateAuthChallenge(walletAddress);
      const message = challenge.message;
      
      // Mock nonce service to return null (nonce doesn't exist)
      nonceService.getNonce.mockReturnValue(null);
      
      expect(() => {
        walletAuth.authenticateWallet(walletAddress, signature, message);
      }).toThrow('Invalid or expired nonce');
    });

    test('should throw error for mismatched nonce', () => {
      const walletAddress = '88888888888888888888888888888888';
      const signature = 'valid-signature';
      
      // Generate actual message using the service
      const challenge = walletAuth.generateAuthChallenge(walletAddress);
      const message = challenge.message;
      
      // Mock nonce service to return different nonce
      nonceService.getNonce.mockReturnValue('different-nonce');
      
      expect(() => {
        walletAuth.authenticateWallet(walletAddress, signature, message);
      }).toThrow('Invalid or expired nonce');
    });

    test('should throw error for invalid signature', () => {
      const walletAddress = '99999999999999999999999999999999';
      const signature = 'invalid-signature';
      
      // Generate actual message using the service
      const challenge = walletAuth.generateAuthChallenge(walletAddress);
      const message = challenge.message;
      
      // Mock signature service to return false (invalid signature)
      signatureService.verifySignature.mockReturnValue(false);
      
      expect(() => {
        walletAuth.authenticateWallet(walletAddress, signature, message);
      }).toThrow('Invalid signature');
    });

    test('should invalidate nonce on authentication failure', () => {
      const walletAddress = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      const signature = 'invalid-signature';
      
      // Generate actual message using the service
      const challenge = walletAuth.generateAuthChallenge(walletAddress);
      const message = challenge.message;
      
      // Mock signature service to return false (invalid signature)
      signatureService.verifySignature.mockReturnValue(false);
      
      expect(() => {
        walletAuth.authenticateWallet(walletAddress, signature, message);
      }).toThrow('Invalid signature');
      
      expect(nonceService.invalidateNonce).toHaveBeenCalledWith(walletAddress);
    });
  });

  describe('isValidWalletAddress', () => {
    test('should validate correct Solana addresses', () => {
      const validAddresses = [
        '11111111111111111111111111111111',
        '22222222222222222222222222222222',
        '33333333333333333333333333333333',
        '44444444444444444444444444444444',
        '55555555555555555555555555555555'
      ];
      
      validAddresses.forEach(address => {
        expect(walletAuth.isValidWalletAddress(address)).toBe(true);
      });
    });

    test('should reject invalid addresses', () => {
      const invalidAddresses = [
        '',
        'invalid',
        '1111111111111111111111111111111', // Too short (31)
        '1'.repeat(45), // Too long (45)
        '1111111111111111111111111111111O', // Contains O
        '1111111111111111111111111111111l', // Contains l
        '1111111111111111111111111111111I', // Contains I
      ];
      
      invalidAddresses.forEach(address => {
        expect(walletAuth.isValidWalletAddress(address)).toBe(false);
      });
    });
  });

  describe('getSupportedWallets', () => {
    test('should return array of supported wallet types', () => {
      const supportedWallets = walletAuth.getSupportedWallets();
      
      expect(Array.isArray(supportedWallets)).toBe(true);
      expect(supportedWallets).toContain('phantom');
      expect(supportedWallets).toContain('solflare');
      expect(supportedWallets).toContain('slope');
      expect(supportedWallets).toContain('backpack');
      expect(supportedWallets).toContain('metamask');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long wallet addresses', () => {
      const longAddress = 'A'.repeat(1000);
      expect(walletAuth.isValidWalletAddress(longAddress)).toBe(false);
    });

    test('should handle special characters in wallet address', () => {
      const specialAddress = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      expect(walletAuth.isValidWalletAddress(specialAddress)).toBe(false);
    });

    test('should handle unicode characters in wallet address', () => {
      const unicodeAddress = 'Hello世界🌍';
      expect(walletAuth.isValidWalletAddress(unicodeAddress)).toBe(false);
    });

    test('should handle null and undefined parameters', () => {
      expect(walletAuth.isValidWalletAddress(null)).toBe(false);
      expect(walletAuth.isValidWalletAddress(undefined)).toBe(false);
    });
  });
}); 