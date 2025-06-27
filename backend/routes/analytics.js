const express = require('express');
const analyticsController = require('../controllers/analytics');
const { body, query, param } = require('express-validator');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateDateRange = [
  query('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateCommunityId = [
  param('id').isUUID().withMessage('Community ID must be a valid UUID')
];

const validateQuestionId = [
  param('id').isUUID().withMessage('Question ID must be a valid UUID')
];

const validateReportGeneration = [
  body('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Format must be json, csv, or pdf'),
  body('start_date').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  body('end_date').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  body('community_id').optional().isUUID().withMessage('Community ID must be a valid UUID'),
  body('filename').optional().isString().withMessage('Filename must be a string')
];

const validateCustomReport = [
  body('reportType').isIn(['community_overview', 'voting_summary', 'user_activity', 'member_engagement']).withMessage('Invalid report type'),
  body('filters').optional().isObject().withMessage('Filters must be an object'),
  body('customMetrics').optional().isArray().withMessage('Custom metrics must be an array'),
  body('format').optional().isIn(['json', 'csv', 'pdf']).withMessage('Format must be json, csv, or pdf'),
  body('filename').optional().isString().withMessage('Filename must be a string')
];

const validateFilename = [
  param('filename').isString().withMessage('Filename must be a string')
];

// Community Analytics Endpoints
router.get('/communities', 
  authenticateUser,
  validateDateRange,
  analyticsController.getCommunityAnalytics
);

router.get('/communities/:id/overview',
  authenticateUser,
  validateCommunityId,
  validateDateRange,
  analyticsController.getCommunityOverview
);

router.get('/communities/:id/members',
  authenticateUser,
  validateCommunityId,
  validateDateRange,
  analyticsController.getMemberEngagement
);

// Voting Analytics Endpoints
router.get('/voting/participation',
  authenticateUser,
  validateDateRange,
  analyticsController.getVotingAnalytics
);

router.get('/voting/questions/:id',
  authenticateUser,
  validateQuestionId,
  analyticsController.getQuestionAnalytics
);

// User Analytics Endpoints
router.get('/users/activity',
  authenticateUser,
  validateDateRange,
  analyticsController.getUserAnalytics
);

// Report Generation Endpoints
router.post('/reports/communities/:id',
  authenticateUser,
  validateCommunityId,
  validateReportGeneration,
  analyticsController.generateCommunityReport
);

router.post('/reports/voting',
  authenticateUser,
  validateReportGeneration,
  analyticsController.generateVotingReport
);

router.post('/reports/generate',
  authenticateUser,
  validateCustomReport,
  analyticsController.generateCustomReport
);

// Report Management Endpoints
router.get('/reports',
  authenticateUser,
  analyticsController.listReports
);

router.get('/reports/:filename',
  authenticateUser,
  validateFilename,
  analyticsController.downloadReport
);

router.delete('/reports/:filename',
  authenticateUser,
  validateFilename,
  analyticsController.deleteReport
);

// Analytics Management Endpoints
router.get('/cache/stats',
  authenticateUser,
  analyticsController.getCacheStats
);

router.post('/cache/clear',
  authenticateUser,
  body('pattern').optional().isString().withMessage('Pattern must be a string'),
  analyticsController.clearCache
);

router.get('/report-types',
  authenticateUser,
  analyticsController.getReportTypes
);

module.exports = router; 