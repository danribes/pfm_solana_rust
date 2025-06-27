const eventProcessor = require('../../sync/events');
const { User, Community, Member, VotingQuestion, Vote } = require('../../models');
const blockchainService = require('../../services/blockchain');
const auditService = require('../../services/audit');

// Mock dependencies
jest.mock('../../services/blockchain');
jest.mock('../../services/audit');
jest.mock('../../redis');

describe('Event Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock database models
    User.findOne = jest.fn();
    User.create = jest.fn();
    Community.findOne = jest.fn();
    Community.create = jest.fn();
    Member.findOne = jest.fn();
    Member.create = jest.fn();
    VotingQuestion.findOne = jest.fn();
    VotingQuestion.create = jest.fn();
    Vote.findOne = jest.fn();
    Vote.create = jest.fn();
    
    // Mock audit service
    auditService.logAuditEvent = jest.fn().mockResolvedValue(true);
  });

  describe('processEvent', () => {
    it('should process community created event successfully', async () => {
      const eventData = {
        eventType: 'CommunityCreated',
        data: {
          communityId: 'test-community-123',
          name: 'Test Community',
          description: 'A test community',
          creator: 'test-wallet-address',
          config: { maxMembers: 100 }
        },
        network: 'devnet',
        transactionId: 'tx-123',
        blockNumber: 12345
      };

      // Mock user creation
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1, wallet_address: 'test-wallet-address' });

      // Mock community creation
      Community.findOne.mockResolvedValue(null);
      Community.create.mockResolvedValue({ id: 1, on_chain_id: 'test-community-123' });

      // Mock membership creation
      Member.create.mockResolvedValue({ id: 1 });

      await eventProcessor.processEvent(eventData);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { wallet_address: 'test-wallet-address' }
      });
      expect(User.create).toHaveBeenCalledWith({
        wallet_address: 'test-wallet-address',
        username: expect.any(String),
        status: 'active'
      });
      expect(Community.findOne).toHaveBeenCalledWith({
        where: { on_chain_id: 'test-community-123' }
      });
      expect(Community.create).toHaveBeenCalledWith({
        on_chain_id: 'test-community-123',
        name: 'Test Community',
        description: 'A test community',
        created_by: 1,
        config: JSON.stringify({ maxMembers: 100 }),
        network: 'devnet',
        transaction_id: 'tx-123',
        block_number: 12345,
        status: 'active'
      });
      expect(Member.create).toHaveBeenCalledWith({
        community_id: 1,
        user_id: 1,
        role: 'admin',
        status: 'active',
        joined_at: expect.any(Date),
        network: 'devnet',
        transaction_id: 'tx-123'
      });
    });

    it('should handle existing community gracefully', async () => {
      const eventData = {
        eventType: 'CommunityCreated',
        data: {
          communityId: 'existing-community-123',
          name: 'Existing Community',
          description: 'An existing community',
          creator: 'test-wallet-address',
          config: { maxMembers: 100 }
        },
        network: 'devnet',
        transactionId: 'tx-123',
        blockNumber: 12345
      };

      // Mock existing community
      Community.findOne.mockResolvedValue({ id: 1, on_chain_id: 'existing-community-123' });

      await eventProcessor.processEvent(eventData);

      expect(Community.findOne).toHaveBeenCalledWith({
        where: { on_chain_id: 'existing-community-123' }
      });
      expect(Community.create).not.toHaveBeenCalled();
    });

    it('should process member joined event successfully', async () => {
      const eventData = {
        eventType: 'MemberJoined',
        data: {
          communityId: 'test-community-123',
          memberAddress: 'new-member-address',
          role: 'member'
        },
        network: 'devnet',
        transactionId: 'tx-456',
        blockNumber: 12346
      };

      // Mock community
      Community.findOne.mockResolvedValue({ id: 1, on_chain_id: 'test-community-123' });

      // Mock user
      User.findOne.mockResolvedValue({ id: 2, wallet_address: 'new-member-address' });

      // Mock no existing membership
      Member.findOne.mockResolvedValue(null);
      Member.create.mockResolvedValue({ id: 1 });

      await eventProcessor.processEvent(eventData);

      expect(Community.findOne).toHaveBeenCalledWith({
        where: { on_chain_id: 'test-community-123' }
      });
      expect(User.findOne).toHaveBeenCalledWith({
        where: { wallet_address: 'new-member-address' }
      });
      expect(Member.findOne).toHaveBeenCalledWith({
        where: {
          community_id: 1,
          user_id: 2
        }
      });
      expect(Member.create).toHaveBeenCalledWith({
        community_id: 1,
        user_id: 2,
        role: 'member',
        status: 'active',
        joined_at: expect.any(Date),
        network: 'devnet',
        transaction_id: 'tx-456'
      });
    });

    it('should update existing membership when member rejoins', async () => {
      const eventData = {
        eventType: 'MemberJoined',
        data: {
          communityId: 'test-community-123',
          memberAddress: 'existing-member-address',
          role: 'admin'
        },
        network: 'devnet',
        transactionId: 'tx-456',
        blockNumber: 12346
      };

      // Mock community
      Community.findOne.mockResolvedValue({ id: 1, on_chain_id: 'test-community-123' });

      // Mock user
      User.findOne.mockResolvedValue({ id: 2, wallet_address: 'existing-member-address' });

      // Mock existing membership
      const existingMembership = {
        id: 1,
        role: 'member',
        update: jest.fn().mockResolvedValue(true)
      };
      Member.findOne.mockResolvedValue(existingMembership);

      await eventProcessor.processEvent(eventData);

      expect(existingMembership.update).toHaveBeenCalledWith({
        role: 'admin',
        status: 'active',
        updated_at: expect.any(Date),
        network: 'devnet',
        transaction_id: 'tx-456'
      });
    });

    it('should process voting question created event successfully', async () => {
      const eventData = {
        eventType: 'VotingQuestionCreated',
        data: {
          questionId: 'test-question-123',
          communityId: 'test-community-123',
          title: 'Test Question',
          description: 'A test voting question',
          options: ['Option 1', 'Option 2'],
          deadline: '2024-12-31T23:59:59Z',
          creator: 'test-wallet-address'
        },
        network: 'devnet',
        transactionId: 'tx-789',
        blockNumber: 12347
      };

      // Mock community
      Community.findOne.mockResolvedValue({ id: 1, on_chain_id: 'test-community-123' });

      // Mock user
      User.findOne.mockResolvedValue({ id: 1, wallet_address: 'test-wallet-address' });

      // Mock question creation
      VotingQuestion.create.mockResolvedValue({ id: 1, on_chain_id: 'test-question-123' });

      await eventProcessor.processEvent(eventData);

      expect(Community.findOne).toHaveBeenCalledWith({
        where: { on_chain_id: 'test-community-123' }
      });
      expect(User.findOne).toHaveBeenCalledWith({
        where: { wallet_address: 'test-wallet-address' }
      });
      expect(VotingQuestion.create).toHaveBeenCalledWith({
        on_chain_id: 'test-question-123',
        community_id: 1,
        title: 'Test Question',
        description: 'A test voting question',
        options: JSON.stringify(['Option 1', 'Option 2']),
        deadline: new Date('2024-12-31T23:59:59Z'),
        created_by: 1,
        status: 'active',
        network: 'devnet',
        transaction_id: 'tx-789',
        block_number: 12347
      });
    });

    it('should process vote cast event successfully', async () => {
      const eventData = {
        eventType: 'VoteCast',
        data: {
          questionId: 'test-question-123',
          voterAddress: 'voter-address',
          voteData: { selectedOption: 0 },
          signature: 'vote-signature-123'
        },
        network: 'devnet',
        transactionId: 'tx-999',
        blockNumber: 12348
      };

      // Mock question
      VotingQuestion.findOne.mockResolvedValue({ id: 1, on_chain_id: 'test-question-123' });

      // Mock user
      User.findOne.mockResolvedValue({ id: 3, wallet_address: 'voter-address' });

      // Mock no existing vote
      Vote.findOne.mockResolvedValue(null);
      Vote.create.mockResolvedValue({ id: 1 });

      await eventProcessor.processEvent(eventData);

      expect(VotingQuestion.findOne).toHaveBeenCalledWith({
        where: { on_chain_id: 'test-question-123' }
      });
      expect(User.findOne).toHaveBeenCalledWith({
        where: { wallet_address: 'voter-address' }
      });
      expect(Vote.findOne).toHaveBeenCalledWith({
        where: {
          question_id: 1,
          user_id: 3
        }
      });
      expect(Vote.create).toHaveBeenCalledWith({
        question_id: 1,
        user_id: 3,
        vote_data: JSON.stringify({ selectedOption: 0 }),
        signature: 'vote-signature-123',
        network: 'devnet',
        transaction_id: 'tx-999'
      });
    });

    it('should update existing vote when user votes again', async () => {
      const eventData = {
        eventType: 'VoteCast',
        data: {
          questionId: 'test-question-123',
          voterAddress: 'voter-address',
          voteData: { selectedOption: 1 },
          signature: 'new-vote-signature-456'
        },
        network: 'devnet',
        transactionId: 'tx-999',
        blockNumber: 12348
      };

      // Mock question
      VotingQuestion.findOne.mockResolvedValue({ id: 1, on_chain_id: 'test-question-123' });

      // Mock user
      User.findOne.mockResolvedValue({ id: 3, wallet_address: 'voter-address' });

      // Mock existing vote
      const existingVote = {
        id: 1,
        vote_data: JSON.stringify({ selectedOption: 0 }),
        update: jest.fn().mockResolvedValue(true)
      };
      Vote.findOne.mockResolvedValue(existingVote);

      await eventProcessor.processEvent(eventData);

      expect(existingVote.update).toHaveBeenCalledWith({
        vote_data: JSON.stringify({ selectedOption: 1 }),
        signature: 'new-vote-signature-456',
        updated_at: expect.any(Date),
        network: 'devnet',
        transaction_id: 'tx-999'
      });
    });

    it('should handle missing community gracefully', async () => {
      const eventData = {
        eventType: 'MemberJoined',
        data: {
          communityId: 'missing-community-123',
          memberAddress: 'test-wallet-address',
          role: 'member'
        },
        network: 'devnet',
        transactionId: 'tx-456',
        blockNumber: 12346
      };

      // Mock missing community
      Community.findOne.mockResolvedValue(null);

      await eventProcessor.processEvent(eventData);

      expect(Community.findOne).toHaveBeenCalledWith({
        where: { on_chain_id: 'missing-community-123' }
      });
      expect(Member.create).not.toHaveBeenCalled();
    });

    it('should handle missing question gracefully', async () => {
      const eventData = {
        eventType: 'VoteCast',
        data: {
          questionId: 'missing-question-123',
          voterAddress: 'voter-address',
          voteData: { selectedOption: 0 },
          signature: 'vote-signature-123'
        },
        network: 'devnet',
        transactionId: 'tx-999',
        blockNumber: 12348
      };

      // Mock missing question
      VotingQuestion.findOne.mockResolvedValue(null);

      await eventProcessor.processEvent(eventData);

      expect(VotingQuestion.findOne).toHaveBeenCalledWith({
        where: { on_chain_id: 'missing-question-123' }
      });
      expect(Vote.create).not.toHaveBeenCalled();
    });
  });

  describe('findOrCreateUser', () => {
    it('should return existing user', async () => {
      const existingUser = { id: 1, wallet_address: 'test-wallet-address' };
      User.findOne.mockResolvedValue(existingUser);

      const result = await eventProcessor.findOrCreateUser('test-wallet-address');

      expect(result).toEqual(existingUser);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { wallet_address: 'test-wallet-address' }
      });
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should create new user if not exists', async () => {
      User.findOne.mockResolvedValue(null);
      const newUser = { id: 2, wallet_address: 'new-wallet-address' };
      User.create.mockResolvedValue(newUser);

      const result = await eventProcessor.findOrCreateUser('new-wallet-address');

      expect(result).toEqual(newUser);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { wallet_address: 'new-wallet-address' }
      });
      expect(User.create).toHaveBeenCalledWith({
        wallet_address: 'new-wallet-address',
        username: expect.any(String),
        status: 'active'
      });
    });
  });

  describe('getProcessingStatistics', () => {
    it('should return processing statistics', () => {
      const stats = eventProcessor.getProcessingStatistics();

      expect(stats).toHaveProperty('queueLength');
      expect(stats).toHaveProperty('isProcessing');
      expect(stats).toHaveProperty('retryAttempts');
      expect(typeof stats.queueLength).toBe('number');
      expect(typeof stats.isProcessing).toBe('boolean');
      expect(typeof stats.retryAttempts).toBe('object');
    });
  });

  describe('clearQueue', () => {
    it('should clear the processing queue', () => {
      // Add some items to queue
      eventProcessor.processingQueue = [{ id: 1 }, { id: 2 }];
      
      eventProcessor.clearQueue();

      expect(eventProcessor.processingQueue).toEqual([]);
    });
  });
}); 