const questionsService = require('../services/questions');
const { ValidationError } = require('sequelize');

class QuestionsController {
  /**
   * Create a new voting question
   */
  async createQuestion(req, res) {
    try {
      const { id: communityId } = req.params;
      const questionData = req.body;
      const createdBy = req.session.userId;

      const question = await questionsService.createQuestion(communityId, questionData, createdBy);

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: question
      });
    } catch (error) {
      console.error('Create question error:', error);
      
      if (error.message.includes('Community not found')) {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      if (error.message.includes('User must be an active member')) {
        return res.status(403).json({
          success: false,
          error: 'User must be an active member of the community to create questions'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create question'
      });
    }
  }

  /**
   * Get all questions for a community
   */
  async getCommunityQuestions(req, res) {
    try {
      const { id: communityId } = req.params;
      const filters = {
        status: req.query.status || 'all',
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        sort_by: req.query.sort_by || 'created_at',
        sort_order: req.query.sort_order || 'desc'
      };

      const result = await questionsService.getCommunityQuestions(communityId, filters);

      res.json({
        success: true,
        data: result.questions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get community questions error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get community questions'
      });
    }
  }

  /**
   * Get a specific question by ID
   */
  async getQuestionById(req, res) {
    try {
      const { id: communityId, questionId } = req.params;

      const question = await questionsService.getQuestionById(communityId, questionId);

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Get question error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get question'
      });
    }
  }

  /**
   * Update a question
   */
  async updateQuestion(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const updateData = req.body;
      const updatedBy = req.session.userId;

      const question = await questionsService.updateQuestion(communityId, questionId, updateData, updatedBy);

      res.json({
        success: true,
        message: 'Question updated successfully',
        data: question
      });
    } catch (error) {
      console.error('Update question error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Only the question creator')) {
        return res.status(403).json({
          success: false,
          error: 'Only the question creator or community admin/moderator can update questions'
        });
      }

      if (error.message.includes('Cannot update question after voting has started')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot update question after voting has started'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update question'
      });
    }
  }

  /**
   * Delete a question
   */
  async deleteQuestion(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const deletedBy = req.session.userId;

      const result = await questionsService.deleteQuestion(communityId, questionId, deletedBy);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete question error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Only the question creator')) {
        return res.status(403).json({
          success: false,
          error: 'Only the question creator or community admin can delete questions'
        });
      }

      if (error.message.includes('Cannot delete question after voting has started')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete question after voting has started'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete question'
      });
    }
  }

  /**
   * Update question options
   */
  async updateQuestionOptions(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const { options } = req.body;
      const updatedBy = req.session.userId;

      const question = await questionsService.updateQuestionOptions(communityId, questionId, options, updatedBy);

      res.json({
        success: true,
        message: 'Question options updated successfully',
        data: question
      });
    } catch (error) {
      console.error('Update question options error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Only the question creator')) {
        return res.status(403).json({
          success: false,
          error: 'Only the question creator or community admin/moderator can update question options'
        });
      }

      if (error.message.includes('Cannot update question options after voting has started')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot update question options after voting has started'
        });
      }

      if (error.message.includes('Question must have at least 2 options') || 
          error.message.includes('Question cannot have more than 10 options')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update question options'
      });
    }
  }

  /**
   * Update question deadline
   */
  async updateQuestionDeadline(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const { deadline } = req.body;
      const updatedBy = req.session.userId;

      const question = await questionsService.updateQuestionDeadline(communityId, questionId, deadline, updatedBy);

      res.json({
        success: true,
        message: 'Question deadline updated successfully',
        data: question
      });
    } catch (error) {
      console.error('Update question deadline error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Only the question creator')) {
        return res.status(403).json({
          success: false,
          error: 'Only the question creator or community admin/moderator can update question deadline'
        });
      }

      if (error.message.includes('Invalid deadline date') || 
          error.message.includes('Deadline must be in the future')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update question deadline'
      });
    }
  }

  /**
   * Activate a question
   */
  async activateQuestion(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const activatedBy = req.session.userId;

      const question = await questionsService.activateQuestion(communityId, questionId, activatedBy);

      res.json({
        success: true,
        message: 'Question activated successfully',
        data: question
      });
    } catch (error) {
      console.error('Activate question error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Only the question creator')) {
        return res.status(403).json({
          success: false,
          error: 'Only the question creator or community admin/moderator can activate questions'
        });
      }

      if (error.message.includes('Question must have a start date') || 
          error.message.includes('Cannot activate question before its start date')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to activate question'
      });
    }
  }

  /**
   * Close a question
   */
  async closeQuestion(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const closedBy = req.session.userId;

      const question = await questionsService.closeQuestion(communityId, questionId, closedBy);

      res.json({
        success: true,
        message: 'Question closed successfully',
        data: question
      });
    } catch (error) {
      console.error('Close question error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Only the question creator')) {
        return res.status(403).json({
          success: false,
          error: 'Only the question creator or community admin/moderator can close questions'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to close question'
      });
    }
  }

  /**
   * Get question status
   */
  async getQuestionStatus(req, res) {
    try {
      const { id: communityId, questionId } = req.params;

      const status = await questionsService.getQuestionStatus(communityId, questionId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get question status error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get question status'
      });
    }
  }

  /**
   * Get questions by status
   */
  async getQuestionsByStatus(req, res) {
    try {
      const { id: communityId } = req.params;
      const { status } = req.query;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status parameter is required'
        });
      }

      const questions = await questionsService.getQuestionsByStatus(communityId, status);

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      console.error('Get questions by status error:', error);
      
      if (error.message.includes('Invalid status filter')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status filter. Must be active, closed, pending, or inactive'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get questions by status'
      });
    }
  }
}

module.exports = new QuestionsController(); 