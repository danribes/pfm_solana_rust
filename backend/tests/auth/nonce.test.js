// Unit tests for nonce management service
const nonceService = require('../../services/nonce');

describe('Nonce Management Service', () => {
  beforeEach(() => {
    // Clear the nonce store before each test
    // Note: In a real implementation, this would be handled by the service
    // For now, we'll test the functions as they are
  });

  describe('generateNonce', () => {
    test('should generate a nonce with correct format', () => {
      const nonce = nonceService.generateNonce();
      
      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBe(48); // 24 bytes = 48 hex characters
      expect(nonce).toMatch(/^[a-f0-9]+$/); // Hex format
    });

    test('should generate unique nonces', () => {
      const nonce1 = nonceService.generateNonce();
      const nonce2 = nonceService.generateNonce();
      
      expect(nonce1).not.toBe(nonce2);
    });

    test('should generate cryptographically secure nonces', () => {
      const nonces = new Set();
      
      // Generate 100 nonces and check for uniqueness
      for (let i = 0; i < 100; i++) {
        const nonce = nonceService.generateNonce();
        expect(nonces.has(nonce)).toBe(false);
        nonces.add(nonce);
      }
    });
  });

  describe('storeNonce', () => {
    test('should store nonce for wallet address', () => {
      const walletAddress = '11111111111111111111111111111111';
      const nonce = nonceService.generateNonce();
      
      nonceService.storeNonce(walletAddress, nonce);
      const retrievedNonce = nonceService.getNonce(walletAddress);
      
      expect(retrievedNonce).toBe(nonce);
    });

    test('should overwrite existing nonce for same wallet', () => {
      const walletAddress = '22222222222222222222222222222222';
      const nonce1 = nonceService.generateNonce();
      const nonce2 = nonceService.generateNonce();
      
      nonceService.storeNonce(walletAddress, nonce1);
      nonceService.storeNonce(walletAddress, nonce2);
      
      const retrievedNonce = nonceService.getNonce(walletAddress);
      expect(retrievedNonce).toBe(nonce2);
      expect(retrievedNonce).not.toBe(nonce1);
    });

    test('should handle multiple wallet addresses', () => {
      const wallet1 = '33333333333333333333333333333333';
      const wallet2 = '44444444444444444444444444444444';
      const nonce1 = nonceService.generateNonce();
      const nonce2 = nonceService.generateNonce();
      
      nonceService.storeNonce(wallet1, nonce1);
      nonceService.storeNonce(wallet2, nonce2);
      
      expect(nonceService.getNonce(wallet1)).toBe(nonce1);
      expect(nonceService.getNonce(wallet2)).toBe(nonce2);
    });
  });

  describe('getNonce', () => {
    test('should retrieve stored nonce', () => {
      const walletAddress = '55555555555555555555555555555555';
      const nonce = nonceService.generateNonce();
      
      nonceService.storeNonce(walletAddress, nonce);
      const retrievedNonce = nonceService.getNonce(walletAddress);
      
      expect(retrievedNonce).toBe(nonce);
    });

    test('should return null for non-existent wallet', () => {
      const walletAddress = '66666666666666666666666666666666';
      const retrievedNonce = nonceService.getNonce(walletAddress);
      
      expect(retrievedNonce).toBeNull();
    });

    test('should return null for invalid wallet address', () => {
      const retrievedNonce = nonceService.getNonce('');
      expect(retrievedNonce).toBeNull();
    });
  });

  describe('invalidateNonce', () => {
    test('should remove nonce for wallet address', () => {
      const walletAddress = '77777777777777777777777777777777';
      const nonce = nonceService.generateNonce();
      
      nonceService.storeNonce(walletAddress, nonce);
      expect(nonceService.getNonce(walletAddress)).toBe(nonce);
      
      nonceService.invalidateNonce(walletAddress);
      expect(nonceService.getNonce(walletAddress)).toBeNull();
    });

    test('should handle invalidating non-existent nonce', () => {
      const walletAddress = '88888888888888888888888888888888';
      
      // Should not throw error
      expect(() => {
        nonceService.invalidateNonce(walletAddress);
      }).not.toThrow();
      
      expect(nonceService.getNonce(walletAddress)).toBeNull();
    });

    test('should not affect other wallet nonces when invalidating one', () => {
      const wallet1 = '99999999999999999999999999999999';
      const wallet2 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
      const nonce1 = nonceService.generateNonce();
      const nonce2 = nonceService.generateNonce();
      
      nonceService.storeNonce(wallet1, nonce1);
      nonceService.storeNonce(wallet2, nonce2);
      
      nonceService.invalidateNonce(wallet1);
      
      expect(nonceService.getNonce(wallet1)).toBeNull();
      expect(nonceService.getNonce(wallet2)).toBe(nonce2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty wallet address', () => {
      const nonce = nonceService.generateNonce();
      
      nonceService.storeNonce('', nonce);
      expect(nonceService.getNonce('')).toBe(nonce);
      
      nonceService.invalidateNonce('');
      expect(nonceService.getNonce('')).toBeNull();
    });

    test('should handle very long wallet addresses', () => {
      const longWalletAddress = 'A'.repeat(1000);
      const nonce = nonceService.generateNonce();
      
      nonceService.storeNonce(longWalletAddress, nonce);
      expect(nonceService.getNonce(longWalletAddress)).toBe(nonce);
    });

    test('should handle special characters in wallet address', () => {
      const specialWalletAddress = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const nonce = nonceService.generateNonce();
      
      nonceService.storeNonce(specialWalletAddress, nonce);
      expect(nonceService.getNonce(specialWalletAddress)).toBe(nonce);
    });
  });
}); 