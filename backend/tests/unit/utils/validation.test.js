/**
 * Unit tests for Validation Utilities
 */

const validationUtils = require('../../../utils/validation');

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validationUtils.validateEmail('test@example.com')).toBe(true);
      expect(validationUtils.validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validationUtils.validateEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validationUtils.validateEmail('invalid-email')).toBe(false);
      expect(validationUtils.validateEmail('test@')).toBe(false);
      expect(validationUtils.validateEmail('@example.com')).toBe(false);
      expect(validationUtils.validateEmail('')).toBe(false);
      expect(validationUtils.validateEmail(null)).toBe(false);
    });
  });

  describe('validateWalletAddress', () => {
    it('should validate correct Solana wallet addresses', () => {
      expect(validationUtils.validateWalletAddress('11111111111111111111111111111111')).toBe(true);
      expect(validationUtils.validateWalletAddress('So11111111111111111111111111111111111111112')).toBe(true);
    });

    it('should reject invalid wallet addresses', () => {
      expect(validationUtils.validateWalletAddress('invalid')).toBe(false);
      expect(validationUtils.validateWalletAddress('')).toBe(false);
      expect(validationUtils.validateWalletAddress(null)).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      expect(validationUtils.validateUsername('testuser')).toBe(true);
      expect(validationUtils.validateUsername('user123')).toBe(true);
      expect(validationUtils.validateUsername('test_user')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validationUtils.validateUsername('')).toBe(false);
      expect(validationUtils.validateUsername('a')).toBe(false); // Too short
      expect(validationUtils.validateUsername('a'.repeat(51))).toBe(false); // Too long
      expect(validationUtils.validateUsername('test@user')).toBe(false); // Invalid characters
    });
  });
}); 