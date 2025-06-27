const stateReconciler = require('../../sync/reconciliation');
const { User, Community, Member, VotingQuestion, Vote, sequelize } = require('../../models');
const blockchainService = require('../../services/blockchain');
const auditService = require('../../services/audit');

// Mock dependencies
jest.mock('../../services/blockchain');
jest.mock('../../services/audit');
jest.mock('../../redis');

describe('State Reconciler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock database models
    Community.findAll = jest.fn();
    Community.findByPk = jest.fn();
    Community.update = jest.fn();
    Member.findAll = jest.fn();
    Member.findByPk = jest.fn();
    Member.update = jest.fn();
    VotingQuestion.findAll = jest.fn();
    VotingQuestion.findByPk = jest.fn();
    VotingQuestion.update = jest.fn();
    Vote.findAll = jest.fn();
    Vote.findByPk = jest.fn();
    Vote.update = jest.fn();
    User.findAll = jest.fn();
    User.findByPk = jest.fn();
    User.update = jest.fn();
    
    // Mock sequelize transaction
    sequelize.transaction = jest.fn().mockResolvedValue({
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true)
    });
    
    // Mock audit service
    auditService.logAuditEvent = jest.fn().mockResolvedValue(true);
    
    // Mock blockchain service
    blockchainService.getContractManager = jest.fn().mockReturnValue({
      getCommunityData: jest.fn(),
      getMembershipData: jest.fn(),
      getQuestionData: jest.fn(),
      getVoteData: jest.fn()
    });
    
    blockchainService.getSolanaClient = jest.fn().mockReturnValue({
      getConnection: jest.fn().mockReturnValue({
        getAccountInfo: jest.fn()
      })
    });
  });

  describe('detectAndResolveConflicts', () => {
    it('should detect and resolve conflicts successfully', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn(),
        getMembershipData: jest.fn(),
        getQuestionData: jest.fn(),
        getVoteData: jest.fn()
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      // Mock no conflicts
      Community.findAll.mockResolvedValue([]);
      Member.findAll.mockResolvedValue([]);
      VotingQuestion.findAll.mockResolvedValue([]);
      Vote.findAll.mockResolvedValue([]);
      User.findAll.mockResolvedValue([]);
      
      await stateReconciler.detectAndResolveConflicts();
      
      expect(stateReconciler.reconciliationStats.totalReconciliations).toBe(1);
      expect(stateReconciler.reconciliationStats.successfulReconciliations).toBe(1);
      expect(auditService.logAuditEvent).toHaveBeenCalledWith(
        'conflict_reconciliation_completed',
        expect.objectContaining({
          level: 'INFO',
          category: 'RECONCILIATION'
        })
      );
    });

    it('should handle reconciliation errors', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn().mockRejectedValue(new Error('Blockchain error')),
        getMembershipData: jest.fn(),
        getQuestionData: jest.fn(),
        getVoteData: jest.fn()
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      Community.findAll.mockResolvedValue([{ id: 1 }]);
      
      await stateReconciler.detectAndResolveConflicts();
      
      expect(stateReconciler.reconciliationStats.totalReconciliations).toBe(1);
      expect(stateReconciler.reconciliationStats.failedReconciliations).toBe(1);
      expect(auditService.logAuditEvent).toHaveBeenCalledWith(
        'conflict_reconciliation_failed',
        expect.objectContaining({
          level: 'ERROR',
          category: 'RECONCILIATION'
        })
      );
    });
  });

  describe('detectCommunityConflicts', () => {
    it('should detect missing community conflicts', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const communities = [
        {
          id: 1,
          on_chain_id: 'community-123',
          name: 'Test Community',
          description: 'Test description',
          config: JSON.stringify({ maxMembers: 100 }),
          toJSON: () => ({
            id: 1,
            on_chain_id: 'community-123',
            name: 'Test Community',
            description: 'Test description',
            config: JSON.stringify({ maxMembers: 100 })
          })
        }
      ];
      
      Community.findAll.mockResolvedValue(communities);
      
      const conflicts = await stateReconciler.detectCommunityConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'community_conflict',
        entityId: 1,
        onChainId: 'community-123',
        conflictType: 'missing_on_blockchain',
        backendData: expect.any(Object),
        blockchainData: null
      });
    });

    it('should detect data mismatch conflicts', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn().mockResolvedValue({
          name: 'Different Name',
          description: 'Different description',
          config: { maxMembers: 200 }
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const communities = [
        {
          id: 1,
          on_chain_id: 'community-123',
          name: 'Original Name',
          description: 'Original description',
          config: JSON.stringify({ maxMembers: 100 }),
          toJSON: () => ({
            id: 1,
            on_chain_id: 'community-123',
            name: 'Original Name',
            description: 'Original description',
            config: JSON.stringify({ maxMembers: 100 })
          })
        }
      ];
      
      Community.findAll.mockResolvedValue(communities);
      
      const conflicts = await stateReconciler.detectCommunityConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'community_conflict',
        entityId: 1,
        onChainId: 'community-123',
        conflictType: 'data_mismatch',
        backendData: expect.any(Object),
        blockchainData: expect.any(Object)
      });
    });
  });

  describe('detectMembershipConflicts', () => {
    it('should detect missing membership conflicts', async () => {
      const mockContractManager = {
        getMembershipData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const memberships = [
        {
          id: 1,
          toJSON: () => ({ id: 1 }),
          Community: { on_chain_id: 'community-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Member.findAll.mockResolvedValue(memberships);
      
      const conflicts = await stateReconciler.detectMembershipConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'membership_conflict',
        entityId: 1,
        communityId: 'community-123',
        userAddress: 'user-address',
        conflictType: 'missing_on_blockchain',
        backendData: expect.any(Object),
        blockchainData: null
      });
    });

    it('should detect membership data mismatch conflicts', async () => {
      const mockContractManager = {
        getMembershipData: jest.fn().mockResolvedValue({
          role: 'admin',
          status: 'inactive'
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const memberships = [
        {
          id: 1,
          role: 'member',
          status: 'active',
          toJSON: () => ({ id: 1, role: 'member', status: 'active' }),
          Community: { on_chain_id: 'community-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Member.findAll.mockResolvedValue(memberships);
      
      const conflicts = await stateReconciler.detectMembershipConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'membership_conflict',
        entityId: 1,
        communityId: 'community-123',
        userAddress: 'user-address',
        conflictType: 'data_mismatch',
        backendData: expect.any(Object),
        blockchainData: expect.any(Object)
      });
    });
  });

  describe('detectQuestionConflicts', () => {
    it('should detect missing question conflicts', async () => {
      const mockContractManager = {
        getQuestionData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const questions = [
        {
          id: 1,
          on_chain_id: 'question-123',
          toJSON: () => ({ id: 1, on_chain_id: 'question-123' }),
          Community: { on_chain_id: 'community-123' }
        }
      ];
      
      VotingQuestion.findAll.mockResolvedValue(questions);
      
      const conflicts = await stateReconciler.detectQuestionConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'question_conflict',
        entityId: 1,
        onChainId: 'question-123',
        conflictType: 'missing_on_blockchain',
        backendData: expect.any(Object),
        blockchainData: null
      });
    });

    it('should detect question data mismatch conflicts', async () => {
      const mockContractManager = {
        getQuestionData: jest.fn().mockResolvedValue({
          title: 'Different Title',
          description: 'Different description',
          options: ['Option A', 'Option B'],
          deadline: '2024-12-31T23:59:59Z',
          status: 'inactive'
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const questions = [
        {
          id: 1,
          on_chain_id: 'question-123',
          title: 'Original Title',
          description: 'Original description',
          options: JSON.stringify(['Original Option']),
          deadline: new Date('2024-01-01'),
          status: 'active',
          toJSON: () => ({
            id: 1,
            on_chain_id: 'question-123',
            title: 'Original Title',
            description: 'Original description',
            options: JSON.stringify(['Original Option']),
            deadline: new Date('2024-01-01'),
            status: 'active'
          }),
          Community: { on_chain_id: 'community-123' }
        }
      ];
      
      VotingQuestion.findAll.mockResolvedValue(questions);
      
      const conflicts = await stateReconciler.detectQuestionConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'question_conflict',
        entityId: 1,
        onChainId: 'question-123',
        conflictType: 'data_mismatch',
        backendData: expect.any(Object),
        blockchainData: expect.any(Object)
      });
    });
  });

  describe('detectVoteConflicts', () => {
    it('should detect missing vote conflicts', async () => {
      const mockContractManager = {
        getVoteData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const votes = [
        {
          id: 1,
          toJSON: () => ({ id: 1 }),
          VotingQuestion: { on_chain_id: 'question-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Vote.findAll.mockResolvedValue(votes);
      
      const conflicts = await stateReconciler.detectVoteConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'vote_conflict',
        entityId: 1,
        questionId: 'question-123',
        userAddress: 'user-address',
        conflictType: 'missing_on_blockchain',
        backendData: expect.any(Object),
        blockchainData: null
      });
    });

    it('should detect vote data mismatch conflicts', async () => {
      const mockContractManager = {
        getVoteData: jest.fn().mockResolvedValue({
          voteData: { selectedOption: 1 },
          signature: 'different-signature'
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const votes = [
        {
          id: 1,
          vote_data: JSON.stringify({ selectedOption: 0 }),
          signature: 'original-signature',
          toJSON: () => ({
            id: 1,
            vote_data: JSON.stringify({ selectedOption: 0 }),
            signature: 'original-signature'
          }),
          VotingQuestion: { on_chain_id: 'question-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Vote.findAll.mockResolvedValue(votes);
      
      const conflicts = await stateReconciler.detectVoteConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'vote_conflict',
        entityId: 1,
        questionId: 'question-123',
        userAddress: 'user-address',
        conflictType: 'data_mismatch',
        backendData: expect.any(Object),
        blockchainData: expect.any(Object)
      });
    });
  });

  describe('detectUserConflicts', () => {
    it('should detect missing user conflicts', async () => {
      const mockConnection = {
        getAccountInfo: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getSolanaClient.mockReturnValue({
        getConnection: jest.fn().mockReturnValue(mockConnection)
      });
      
      const users = [
        {
          id: 1,
          wallet_address: 'invalid-address',
          toJSON: () => ({ id: 1, wallet_address: 'invalid-address' })
        }
      ];
      
      User.findAll.mockResolvedValue(users);
      
      const conflicts = await stateReconciler.detectUserConflicts();
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toEqual({
        type: 'user_conflict',
        entityId: 1,
        walletAddress: 'invalid-address',
        conflictType: 'missing_on_blockchain',
        backendData: expect.any(Object),
        blockchainData: null
      });
    });
  });

  describe('resolveConflict', () => {
    it('should resolve community conflict', async () => {
      const conflict = {
        type: 'community_conflict',
        entityId: 1,
        onChainId: 'community-123',
        conflictType: 'missing_on_blockchain',
        backendData: {},
        blockchainData: null
      };
      
      const community = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Community.findByPk.mockResolvedValue(community);
      Member.update.mockResolvedValue(true);
      
      await stateReconciler.resolveConflict(conflict);
      
      expect(Community.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(community.update).toHaveBeenCalledWith({
        status: 'inactive'
      }, expect.any(Object));
      expect(Member.update).toHaveBeenCalledWith(
        { status: 'inactive' },
        expect.objectContaining({
          where: { community_id: 1 }
        })
      );
    });

    it('should resolve membership conflict', async () => {
      const conflict = {
        type: 'membership_conflict',
        entityId: 1,
        communityId: 'community-123',
        userAddress: 'user-address',
        conflictType: 'data_mismatch',
        backendData: {},
        blockchainData: {
          role: 'admin',
          status: 'active'
        }
      };
      
      const membership = {
        id: 1,
        update: jest.fn().mockResolvedValue(true)
      };
      
      Member.findByPk.mockResolvedValue(membership);
      
      await stateReconciler.resolveConflict(conflict);
      
      expect(Member.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(membership.update).toHaveBeenCalledWith({
        role: 'admin',
        status: 'active',
        updated_at: expect.any(Date)
      }, expect.any(Object));
    });

    it('should handle missing entity gracefully', async () => {
      const conflict = {
        type: 'community_conflict',
        entityId: 999,
        onChainId: 'community-123',
        conflictType: 'missing_on_blockchain',
        backendData: {},
        blockchainData: null
      };
      
      Community.findByPk.mockResolvedValue(null);
      
      await stateReconciler.resolveConflict(conflict);
      
      expect(Community.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
      expect(sequelize.transaction).toHaveBeenCalled();
    });
  });

  describe('getReconciliationStats', () => {
    it('should return reconciliation statistics', () => {
      const stats = stateReconciler.getReconciliationStats();
      
      expect(stats).toHaveProperty('totalReconciliations');
      expect(stats).toHaveProperty('successfulReconciliations');
      expect(stats).toHaveProperty('failedReconciliations');
      expect(stats).toHaveProperty('conflictsResolved');
      expect(stats).toHaveProperty('dataRepairs');
    });
  });

  describe('forceReconciliation', () => {
    it('should force reconciliation', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn(),
        getMembershipData: jest.fn(),
        getQuestionData: jest.fn(),
        getVoteData: jest.fn()
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      Community.findAll.mockResolvedValue([]);
      Member.findAll.mockResolvedValue([]);
      VotingQuestion.findAll.mockResolvedValue([]);
      Vote.findAll.mockResolvedValue([]);
      User.findAll.mockResolvedValue([]);
      
      await stateReconciler.forceReconciliation();
      
      expect(stateReconciler.reconciliationStats.totalReconciliations).toBe(1);
    });
  });

  describe('getConflictSummary', () => {
    it('should return conflict summary', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn().mockResolvedValue(null),
        getMembershipData: jest.fn().mockResolvedValue(null),
        getQuestionData: jest.fn().mockResolvedValue(null),
        getVoteData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const mockConnection = {
        getAccountInfo: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getSolanaClient.mockReturnValue({
        getConnection: jest.fn().mockReturnValue(mockConnection)
      });
      
      // Mock conflicts
      Community.findAll.mockResolvedValue([{ id: 1 }]);
      Member.findAll.mockResolvedValue([{ id: 1 }]);
      VotingQuestion.findAll.mockResolvedValue([{ id: 1 }]);
      Vote.findAll.mockResolvedValue([{ id: 1 }]);
      User.findAll.mockResolvedValue([{ id: 1 }]);
      
      const summary = await stateReconciler.getConflictSummary();
      
      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('byType');
      expect(summary).toHaveProperty('byConflictType');
      expect(summary).toHaveProperty('timestamp');
      
      expect(summary.total).toBe(5); // One conflict of each type
      expect(summary.byType.community).toBe(1);
      expect(summary.byType.membership).toBe(1);
      expect(summary.byType.question).toBe(1);
      expect(summary.byType.vote).toBe(1);
      expect(summary.byType.user).toBe(1);
      expect(summary.byConflictType.missing_on_blockchain).toBe(5);
      expect(summary.byConflictType.data_mismatch).toBe(0);
    });
  });
}); 