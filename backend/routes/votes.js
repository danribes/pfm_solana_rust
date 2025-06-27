const express = require('express');
const router = express.Router();
const votesController = require('../controllers/votes');
const { requireAuthenticatedSession } = require('../session/auth');
const {
  validateVoteCasting,
  validateVoteUpdate,
  validateVoteId,
  validateVoteValidation,
  validateVoteResults
} = require('../middleware/validation');

// Apply authentication middleware to all vote routes
router.use(requireAuthenticatedSession);

// Vote casting endpoints
router.post('/:id/questions/:questionId/votes', validateVoteCasting, votesController.castVote);
router.get('/:id/questions/:questionId/votes/my', validateVoteId, votesController.getUserVote);
router.put('/:id/questions/:questionId/votes', validateVoteUpdate, votesController.updateVote);
router.delete('/:id/questions/:questionId/votes', validateVoteId, votesController.cancelVote);

// Vote validation endpoints
router.get('/:id/questions/:questionId/votes/validate', validateVoteValidation, votesController.validateVoteEligibility);
router.get('/:id/questions/:questionId/votes/status', validateVoteValidation, votesController.getVotingStatus);
router.post('/:id/questions/:questionId/votes/check', validateVoteValidation, votesController.checkIfUserCanVote);

// Vote results endpoints
router.get('/:id/questions/:questionId/results', validateVoteResults, votesController.getVotingResults);
router.get('/:id/questions/:questionId/results/live', validateVoteResults, votesController.getLiveResults);
router.get('/:id/questions/:questionId/results/export', validateVoteResults, votesController.exportResults);
router.get('/:id/questions/:questionId/results/analytics', validateVoteResults, votesController.getVotingAnalytics);

module.exports = router; 