const stateSynchronizer = require('../../sync/state');
const { User, Community, Member, VotingQuestion, Vote } = require('../../models');
const blockchainService = require('../../services/blockchain');
const auditService = require('../../services/audit');

// Mock dependencies
jest.mock('../../services/blockchain');
jest.mock('../../services/audit');
jest.mock('../../redis');

describe('State Synchronizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock database models
    Community.findAll = jest.fn();
    Community.update = jest.fn();
    Member.findAll = jest.fn();
    Member.update = jest.fn();
    VotingQuestion.findAll = jest.fn();
    VotingQuestion.update = jest.fn();
    Vote.findAll = jest.fn();
    Vote.update = jest.fn();
    User.findAll = jest.fn();
    User.update = jest.fn();
    
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

  describe('startPeriodicSync', () => {
    it('should start periodic synchronization', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn(),
        getMembershipData: jest.fn(),
        getQuestionData: jest.fn(),
        getVoteData: jest.fn()
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      await stateSynchronizer.startPeriodicSync();
      
      expect(stateSynchronizer.isRunning).toBe(true);
      expect(auditService.logAuditEvent).toHaveBeenCalledWith(
        'state_sync_started',
        expect.objectContaining({
          level: 'INFO',
          category: 'SYNC'
        })
      );
    });

    it('should not start if already running', async () => {
      stateSynchronizer.isRunning = true;
      
      await stateSynchronizer.startPeriodicSync();
      
      expect(auditService.logAuditEvent).not.toHaveBeenCalledWith(
        'state_sync_started',
        expect.any(Object)
      );
    });
  });

  describe('stopPeriodicSync', () => {
    it('should stop periodic synchronization', async () => {
      stateSynchronizer.isRunning = true;
      
      await stateSynchronizer.stopPeriodicSync();
      
      expect(stateSynchronizer.isRunning).toBe(false);
      expect(auditService.logAuditEvent).toHaveBeenCalledWith(
        'state_sync_stopped',
        expect.objectContaining({
          level: 'INFO',
          category: 'SYNC'
        })
      );
    });
  });

  describe('performFullSync', () => {
    it('should perform full synchronization successfully', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn(),
        getMembershipData: jest.fn(),
        getQuestionData: jest.fn(),
        getVoteData: jest.fn()
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      await stateSynchronizer.performFullSync();
      
      expect(stateSynchronizer.syncStats.totalSyncs).toBe(1);
      expect(stateSynchronizer.syncStats.successfulSyncs).toBe(1);
      expect(auditService.logAuditEvent).toHaveBeenCalledWith(
        'state_sync_completed',
        expect.objectContaining({
          level: 'INFO',
          category: 'SYNC'
        })
      );
    });

    it('should handle synchronization errors', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn().mockRejectedValue(new Error('Blockchain error')),
        getMembershipData: jest.fn(),
        getQuestionData: jest.fn(),
        getVoteData: jest.fn()
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      await stateSynchronizer.performFullSync();
      
      expect(stateSynchronizer.syncStats.totalSyncs).toBe(1);
      expect(stateSynchronizer.syncStats.failedSyncs).toBe(1);
      expect(auditService.logAuditEvent).toHaveBeenCalledWith(
        'state_sync_failed',
        expect.objectContaining({
          level: 'ERROR',
          category: 'SYNC'
        })
      );
    });
  });

  describe('syncCommunities', () => {
    it('should sync communities successfully', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn().mockResolvedValue({
          name: 'Updated Community',
          description: 'Updated description',
          config: { maxMembers: 200 }
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const communities = [
        {
          id: 1,
          on_chain_id: 'community-123',
          name: 'Old Community',
          description: 'Old description',
          config: JSON.stringify({ maxMembers: 100 }),
          update: jest.fn().mockResolvedValue(true)
        }
      ];
      
      Community.findAll.mockResolvedValue(communities);
      
      await stateSynchronizer.syncCommunities();
      
      expect(Community.findAll).toHaveBeenCalledWith({
        where: { status: 'active' }
      });
      expect(mockContractManager.getCommunityData).toHaveBeenCalledWith('community-123');
      expect(communities[0].update).toHaveBeenCalledWith({
        name: 'Updated Community',
        description: 'Updated description',
        config: JSON.stringify({ maxMembers: 200 }),
        updated_at: expect.any(Date)
      });
    });

    it('should mark community as inactive if not found on blockchain', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const communities = [
        {
          id: 1,
          on_chain_id: 'community-123',
          update: jest.fn().mockResolvedValue(true)
        }
      ];
      
      Community.findAll.mockResolvedValue(communities);
      
      await stateSynchronizer.syncCommunities();
      
      expect(communities[0].update).toHaveBeenCalledWith({
        status: 'inactive'
      });
    });
  });

  describe('syncMemberships', () => {
    it('should sync memberships successfully', async () => {
      const mockContractManager = {
        getMembershipData: jest.fn().mockResolvedValue({
          role: 'admin',
          status: 'active'
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const memberships = [
        {
          id: 1,
          role: 'member',
          status: 'active',
          update: jest.fn().mockResolvedValue(true),
          Community: { on_chain_id: 'community-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Member.findAll.mockResolvedValue(memberships);
      
      await stateSynchronizer.syncMemberships();
      
      expect(Member.findAll).toHaveBeenCalledWith({
        include: [
          { model: Community, as: 'Community' },
          { model: User, as: 'User' }
        ],
        where: { status: 'active' }
      });
      expect(mockContractManager.getMembershipData).toHaveBeenCalledWith(
        'community-123',
        'user-address'
      );
      expect(memberships[0].update).toHaveBeenCalledWith({
        role: 'admin',
        status: 'active',
        updated_at: expect.any(Date)
      });
    });

    it('should mark membership as inactive if not found on blockchain', async () => {
      const mockContractManager = {
        getMembershipData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const memberships = [
        {
          id: 1,
          update: jest.fn().mockResolvedValue(true),
          Community: { on_chain_id: 'community-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Member.findAll.mockResolvedValue(memberships);
      
      await stateSynchronizer.syncMemberships();
      
      expect(memberships[0].update).toHaveBeenCalledWith({
        status: 'inactive'
      });
    });
  });

  describe('syncQuestions', () => {
    it('should sync questions successfully', async () => {
      const mockContractManager = {
        getQuestionData: jest.fn().mockResolvedValue({
          title: 'Updated Question',
          description: 'Updated description',
          options: ['Option A', 'Option B'],
          deadline: '2024-12-31T23:59:59Z',
          status: 'active'
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const questions = [
        {
          id: 1,
          on_chain_id: 'question-123',
          title: 'Old Question',
          description: 'Old description',
          options: JSON.stringify(['Old Option']),
          deadline: new Date('2024-01-01'),
          status: 'active',
          update: jest.fn().mockResolvedValue(true),
          Community: { on_chain_id: 'community-123' }
        }
      ];
      
      VotingQuestion.findAll.mockResolvedValue(questions);
      
      await stateSynchronizer.syncQuestions();
      
      expect(VotingQuestion.findAll).toHaveBeenCalledWith({
        include: [{ model: Community, as: 'Community' }],
        where: { status: 'active' }
      });
      expect(mockContractManager.getQuestionData).toHaveBeenCalledWith('question-123');
      expect(questions[0].update).toHaveBeenCalledWith({
        title: 'Updated Question',
        description: 'Updated description',
        options: JSON.stringify(['Option A', 'Option B']),
        deadline: new Date('2024-12-31T23:59:59Z'),
        status: 'active',
        updated_at: expect.any(Date)
      });
    });

    it('should mark question as inactive if not found on blockchain', async () => {
      const mockContractManager = {
        getQuestionData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const questions = [
        {
          id: 1,
          on_chain_id: 'question-123',
          update: jest.fn().mockResolvedValue(true),
          Community: { on_chain_id: 'community-123' }
        }
      ];
      
      VotingQuestion.findAll.mockResolvedValue(questions);
      
      await stateSynchronizer.syncQuestions();
      
      expect(questions[0].update).toHaveBeenCalledWith({
        status: 'inactive'
      });
    });
  });

  describe('syncVotes', () => {
    it('should sync votes successfully', async () => {
      const mockContractManager = {
        getVoteData: jest.fn().mockResolvedValue({
          voteData: { selectedOption: 1 },
          signature: 'new-signature'
        })
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const votes = [
        {
          id: 1,
          vote_data: JSON.stringify({ selectedOption: 0 }),
          signature: 'old-signature',
          update: jest.fn().mockResolvedValue(true),
          VotingQuestion: { on_chain_id: 'question-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Vote.findAll.mockResolvedValue(votes);
      
      await stateSynchronizer.syncVotes();
      
      expect(Vote.findAll).toHaveBeenCalledWith({
        include: [
          { model: VotingQuestion, as: 'VotingQuestion' },
          { model: User, as: 'User' }
        ]
      });
      expect(mockContractManager.getVoteData).toHaveBeenCalledWith(
        'question-123',
        'user-address'
      );
      expect(votes[0].update).toHaveBeenCalledWith({
        vote_data: JSON.stringify({ selectedOption: 1 }),
        signature: 'new-signature',
        updated_at: expect.any(Date)
      });
    });

    it('should mark vote as inactive if not found on blockchain', async () => {
      const mockContractManager = {
        getVoteData: jest.fn().mockResolvedValue(null)
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      const votes = [
        {
          id: 1,
          update: jest.fn().mockResolvedValue(true),
          VotingQuestion: { on_chain_id: 'question-123' },
          User: { wallet_address: 'user-address' }
        }
      ];
      
      Vote.findAll.mockResolvedValue(votes);
      
      await stateSynchronizer.syncVotes();
      
      expect(votes[0].update).toHaveBeenCalledWith({
        status: 'inactive'
      });
    });
  });

  describe('syncUsers', () => {
    it('should sync users successfully', async () => {
      const mockConnection = {
        getAccountInfo: jest.fn().mockResolvedValue({ lamports: 1000000 })
      };
      
      blockchainService.getSolanaClient.mockReturnValue({
        getConnection: jest.fn().mockReturnValue(mockConnection)
      });
      
      const users = [
        {
          id: 1,
          wallet_address: 'user-address',
          update: jest.fn().mockResolvedValue(true)
        }
      ];
      
      User.findAll.mockResolvedValue(users);
      
      await stateSynchronizer.syncUsers();
      
      expect(User.findAll).toHaveBeenCalledWith({
        where: { status: 'active' }
      });
      expect(mockConnection.getAccountInfo).toHaveBeenCalledWith('user-address');
      expect(users[0].update).not.toHaveBeenCalled(); // Account exists, no update needed
    });

    it('should mark user as inactive if wallet not found on blockchain', async () => {
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
          update: jest.fn().mockResolvedValue(true)
        }
      ];
      
      User.findAll.mockResolvedValue(users);
      
      await stateSynchronizer.syncUsers();
      
      expect(users[0].update).toHaveBeenCalledWith({
        status: 'inactive'
      });
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status', () => {
      const status = stateSynchronizer.getSyncStatus();
      
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastSyncTime');
      expect(status).toHaveProperty('syncStats');
      expect(status).toHaveProperty('syncInterval');
    });
  });

  describe('forceSync', () => {
    it('should force immediate synchronization', async () => {
      const mockContractManager = {
        getCommunityData: jest.fn(),
        getMembershipData: jest.fn(),
        getQuestionData: jest.fn(),
        getVoteData: jest.fn()
      };
      
      blockchainService.getContractManager.mockReturnValue(mockContractManager);
      
      await stateSynchronizer.forceSync();
      
      expect(stateSynchronizer.syncStats.totalSyncs).toBe(1);
    });
  });

  describe('getConsistencyReport', () => {
    it('should return consistency report', async () => {
      Community.count = jest.fn()
        .mockResolvedValueOnce(10) // total communities
        .mockResolvedValueOnce(8); // synced communities
      
      Member.count = jest.fn()
        .mockResolvedValueOnce(50) // total memberships
        .mockResolvedValueOnce(45); // synced memberships
      
      VotingQuestion.count = jest.fn()
        .mockResolvedValueOnce(20) // total questions
        .mockResolvedValueOnce(18); // synced questions
      
      Vote.count = jest.fn()
        .mockResolvedValueOnce(100) // total votes
        .mockResolvedValueOnce(95); // synced votes
      
      const report = await stateSynchronizer.getConsistencyReport();
      
      expect(report).toHaveProperty('communities');
      expect(report).toHaveProperty('memberships');
      expect(report).toHaveProperty('questions');
      expect(report).toHaveProperty('votes');
      expect(report).toHaveProperty('timestamp');
      
      expect(report.communities.total).toBe(10);
      expect(report.communities.synced).toBe(8);
      expect(report.communities.consistency).toBe(80);
    });
  });
}); 