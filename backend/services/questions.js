const { VotingQuestion, Community, User, Member } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class QuestionsService {
  /**
   * Create a new voting question
   */
  async createQuestion(communityId, questionData, createdBy) {
    try {
      // Validate community exists and user is a member
      const community = await Community.findByPk(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      // Check if user is a member of the community
      const membership = await Member.findOne({
        where: {
          community_id: communityId,
          user_id: createdBy,
          status: 'active'
        }
      });

      if (!membership) {
        throw new Error('User must be an active member of the community to create questions');
      }

      // Generate on-chain ID
      const onChainId = `question_${uuidv4().replace(/-/g, '')}`;

      // Create the question
      const question = await VotingQuestion.create({
        on_chain_id: onChainId,
        community_id: communityId,
        title: questionData.title,
        description: questionData.description,
        question_type: questionData.question_type || 'single_choice',
        options: questionData.options,
        created_by: createdBy,
        voting_start_at: questionData.voting_start_at,
        voting_end_at: questionData.voting_end_at,
        allow_anonymous_voting: questionData.allow_anonymous_voting || false,
        require_member_approval: questionData.require_member_approval || false,
        min_votes_required: questionData.min_votes_required || 1
      });

      return question;
    } catch (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }
  }

  /**
   * Get all questions for a community with filtering
   */
  async getCommunityQuestions(communityId, filters = {}) {
    try {
      const {
        status = 'all',
        page = 1,
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters;

      const offset = (page - 1) * limit;
      const whereClause = { community_id: communityId };

      // Add status filtering
      if (status !== 'all') {
        const now = new Date();
        switch (status) {
          case 'active':
            whereClause.is_active = true;
            whereClause.voting_start_at = { [Op.lte]: now };
            whereClause.voting_end_at = { [Op.gt]: now };
            break;
          case 'closed':
            whereClause.voting_end_at = { [Op.lte]: now };
            break;
          case 'pending':
            whereClause.voting_start_at = { [Op.gt]: now };
            break;
          case 'inactive':
            whereClause.is_active = false;
            break;
        }
      }

      const { count, rows } = await VotingQuestion.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'wallet_address']
          }
        ],
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        questions: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          total_pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get community questions: ${error.message}`);
    }
  }

  /**
   * Get a specific question by ID
   */
  async getQuestionById(communityId, questionId) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'wallet_address']
          },
          {
            model: Community,
            as: 'community',
            attributes: ['id', 'name', 'description']
          }
        ]
      });

      if (!question) {
        throw new Error('Question not found');
      }

      return question;
    } catch (error) {
      throw new Error(`Failed to get question: ${error.message}`);
    }
  }

  /**
   * Update a question
   */
  async updateQuestion(communityId, questionId, updateData, updatedBy) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Check if user can update the question
      if (question.created_by !== updatedBy) {
        // Check if user is admin or moderator
        const membership = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: updatedBy,
            status: 'active',
            role: { [Op.in]: ['admin', 'moderator'] }
          }
        });

        if (!membership) {
          throw new Error('Only the question creator or community admin/moderator can update questions');
        }
      }

      // Don't allow updates if voting has started
      if (question.voting_start_at && new Date() >= question.voting_start_at) {
        throw new Error('Cannot update question after voting has started');
      }

      // Update the question
      await question.update(updateData);

      return question;
    } catch (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }
  }

  /**
   * Delete a question
   */
  async deleteQuestion(communityId, questionId, deletedBy) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Check if user can delete the question
      if (question.created_by !== deletedBy) {
        // Check if user is admin
        const membership = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: deletedBy,
            status: 'active',
            role: 'admin'
          }
        });

        if (!membership) {
          throw new Error('Only the question creator or community admin can delete questions');
        }
      }

      // Don't allow deletion if voting has started
      if (question.voting_start_at && new Date() >= question.voting_start_at) {
        throw new Error('Cannot delete question after voting has started');
      }

      await question.destroy();
      return { success: true, message: 'Question deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  }

  /**
   * Update question options
   */
  async updateQuestionOptions(communityId, questionId, options, updatedBy) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Check if user can update the question
      if (question.created_by !== updatedBy) {
        const membership = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: updatedBy,
            status: 'active',
            role: { [Op.in]: ['admin', 'moderator'] }
          }
        });

        if (!membership) {
          throw new Error('Only the question creator or community admin/moderator can update question options');
        }
      }

      // Don't allow updates if voting has started
      if (question.voting_start_at && new Date() >= question.voting_start_at) {
        throw new Error('Cannot update question options after voting has started');
      }

      // Validate options
      if (!Array.isArray(options) || options.length < 2) {
        throw new Error('Question must have at least 2 options');
      }

      if (options.length > 10) {
        throw new Error('Question cannot have more than 10 options');
      }

      // Update options
      await question.update({ options });

      return question;
    } catch (error) {
      throw new Error(`Failed to update question options: ${error.message}`);
    }
  }

  /**
   * Update question deadline
   */
  async updateQuestionDeadline(communityId, questionId, deadline, updatedBy) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Check if user can update the question
      if (question.created_by !== updatedBy) {
        const membership = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: updatedBy,
            status: 'active',
            role: { [Op.in]: ['admin', 'moderator'] }
          }
        });

        if (!membership) {
          throw new Error('Only the question creator or community admin/moderator can update question deadline');
        }
      }

      // Validate deadline
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('Invalid deadline date');
      }

      if (deadlineDate <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      // Update deadline
      await question.update({ voting_end_at: deadlineDate });

      return question;
    } catch (error) {
      throw new Error(`Failed to update question deadline: ${error.message}`);
    }
  }

  /**
   * Activate a question
   */
  async activateQuestion(communityId, questionId, activatedBy) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Check if user can activate the question
      if (question.created_by !== activatedBy) {
        const membership = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: activatedBy,
            status: 'active',
            role: { [Op.in]: ['admin', 'moderator'] }
          }
        });

        if (!membership) {
          throw new Error('Only the question creator or community admin/moderator can activate questions');
        }
      }

      // Check if question is ready for activation
      if (!question.voting_start_at) {
        throw new Error('Question must have a start date to be activated');
      }

      if (question.voting_start_at > new Date()) {
        throw new Error('Cannot activate question before its start date');
      }

      if (!question.is_active) {
        await question.update({ is_active: true });
      }

      return question;
    } catch (error) {
      throw new Error(`Failed to activate question: ${error.message}`);
    }
  }

  /**
   * Close a question
   */
  async closeQuestion(communityId, questionId, closedBy) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Check if user can close the question
      if (question.created_by !== closedBy) {
        const membership = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: closedBy,
            status: 'active',
            role: { [Op.in]: ['admin', 'moderator'] }
          }
        });

        if (!membership) {
          throw new Error('Only the question creator or community admin/moderator can close questions');
        }
      }

      // Close the question
      await question.update({ is_active: false });

      return question;
    } catch (error) {
      throw new Error(`Failed to close question: ${error.message}`);
    }
  }

  /**
   * Get question status
   */
  async getQuestionStatus(communityId, questionId) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        throw new Error('Question not found');
      }

      const now = new Date();
      let status = 'draft';

      if (question.is_active) {
        if (question.voting_start_at && now >= question.voting_start_at) {
          if (question.voting_end_at && now >= question.voting_end_at) {
            status = 'closed';
          } else {
            status = 'active';
          }
        } else {
          status = 'pending';
        }
      } else {
        status = 'inactive';
      }

      return {
        question_id: question.id,
        status,
        voting_start_at: question.voting_start_at,
        voting_end_at: question.voting_end_at,
        is_active: question.is_active,
        total_votes: question.total_votes
      };
    } catch (error) {
      throw new Error(`Failed to get question status: ${error.message}`);
    }
  }

  /**
   * Get questions by status
   */
  async getQuestionsByStatus(communityId, status) {
    try {
      const now = new Date();
      const whereClause = { community_id: communityId };

      switch (status) {
        case 'active':
          whereClause.is_active = true;
          whereClause.voting_start_at = { [Op.lte]: now };
          whereClause.voting_end_at = { [Op.gt]: now };
          break;
        case 'closed':
          whereClause.voting_end_at = { [Op.lte]: now };
          break;
        case 'pending':
          whereClause.voting_start_at = { [Op.gt]: now };
          break;
        case 'inactive':
          whereClause.is_active = false;
          break;
        default:
          throw new Error('Invalid status filter');
      }

      const questions = await VotingQuestion.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'wallet_address']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return questions;
    } catch (error) {
      throw new Error(`Failed to get questions by status: ${error.message}`);
    }
  }
}

module.exports = new QuestionsService(); 