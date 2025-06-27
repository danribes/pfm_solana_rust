/**
 * Validation utilities for the backend application
 */

const Joi = require('joi');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
  const schema = Joi.string().email();
  const { error } = schema.validate(email);
  return !error;
};

/**
 * Validate wallet address format
 * @param {string} walletAddress - Wallet address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateWalletAddress = (walletAddress) => {
  const schema = Joi.string().min(32).max(44);
  const { error } = schema.validate(walletAddress);
  return !error;
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateUsername = (username) => {
  const schema = Joi.string().alphanum().min(3).max(50);
  const { error } = schema.validate(username);
  return !error;
};

/**
 * Validate community name format
 * @param {string} name - Community name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateCommunityName = (name) => {
  const schema = Joi.string().min(1).max(100);
  const { error } = schema.validate(name);
  return !error;
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateUUID = (uuid) => {
  const schema = Joi.string().uuid();
  const { error } = schema.validate(uuid);
  return !error;
};

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} - Validated parameters with defaults
 */
const validatePagination = (params) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'name', 'member_count').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  });

  const { value, error } = schema.validate(params);
  if (error) {
    throw new Error(`Invalid pagination parameters: ${error.message}`);
  }

  return value;
};

module.exports = {
  validateEmail,
  validateWalletAddress,
  validateUsername,
  validateCommunityName,
  validateUUID,
  validatePagination
}; 