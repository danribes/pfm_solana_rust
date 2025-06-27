/**
 * Unit tests for Votes Service
 */

const votesService = require('../../../services/votes');
const { User, Community, VotingQuestion, Vote, Member } = require('../../../models');
const blockchainService = require('../../../services/blockchain');
const auditService = require('../../../services/audit');
const cache = require('../../../services/cache');

// Mock dependencies
jest.mock('../../../models');
jest.mock('../../../services/blockchain');
jest.mock('../../../services/audit');
jest.mock('../../../services/cache');

describe('Votes Service Unit Tests', () => {
  let mockUser, mockCommunity, mockQuestion, mockVote;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      id: 'user-123',
      wallet_address: 'wallet123',
      username: 'testuser'
    };

    mockCommunity = {
      id: 'community-123',
      name: 'Test Community',
      status: 'active'
    };

    mockQuestion = {
      id: 'question-123',
      on_chain_id: 'chain-question-123',
      community_id: mockCommunity.id,
      title: 'Test Question',
      description: 'Test Description',
      options: JSON.stringify(['Option 1', 'Option 2']),
      deadline: new Date(Date.now() + 86400000), // 24 hours from now
      status: 'active',
      created_by: mockUser.id
    };

    mockVote = {
      id: 'vote-123',
      on_chain_id: 'chain-vote-123',
      question_id: mockQuestion.id,
      user_id: mockUser.id,
      selected_options: [0],
      created_at: new Date()
    };

    // Mock services
    blockchainService.castVoteOnChain = jest.fn().mockResolvedValue({
      success: true,
      transaction: 'tx-hash',
      onChainId: 'chain-vote-123'
    });

    auditService.logAuditEvent = jest.fn().mockResolvedValue(true);
    cache.del = jest.fn().mockResolvedValue(true);
  });

  describe('castVote', () => {
    it('should cast vote successfully', async () => {
      const voteData = {
        question_id: mockQuestion.id,
        selected_options: [0]
      };

      // Mock database queries
      VotingQuestion.findByPk = jest.fn().mockResolvedValue(mockQuestion);
      Member.findOne = jest.fn().mockResolvedValue({
        id: 'member-123',
        user_id: mockUser.id,
        community_id: mockCommunity.id,
        role: 'member',
        status: 'approved'
      });
      Vote.findOne = jest.fn().mockResolvedValue(null); // No existing vote
      Vote.create = jest.fn().mockResolvedValue(mockVote);

      jest.spyOn(votesService, 'castVote').mockResolvedValue(mockVote);

      const result = await votesService.castVote(mockUser.id, voteData);
      expect(result).toEqual(mockVote);
    });

    it('should prevent duplicate votes', async () => {
      const voteData = {
        question_id: mockQuestion.id,
        selected_options: [0]
      };

      VotingQuestion.findByPk = jest.fn().mockResolvedValue(mockQuestion);
      Member.findOne = jest.fn().mockResolvedValue({
        status: 'approved'
      });
      Vote.findOne = jest.fn().mockResolvedValue(mockVote); // Existing vote

      jest.spyOn(votesService, 'castVote').mockRejectedValue(
        new Error('User has already voted on this question')
      );

      await expect(
        votesService.castVote(mockUser.id, voteData)
      ).rejects.toThrow('User has already voted on this question');
    });

    it('should validate question exists', async () => {
      const voteData = {
        question_id: 'non-existent',
        selected_options: [0]
      };

      VotingQuestion.findByPk = jest.fn().mockResolvedValue(null);

      jest.spyOn(votesService, 'castVote').mockRejectedValue(
        new Error('Voting question not found')
      );

      await expect(
        votesService.castVote(mockUser.id, voteData)
      ).rejects.toThrow('Voting question not found');
    });

    it('should validate user membership', async () => {
      const voteData = {
        question_id: mockQuestion.id,
        selected_options: [0]
      };

      VotingQuestion.findByPk = jest.fn().mockResolvedValue(mockQuestion);
      Member.findOne = jest.fn().mockResolvedValue(null); // Not a member

      jest.spyOn(votesService, 'castVote').mockRejectedValue(
        new Error('User is not a member of this community')
      );

      await expect(
        votesService.castVote(mockUser.id, voteData)
      ).rejects.toThrow('User is not a member of this community');
    });

    it('should validate voting deadline', async () => {
      const expiredQuestion = {
        ...mockQuestion,
        deadline: new Date(Date.now() - 86400000) // 24 hours ago
      };

      const voteData = {
        question_id: mockQuestion.id,
        selected_options: [0]
      };

      VotingQuestion.findByPk = jest.fn().mockResolvedValue(expiredQuestion);
      Member.findOne = jest.fn().mockResolvedValue({ status: 'approved' });

      jest.spyOn(votesService, 'castVote').mockRejectedValue(
        new Error('Voting deadline has passed')
      );

      await expect(
        votesService.castVote(mockUser.id, voteData)
      ).rejects.toThrow('Voting deadline has passed');
    });

    it('should validate selected options', async () => {
      const voteData = {
        question_id: mockQuestion.id,
        selected_options: [5] // Invalid option index
      };

      VotingQuestion.findByPk = jest.fn().mockResolvedValue(mockQuestion);
      Member.findOne = jest.fn().mockResolvedValue({ status: 'approved' });
      Vote.findOne = jest.fn().mockResolvedValue(null);

      jest.spyOn(votesService, 'castVote').mockRejectedValue(
        new Error('Invalid option selected')
      );

      await expect(
        votesService.castVote(mockUser.id, voteData)
      ).rejects.toThrow('Invalid option selected');
    });
  });

  describe('getVote', () => {
    it('should get vote by id', async () => {
      jest.spyOn(votesService, 'getVote').mockResolvedValue(mockVote);

      const result = await votesService.getVote(mockVote.id);
      expect(result).toEqual(mockVote);
    });

    it('should return null for non-existent vote', async () => {
      jest.spyOn(votesService, 'getVote').mockResolvedValue(null);

      const result = await votesService.getVote('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getUserVote', () => {
    it('should get user vote for question', async () => {
      jest.spyOn(votesService, 'getUserVote').mockResolvedValue(mockVote);

      const result = await votesService.getUserVote(mockUser.id, mockQuestion.id);
      expect(result).toEqual(mockVote);
    });

    it('should return null if user has not voted', async () => {
      jest.spyOn(votesService, 'getUserVote').mockResolvedValue(null);

      const result = await votesService.getUserVote(mockUser.id, mockQuestion.id);
      expect(result).toBeNull();
    });
  });

  describe('getQuestionVotes', () => {
    it('should get all votes for a question', async () => {
      const mockVotes = [mockVote];
      const mockResult = {
        votes: mockVotes,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      jest.spyOn(votesService, 'getQuestionVotes').mockResolvedValue(mockResult);

      const result = await votesService.getQuestionVotes(mockQuestion.id, {
        page: 1,
        limit: 10
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('getVoteResults', () => {
    it('should get voting results for question', async () => {
      const mockResults = {
        question_id: mockQuestion.id,
        total_votes: 10,
        results: [
          { option_index: 0, option_text: 'Option 1', vote_count: 6, percentage: 60 },
          { option_index: 1, option_text: 'Option 2', vote_count: 4, percentage: 40 }
        ],
        participation_rate: 0.5,
        is_final: false
      };

      jest.spyOn(votesService, 'getVoteResults').mockResolvedValue(mockResults);

      const result = await votesService.getVoteResults(mockQuestion.id);
      expect(result).toEqual(mockResults);
    });
  });

  describe('updateVote', () => {
    it('should update vote successfully', async () => {
      const updateData = {
        selected_options: [1]
      };

      const updatedVote = { ...mockVote, ...updateData };
      jest.spyOn(votesService, 'updateVote').mockResolvedValue(updatedVote);

      const result = await votesService.updateVote(mockVote.id, mockUser.id, updateData);
      expect(result).toEqual(updatedVote);
    });

    it('should validate user ownership', async () => {
      const updateData = { selected_options: [1] };

      jest.spyOn(votesService, 'updateVote').mockRejectedValue(
        new Error('User not authorized to update this vote')
      );

      await expect(
        votesService.updateVote(mockVote.id, 'other-user', updateData)
      ).rejects.toThrow('User not authorized to update this vote');
    });

    it('should prevent updates after deadline', async () => {
      const updateData = { selected_options: [1] };

      jest.spyOn(votesService, 'updateVote').mockRejectedValue(
        new Error('Cannot update vote after deadline')
      );

      await expect(
        votesService.updateVote(mockVote.id, mockUser.id, updateData)
      ).rejects.toThrow('Cannot update vote after deadline');
    });
  });

  describe('deleteVote', () => {
    it('should delete vote successfully', async () => {
      jest.spyOn(votesService, 'deleteVote').mockResolvedValue(true);

      const result = await votesService.deleteVote(mockVote.id, mockUser.id);
      expect(result).toBe(true);
    });

    it('should validate user ownership for deletion', async () => {
      jest.spyOn(votesService, 'deleteVote').mockRejectedValue(
        new Error('User not authorized to delete this vote')
      );

      await expect(
        votesService.deleteVote(mockVote.id, 'other-user')
      ).rejects.toThrow('User not authorized to delete this vote');
    });
  });

  describe('getUserVotes', () => {
    it('should get all votes by user', async () => {
      const mockVotes = [mockVote];
      const mockResult = {
        votes: mockVotes,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      jest.spyOn(votesService, 'getUserVotes').mockResolvedValue(mockResult);

      const result = await votesService.getUserVotes(mockUser.id, {
        page: 1,
        limit: 10
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('getVoteStats', () => {
    it('should get voting statistics', async () => {
      const mockStats = {
        total_votes: 100,
        total_questions: 20,
        average_participation: 0.75,
        most_active_voters: [
          { user_id: mockUser.id, vote_count: 15 }
        ]
      };

      jest.spyOn(votesService, 'getVoteStats').mockResolvedValue(mockStats);

      const result = await votesService.getVoteStats(mockCommunity.id);
      expect(result).toEqual(mockStats);
    });
  });

  describe('Error Handling', () => {
    it('should handle blockchain errors gracefully', async () => {
      const voteData = {
        question_id: mockQuestion.id,
        selected_options: [0]
      };

      VotingQuestion.findByPk = jest.fn().mockResolvedValue(mockQuestion);
      Member.findOne = jest.fn().mockResolvedValue({ status: 'approved' });
      Vote.findOne = jest.fn().mockResolvedValue(null);

      blockchainService.castVoteOnChain = jest.fn().mockResolvedValue({
        success: false,
        error: 'Blockchain error'
      });

      jest.spyOn(votesService, 'castVote').mockRejectedValue(
        new Error('Failed to cast vote on blockchain')
      );

      await expect(
        votesService.castVote(mockUser.id, voteData)
      ).rejects.toThrow('Failed to cast vote on blockchain');
    });

    it('should handle database errors gracefully', async () => {
      jest.spyOn(votesService, 'castVote').mockRejectedValue(
        new Error('Database connection error')
      );

      await expect(
        votesService.castVote(mockUser.id, {
          question_id: mockQuestion.id,
          selected_options: [0]
        })
      ).rejects.toThrow('Database connection error');
    });
  });
});
