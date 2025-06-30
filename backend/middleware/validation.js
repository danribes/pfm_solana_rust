const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Community creation validation
const validateCommunityCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Community name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Community name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('logo_url')
    .optional()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),
  
  body('banner_url')
    .optional()
    .isURL()
    .withMessage('Banner URL must be a valid URL'),
  
  body('website_url')
    .optional()
    .isURL()
    .withMessage('Website URL must be a valid URL'),
  
  body('discord_url')
    .optional()
    .isURL()
    .withMessage('Discord URL must be a valid URL'),
  
  body('twitter_url')
    .optional()
    .isURL()
    .withMessage('Twitter URL must be a valid URL'),
  
  body('github_url')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  
  body('require_approval')
    .optional()
    .isBoolean()
    .withMessage('require_approval must be a boolean'),
  
  body('allow_public_voting')
    .optional()
    .isBoolean()
    .withMessage('allow_public_voting must be a boolean'),
  
  body('max_members')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('max_members must be between 1 and 100000'),
  
  body('voting_threshold')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('voting_threshold must be between 1 and 100'),
  
  handleValidationErrors
];

// Community update validation
const validateCommunityUpdate = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Community name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Community name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('logo_url')
    .optional()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),
  
  body('banner_url')
    .optional()
    .isURL()
    .withMessage('Banner URL must be a valid URL'),
  
  body('website_url')
    .optional()
    .isURL()
    .withMessage('Website URL must be a valid URL'),
  
  body('discord_url')
    .optional()
    .isURL()
    .withMessage('Discord URL must be a valid URL'),
  
  body('twitter_url')
    .optional()
    .isURL()
    .withMessage('Twitter URL must be a valid URL'),
  
  body('github_url')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  
  body('require_approval')
    .optional()
    .isBoolean()
    .withMessage('require_approval must be a boolean'),
  
  body('allow_public_voting')
    .optional()
    .isBoolean()
    .withMessage('allow_public_voting must be a boolean'),
  
  body('max_members')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('max_members must be between 1 and 100000'),
  
  body('voting_threshold')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('voting_threshold must be between 1 and 100'),
  
  handleValidationErrors
];

// Community ID validation
const validateCommunityId = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  handleValidationErrors
];

// Community listing validation
const validateCommunityListing = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'all'])
    .withMessage('Status must be active, inactive, or all'),
  
  query('sort_by')
    .optional()
    .isIn(['name', 'created_at', 'member_count', 'updated_at'])
    .withMessage('Sort by must be name, created_at, member_count, or updated_at'),
  
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

// Configuration validation
const validateConfiguration = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  body('require_approval')
    .optional()
    .isBoolean()
    .withMessage('require_approval must be a boolean'),
  
  body('allow_public_voting')
    .optional()
    .isBoolean()
    .withMessage('allow_public_voting must be a boolean'),
  
  body('max_members')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('max_members must be between 1 and 100000'),
  
  body('voting_threshold')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('voting_threshold must be between 1 and 100'),
  
  handleValidationErrors
];

// Analytics date range validation
const validateAnalyticsDateRange = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Period must be day, week, month, or year'),
  
  handleValidationErrors
];

// Membership application validation
const validateMembershipApplication = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  handleValidationErrors
];

// Membership listing validation
const validateMembershipListing = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'banned', 'all'])
    .withMessage('Status must be pending, approved, rejected, banned, or all'),
  
  query('role')
    .optional()
    .isIn(['member', 'moderator', 'admin'])
    .withMessage('Role must be member, moderator, or admin'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  
  handleValidationErrors
];

// Membership ID validation
const validateMembershipId = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('memberId')
    .isUUID()
    .withMessage('Invalid member ID format'),
  
  handleValidationErrors
];

// Role change validation
const validateRoleChange = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('memberId')
    .isUUID()
    .withMessage('Invalid member ID format'),
  
  body('role')
    .isIn(['member', 'moderator', 'admin'])
    .withMessage('Role must be member, moderator, or admin'),
  
  handleValidationErrors
];

// Status update validation
const validateStatusUpdate = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('memberId')
    .isUUID()
    .withMessage('Invalid member ID format'),
  
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'banned'])
    .withMessage('Status must be pending, approved, rejected, or banned'),
  
  handleValidationErrors
];

// User memberships validation
const validateUserMemberships = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'banned', 'all'])
    .withMessage('Status must be pending, approved, rejected, banned, or all'),
  
  query('role')
    .optional()
    .isIn(['member', 'moderator', 'admin'])
    .withMessage('Role must be member, moderator, or admin'),
  
  handleValidationErrors
];

