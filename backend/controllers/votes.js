const votesService = require('../services/votes');

class VotesController {
  /**
   * Cast a vote on a question
   */
  async castVote(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const voteData = req.body;
      const userId = req.session.userId;

      const vote = await votesService.castVote(communityId, questionId, voteData, userId);

      res.status(201).json({
        success: true,
        message: 'Vote cast successfully',
        data: vote
      });
    } catch (error) {
      console.error('Cast vote error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Voting has not started') || 
          error.message.includes('Voting period has ended')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('User has already voted')) {
        return res.status(409).json({
          success: false,
          error: 'User has already voted on this question'
        });
      }

      if (error.message.includes('User is not an active member')) {
        return res.status(403).json({
          success: false,
          error: 'User is not an active member of the community'
        });
      }

      if (error.message.includes('Invalid option selected') ||
          error.message.includes('Single choice questions allow only one option') ||
          error.message.includes('Cannot select more options than available') ||
          error.message.includes('Ranked choice questions require ranking all options') ||
          error.message.includes('Ranked choice options must be unique')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to cast vote'
      });
    }
  }

  /**
   * Get user's vote on a question
   */
  async getUserVote(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const userId = req.session.userId;

      const vote = await votesService.getUserVote(communityId, questionId, userId);

      if (!vote) {
        return res.status(404).json({
          success: false,
          error: 'Vote not found'
        });
      }

      res.json({
        success: true,
        data: vote
      });
    } catch (error) {
      console.error('Get user vote error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get user vote'
      });
    }
  }

  /**
   * Update user's vote
   */
  async updateVote(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const voteData = req.body;
      const userId = req.session.userId;

      const vote = await votesService.updateVote(communityId, questionId, voteData, userId);

      res.json({
        success: true,
        message: 'Vote updated successfully',
        data: vote
      });
    } catch (error) {
      console.error('Update vote error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Cannot update vote after voting period has ended')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot update vote after voting period has ended'
        });
      }

      if (error.message.includes('No vote found to update')) {
        return res.status(404).json({
          success: false,
          error: 'No vote found to update'
        });
      }

      if (error.message.includes('Invalid option selected') ||
          error.message.includes('Single choice questions allow only one option') ||
          error.message.includes('Cannot select more options than available') ||
          error.message.includes('Ranked choice questions require ranking all options') ||
          error.message.includes('Ranked choice options must be unique')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update vote'
      });
    }
  }

  /**
   * Cancel user's vote
   */
  async cancelVote(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const userId = req.session.userId;

      const result = await votesService.cancelVote(communityId, questionId, userId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Cancel vote error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      if (error.message.includes('Cannot cancel vote after voting period has ended')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel vote after voting period has ended'
        });
      }

      if (error.message.includes('No vote found to cancel')) {
        return res.status(404).json({
          success: false,
          error: 'No vote found to cancel'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to cancel vote'
      });
    }
  }

  /**
   * Validate vote eligibility
   */
  async validateVoteEligibility(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const userId = req.session.userId;

      const eligibility = await votesService.checkVoteEligibility(communityId, questionId, userId);

      res.json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      console.error('Validate vote eligibility error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to validate vote eligibility'
      });
    }
  }

  /**
   * Get voting status
   */
  async getVotingStatus(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const userId = req.session.userId;

      const status = await votesService.getVotingStatus(communityId, questionId, userId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get voting status error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get voting status'
      });
    }
  }

  /**
   * Check if user can vote
   */
  async checkIfUserCanVote(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const userId = req.session.userId;

      const eligibility = await votesService.checkVoteEligibility(communityId, questionId, userId);

      res.json({
        success: true,
        data: {
          can_vote: eligibility.canVote,
          reason: eligibility.reason
        }
      });
    } catch (error) {
      console.error('Check if user can vote error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to check if user can vote'
      });
    }
  }

  /**
   * Get voting results
   */
  async getVotingResults(req, res) {
    try {
      const { id: communityId, questionId } = req.params;

      const results = await votesService.getVotingResults(communityId, questionId);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Get voting results error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get voting results'
      });
    }
  }

  /**
   * Get live voting results
   */
  async getLiveResults(req, res) {
    try {
      const { id: communityId, questionId } = req.params;

      const results = await votesService.getLiveResults(communityId, questionId);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Get live results error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found or inactive'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get live results'
      });
    }
  }

  /**
   * Export voting results
   */
  async exportResults(req, res) {
    try {
      const { id: communityId, questionId } = req.params;
      const { format = 'json' } = req.query;

      const results = await votesService.exportResults(communityId, questionId, format);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="voting-results-${questionId}.csv"`);
        return res.send(results);
      }

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Export results error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to export results'
      });
    }
  }

  /**
   * Get voting analytics
   */
  async getVotingAnalytics(req, res) {
    try {
      const { id: communityId, questionId } = req.params;

      const analytics = await votesService.getVotingAnalytics(communityId, questionId);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get voting analytics error:', error);
      
      if (error.message.includes('Question not found')) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get voting analytics'
      });
    }
  }
}

module.exports = new VotesController(); 