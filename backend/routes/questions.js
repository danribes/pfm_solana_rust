const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questions');
const { requireAuthenticatedSession } = require('../session/auth');
const {
  validateQuestionCreation,
  validateQuestionUpdate,
  validateQuestionId,
  validateQuestionOptions,
  validateQuestionDeadline,
  validateQuestionStatus
} = require('../middleware/validation');

// Apply authentication middleware to all question routes
router.use(requireAuthenticatedSession);

// Question CRUD endpoints
router.post('/:id/questions', validateQuestionCreation, questionsController.createQuestion);
router.get('/:id/questions', validateQuestionId, questionsController.getCommunityQuestions);
router.get('/:id/questions/:questionId', validateQuestionId, questionsController.getQuestionById);
router.put('/:id/questions/:questionId', validateQuestionUpdate, questionsController.updateQuestion);
router.delete('/:id/questions/:questionId', validateQuestionId, questionsController.deleteQuestion);

// Question configuration endpoints
router.put('/:id/questions/:questionId/options', validateQuestionOptions, questionsController.updateQuestionOptions);
router.put('/:id/questions/:questionId/deadline', validateQuestionDeadline, questionsController.updateQuestionDeadline);
router.post('/:id/questions/:questionId/activate', validateQuestionId, questionsController.activateQuestion);
router.post('/:id/questions/:questionId/close', validateQuestionId, questionsController.closeQuestion);

// Question status endpoints
router.get('/:id/questions/:questionId/status', validateQuestionId, questionsController.getQuestionStatus);
router.get('/:id/questions/active', validateQuestionStatus, questionsController.getQuestionsByStatus);
router.get('/:id/questions/closed', validateQuestionStatus, questionsController.getQuestionsByStatus);
router.get('/:id/questions/pending', validateQuestionStatus, questionsController.getQuestionsByStatus);
router.get('/:id/questions/inactive', validateQuestionStatus, questionsController.getQuestionsByStatus);

module.exports = router; 