// Membership history validation
const validateMembershipHistory = [
  param('id')
    .isUUID()
    .withMessage('Invalid membership ID format'),
  
  handleValidationErrors
];

// User profile update validation
const validateUserProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  
  handleValidationErrors
];

// User preferences validation
const validateUserPreferences = [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  
  body('language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'zh'])
    .withMessage('Language must be en, es, fr, de, or zh'),
  
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),
  
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),
  
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications must be a boolean'),
  
  body('communityNotifications')
    .optional()
    .isBoolean()
    .withMessage('communityNotifications must be a boolean'),
  
  body('votingNotifications')
    .optional()
    .isBoolean()
    .withMessage('votingNotifications must be a boolean'),
  
  body('privacyLevel')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Privacy level must be public, friends, or private'),
  
  body('showWalletAddress')
    .optional()
    .isBoolean()
    .withMessage('showWalletAddress must be a boolean'),
  
  body('allowDirectMessages')
    .optional()
    .isBoolean()
    .withMessage('allowDirectMessages must be a boolean'),
  
  handleValidationErrors
];

// Notification settings validation
const validateNotificationSettings = [
  body('emailNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications.enabled must be a boolean'),
  
  body('emailNotifications.communityUpdates')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications.communityUpdates must be a boolean'),
  
  body('emailNotifications.votingReminders')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications.votingReminders must be a boolean'),
  
  body('emailNotifications.newMembers')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications.newMembers must be a boolean'),
  
  body('emailNotifications.directMessages')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications.directMessages must be a boolean'),
  
  body('pushNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications.enabled must be a boolean'),
  
  body('pushNotifications.communityUpdates')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications.communityUpdates must be a boolean'),
  
  body('pushNotifications.votingReminders')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications.votingReminders must be a boolean'),
  
  body('pushNotifications.newMembers')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications.newMembers must be a boolean'),
  
  body('pushNotifications.directMessages')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications.directMessages must be a boolean'),
  
  body('inAppNotifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('inAppNotifications.enabled must be a boolean'),
  
  body('inAppNotifications.communityUpdates')
    .optional()
    .isBoolean()
    .withMessage('inAppNotifications.communityUpdates must be a boolean'),
  
  body('inAppNotifications.votingReminders')
    .optional()
    .isBoolean()
    .withMessage('inAppNotifications.votingReminders must be a boolean'),
  
  body('inAppNotifications.newMembers')
    .optional()
    .isBoolean()
    .withMessage('inAppNotifications.newMembers must be a boolean'),
  
  body('inAppNotifications.directMessages')
    .optional()
    .isBoolean()
    .withMessage('inAppNotifications.directMessages must be a boolean'),
  
  body('frequency')
    .optional()
    .isIn(['immediate', 'daily', 'weekly'])
    .withMessage('Frequency must be immediate, daily, or weekly'),
  
  body('quietHours.enabled')
    .optional()
    .isBoolean()
    .withMessage('quietHours.enabled must be a boolean'),
  
  body('quietHours.start')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours start time must be in HH:MM format'),
  
  body('quietHours.end')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours end time must be in HH:MM format'),
  
  body('quietHours.timezone')
    .optional()
    .isString()
    .withMessage('Quiet hours timezone must be a string'),
  
  handleValidationErrors
];

// User search validation
const validateUserSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query must be less than 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('includeInactive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeInactive must be true or false'),
  
  handleValidationErrors
];

// User ID validation
const validateUserId = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  
  handleValidationErrors
];

// Wallet address validation (Solana format)
const validateWalletAddress = [
  body('walletAddress')
    .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    .withMessage('Invalid Solana wallet address format'),
  
  handleValidationErrors
];

// Wallet address parameter validation (Solana format)
const validateWalletAddressParam = [
  param('walletAddress')
    .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    .withMessage('Invalid Solana wallet address format'),
  
  handleValidationErrors
];

// Wallet signature validation (Solana format)
const validateWalletSignature = [
  body('walletAddress')
    .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
    .withMessage('Invalid Solana wallet address format'),
  
  body('signature')
    .isBase64()
    .withMessage('Invalid signature format (must be base64)'),
  
  body('nonce')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Nonce is required'),
  
  body('timestamp')
    .isInt({ min: 1 })
    .withMessage('Timestamp must be a positive integer'),
  
  handleValidationErrors
];

