const { Vote, VotingQuestion, User, Community, Member } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class VotesService {
  /**
   * Cast a vote on a question
   */
  async castVote(communityId, questionId, voteData, userId) {
    try {
      // Validate question exists and is active
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId,
          is_active: true
        }
      });

      if (!question) {
        throw new Error('Question not found or inactive');
      }

      // Check if voting period is active
      const now = new Date();
      if (question.voting_start_at && now < question.voting_start_at) {
        throw new Error('Voting has not started yet');
      }

      if (question.voting_end_at && now > question.voting_end_at) {
        throw new Error('Voting period has ended');
      }

      // Check if user is eligible to vote
      const eligibility = await this.checkVoteEligibility(communityId, questionId, userId);
      if (!eligibility.canVote) {
        throw new Error(eligibility.reason);
      }

      // Check if user has already voted
      const existingVote = await Vote.findOne({
        where: {
          question_id: questionId,
          user_id: userId
        }
      });

      if (existingVote) {
        throw new Error('User has already voted on this question');
      }

      // Validate vote options
      await this.validateVoteOptions(question, voteData.selected_options);

      // Create the vote
      const vote = await Vote.create({
        question_id: questionId,
        user_id: userId,
        selected_options: voteData.selected_options,
        is_anonymous: voteData.is_anonymous || question.allow_anonymous_voting,
        transaction_signature: voteData.transaction_signature || null
      });

      // Update question vote count
      await question.increment('total_votes');

      return vote;
    } catch (error) {
      throw new Error(`Failed to cast vote: ${error.message}`);
    }
  }

  /**
   * Get user's vote on a question
   */
  async getUserVote(communityId, questionId, userId) {
    try {
      const vote = await Vote.findOne({
        where: {
          question_id: questionId,
          user_id: userId
        },
        include: [
          {
            model: VotingQuestion,
            as: 'VotingQuestion',
            where: { community_id: communityId },
            attributes: ['id', 'title', 'question_type']
          }
        ]
      });

      return vote;
    } catch (error) {
      throw new Error(`Failed to get user vote: ${error.message}`);
    }
  }

  /**
   * Update user's vote
   */
  async updateVote(communityId, questionId, voteData, userId) {
    try {
      // Check if voting period is still active
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId,
          is_active: true
        }
      });

      if (!question) {
        throw new Error('Question not found or inactive');
      }

      const now = new Date();
      if (question.voting_end_at && now > question.voting_end_at) {
        throw new Error('Cannot update vote after voting period has ended');
      }

      // Find existing vote
      const existingVote = await Vote.findOne({
        where: {
          question_id: questionId,
          user_id: userId
        }
      });

      if (!existingVote) {
        throw new Error('No vote found to update');
      }

      // Validate new vote options
      await this.validateVoteOptions(question, voteData.selected_options);

      // Update the vote
      await existingVote.update({
        selected_options: voteData.selected_options,
        is_anonymous: voteData.is_anonymous || question.allow_anonymous_voting,
        transaction_signature: voteData.transaction_signature || existingVote.transaction_signature
      });

      return existingVote;
    } catch (error) {
      throw new Error(`Failed to update vote: ${error.message}`);
    }
  }

  /**
   * Cancel user's vote
   */
  async cancelVote(communityId, questionId, userId) {
    try {
      // Check if voting period is still active
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId,
          is_active: true
        }
      });

      if (!question) {
        throw new Error('Question not found or inactive');
      }

      const now = new Date();
      if (question.voting_end_at && now > question.voting_end_at) {
        throw new Error('Cannot cancel vote after voting period has ended');
      }

      // Find and delete the vote
      const vote = await Vote.findOne({
        where: {
          question_id: questionId,
          user_id: userId
        }
      });

      if (!vote) {
        throw new Error('No vote found to cancel');
      }

      await vote.destroy();

      // Update question vote count
      await question.decrement('total_votes');

      return { success: true, message: 'Vote cancelled successfully' };
    } catch (error) {
      throw new Error(`Failed to cancel vote: ${error.message}`);
    }
  }

  /**
   * Check vote eligibility
   */
  async checkVoteEligibility(communityId, questionId, userId) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId
        }
      });

      if (!question) {
        return { canVote: false, reason: 'Question not found' };
      }

      // Check if user is a member of the community
      const membership = await Member.findOne({
        where: {
          community_id: communityId,
          user_id: userId,
          status: 'active'
        }
      });

      if (!membership) {
        return { canVote: false, reason: 'User is not an active member of the community' };
      }

      // Check if voting period is active
      const now = new Date();
      if (question.voting_start_at && now < question.voting_start_at) {
        return { canVote: false, reason: 'Voting has not started yet' };
      }

      if (question.voting_end_at && now > question.voting_end_at) {
        return { canVote: false, reason: 'Voting period has ended' };
      }

      // Check if user has already voted
      const existingVote = await Vote.findOne({
        where: {
          question_id: questionId,
          user_id: userId
        }
      });

      if (existingVote) {
        return { canVote: false, reason: 'User has already voted on this question' };
      }

      return { canVote: true, reason: 'User is eligible to vote' };
    } catch (error) {
      throw new Error(`Failed to check vote eligibility: ${error.message}`);
    }
  }

  /**
   * Get voting status
   */
  async getVotingStatus(communityId, questionId, userId) {
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
      let status = 'inactive';

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
      }

      // Check if user has voted
      const userVote = await Vote.findOne({
        where: {
          question_id: questionId,
          user_id: userId
        }
      });

      const eligibility = await this.checkVoteEligibility(communityId, questionId, userId);

      return {
        question_id: questionId,
        status,
        voting_start_at: question.voting_start_at,
        voting_end_at: question.voting_end_at,
        total_votes: question.total_votes,
        user_has_voted: !!userVote,
        can_vote: eligibility.canVote,
        reason: eligibility.reason
      };
    } catch (error) {
      throw new Error(`Failed to get voting status: ${error.message}`);
    }
  }

  /**
   * Get voting results
   */
  async getVotingResults(communityId, questionId) {
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

      // Get all votes for the question
      const votes = await Vote.findAll({
        where: {
          question_id: questionId
        },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'wallet_address']
          }
        ]
      });

      // Calculate results
      const results = this.calculateResults(question, votes);

      return {
        question_id: questionId,
        question_title: question.title,
        question_type: question.question_type,
        total_votes: votes.length,
        results,
        voting_start_at: question.voting_start_at,
        voting_end_at: question.voting_end_at,
        is_active: question.is_active
      };
    } catch (error) {
      throw new Error(`Failed to get voting results: ${error.message}`);
    }
  }

  /**
   * Get live voting results (for active questions)
   */
  async getLiveResults(communityId, questionId) {
    try {
      const question = await VotingQuestion.findOne({
        where: {
          id: questionId,
          community_id: communityId,
          is_active: true
        }
      });

      if (!question) {
        throw new Error('Question not found or inactive');
      }

      // Get votes (excluding anonymous votes for live results)
      const votes = await Vote.findAll({
        where: {
          question_id: questionId,
          is_anonymous: false
        }
      });

      // Calculate live results
      const results = this.calculateResults(question, votes);

      return {
        question_id: questionId,
        question_title: question.title,
        total_votes: votes.length,
        results,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get live results: ${error.message}`);
    }
  }

  /**
   * Export voting results
   */
  async exportResults(communityId, questionId, format = 'json') {
    try {
      const results = await this.getVotingResults(communityId, questionId);
      
      if (format === 'csv') {
        return this.formatResultsAsCSV(results);
      }
      
      return results;
    } catch (error) {
      throw new Error(`Failed to export results: ${error.message}`);
    }
  }

  /**
   * Get voting analytics
   */
  async getVotingAnalytics(communityId, questionId) {
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

      const votes = await Vote.findAll({
        where: {
          question_id: questionId
        },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'wallet_address']
          }
        ]
      });

      const analytics = this.calculateAnalytics(question, votes);

      return {
        question_id: questionId,
        question_title: question.title,
        analytics
      };
    } catch (error) {
      throw new Error(`Failed to get voting analytics: ${error.message}`);
    }
  }

  /**
   * Validate vote options against question configuration
   */
  async validateVoteOptions(question, selectedOptions) {
    if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
      throw new Error('At least one option must be selected');
    }

    // Check if all selected options exist in the question
    const validOptions = question.options;
    for (const selectedOption of selectedOptions) {
      if (!validOptions.includes(selectedOption)) {
        throw new Error(`Invalid option selected: ${selectedOption}`);
      }
    }

    // Validate based on question type
    switch (question.question_type) {
      case 'single_choice':
        if (selectedOptions.length > 1) {
          throw new Error('Single choice questions allow only one option');
        }
        break;
      case 'multiple_choice':
        if (selectedOptions.length > validOptions.length) {
          throw new Error('Cannot select more options than available');
        }
        break;
      case 'ranked_choice':
        if (selectedOptions.length !== validOptions.length) {
          throw new Error('Ranked choice questions require ranking all options');
        }
        // Check for duplicates
        const uniqueOptions = new Set(selectedOptions);
        if (uniqueOptions.size !== selectedOptions.length) {
          throw new Error('Ranked choice options must be unique');
        }
        break;
      default:
        throw new Error('Invalid question type');
    }
  }

  /**
   * Calculate voting results
   */
  calculateResults(question, votes) {
    const results = {};
    const optionCounts = {};

    // Initialize option counts
    question.options.forEach(option => {
      optionCounts[option] = 0;
    });

    // Count votes
    votes.forEach(vote => {
      if (Array.isArray(vote.selected_options)) {
        vote.selected_options.forEach(option => {
          if (optionCounts.hasOwnProperty(option)) {
            optionCounts[option]++;
          }
        });
      }
    });

    // Calculate percentages and format results
    const totalVotes = votes.length;
    question.options.forEach(option => {
      const count = optionCounts[option];
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      
      results[option] = {
        count,
        percentage: Math.round(percentage * 100) / 100
      };
    });

    return results;
  }

  /**
   * Calculate voting analytics
   */
  calculateAnalytics(question, votes) {
    const totalVotes = votes.length;
    const anonymousVotes = votes.filter(vote => vote.is_anonymous).length;
    const publicVotes = totalVotes - anonymousVotes;

    // Calculate participation rate (if we have member count)
    const participationRate = 0; // Would need member count to calculate

    // Calculate voting timeline
    const voteTimeline = votes.reduce((timeline, vote) => {
      const date = vote.voted_at.toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
      return timeline;
    }, {});

    return {
      total_votes: totalVotes,
      anonymous_votes: anonymousVotes,
      public_votes: publicVotes,
      participation_rate: participationRate,
      vote_timeline: voteTimeline,
      average_votes_per_option: totalVotes / question.options.length
    };
  }

  /**
   * Format results as CSV
   */
  formatResultsAsCSV(results) {
    const csvRows = [
      ['Option', 'Count', 'Percentage'],
      ...Object.entries(results.results).map(([option, data]) => [
        option,
        data.count,
        `${data.percentage}%`
      ])
    ];

    return csvRows.map(row => row.join(',')).join('\n');
  }
}

module.exports = new VotesService(); 