// User data validation
const validateUserData = [
  body('userData.username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('userData.email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  
  body('userData.avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  
  body('userData.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  handleValidationErrors
];

// Question creation validation
const validateQuestionCreation = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Question title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  
  body('question_type')
    .optional()
    .isIn(['single_choice', 'multiple_choice', 'ranked_choice'])
    .withMessage('Question type must be single_choice, multiple_choice, or ranked_choice'),
  
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Question must have between 2 and 10 options'),
  
  body('options.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each option must be between 1 and 200 characters'),
  
  body('voting_start_at')
    .optional()
    .isISO8601()
    .withMessage('Voting start date must be a valid ISO 8601 date'),
  
  body('voting_end_at')
    .optional()
    .isISO8601()
    .withMessage('Voting end date must be a valid ISO 8601 date'),
  
  body('allow_anonymous_voting')
    .optional()
    .isBoolean()
    .withMessage('allow_anonymous_voting must be a boolean'),
  
  body('require_member_approval')
    .optional()
    .isBoolean()
    .withMessage('require_member_approval must be a boolean'),
  
  body('min_votes_required')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('min_votes_required must be between 1 and 1000'),
  
  handleValidationErrors
];

// Question update validation
const validateQuestionUpdate = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Question title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  
  body('question_type')
    .optional()
    .isIn(['single_choice', 'multiple_choice', 'ranked_choice'])
    .withMessage('Question type must be single_choice, multiple_choice, or ranked_choice'),
  
  body('voting_start_at')
    .optional()
    .isISO8601()
    .withMessage('Voting start date must be a valid ISO 8601 date'),
  
  body('voting_end_at')
    .optional()
    .isISO8601()
    .withMessage('Voting end date must be a valid ISO 8601 date'),
  
  body('allow_anonymous_voting')
    .optional()
    .isBoolean()
    .withMessage('allow_anonymous_voting must be a boolean'),
  
  body('require_member_approval')
    .optional()
    .isBoolean()
    .withMessage('require_member_approval must be a boolean'),
  
  body('min_votes_required')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('min_votes_required must be between 1 and 1000'),
  
  handleValidationErrors
];

// Question ID validation
const validateQuestionId = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  handleValidationErrors
];

// Question options validation
const validateQuestionOptions = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Question must have between 2 and 10 options'),
  
  body('options.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each option must be between 1 and 200 characters'),
  
  handleValidationErrors
];

// Question deadline validation
const validateQuestionDeadline = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid ISO 8601 date'),
  
  handleValidationErrors
];

// Question status validation
const validateQuestionStatus = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Vote casting validation
const validateVoteCasting = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  body('selected_options')
    .isArray({ min: 1 })
    .withMessage('At least one option must be selected'),
  
  body('selected_options.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each selected option must be between 1 and 200 characters'),
  
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  
  body('transaction_signature')
    .optional()
    .isString()
    .isLength({ min: 1, max: 88 })
    .withMessage('Transaction signature must be between 1 and 88 characters'),
  
  handleValidationErrors
];

// Vote update validation
const validateVoteUpdate = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  body('selected_options')
    .isArray({ min: 1 })
    .withMessage('At least one option must be selected'),
  
  body('selected_options.*')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each selected option must be between 1 and 200 characters'),
  
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  
  body('transaction_signature')
    .optional()
    .isString()
    .isLength({ min: 1, max: 88 })
    .withMessage('Transaction signature must be between 1 and 88 characters'),
  
  handleValidationErrors
];

// Vote ID validation
const validateVoteId = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  handleValidationErrors
];

// Vote validation endpoints validation
const validateVoteValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  handleValidationErrors
];

// Vote results validation
const validateVoteResults = [
  param('id')
    .isUUID()
    .withMessage('Invalid community ID format'),
  
  param('questionId')
    .isUUID()
    .withMessage('Invalid question ID format'),
  
  query('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateCommunityCreation,
  validateCommunityUpdate,
  validateCommunityId,
  validateCommunityListing,
  validateConfiguration,
  validateAnalyticsDateRange,
  validateMembershipApplication,
  validateMembershipListing,
  validateMembershipId,
  validateRoleChange,
  validateStatusUpdate,
  validateUserMemberships,
  validateMembershipHistory,
  validateUserProfileUpdate,
  validateUserPreferences,
  validateNotificationSettings,
  validateUserSearch,
  validateUserId,
  validateWalletAddress,
  validateWalletAddressParam,
  validateWalletSignature,
  validateUserData,
  validateQuestionCreation,
  validateQuestionUpdate,
  validateQuestionId,
  validateQuestionOptions,
  validateQuestionDeadline,
  validateQuestionStatus,
  validateVoteCasting,
  validateVoteUpdate,
  validateVoteId,
  validateVoteValidation,
  validateVoteResults
}; 