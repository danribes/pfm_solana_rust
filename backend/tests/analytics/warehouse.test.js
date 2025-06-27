/**
 * Tests for Data Warehouse
 */

const dataWarehouse = require('../../analytics/warehouse');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');
const { sequelize } = require('../../models');

// Mock Sequelize
jest.mock('../../models', () => ({
  sequelize: {
    define: jest.fn(),
    sync: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
    QueryTypes: { SELECT: 'SELECT' },
    Op: {
      lte: 'lte',
      gte: 'gte'
    }
  },
  User: {
    findAll: jest.fn(),
    create: jest.fn()
  },
  Community: {
    findAll: jest.fn(),
    create: jest.fn()
  },
  Member: {
    findAll: jest.fn(),
    create: jest.fn()
  },
  VotingQuestion: {
    findAll: jest.fn(),
    create: jest.fn()
  },
  Vote: {
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  },
  Analytics: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn()
  }
}));

describe('Data Warehouse', () => {
  let mockUserAnalytics, mockCommunityAnalytics, mockVotingAnalytics, mockDateDimension;

  beforeAll(() => {
    // Mock table definitions
    mockUserAnalytics = {
      upsert: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn()
    };

    mockCommunityAnalytics = {
      upsert: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn()
    };

    mockVotingAnalytics = {
      upsert: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn()
    };

    mockDateDimension = {
      upsert: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn()
    };

    sequelize.define.mockImplementation((name, attributes, options) => {
      switch (name) {
        case 'UserAnalytics':
          return mockUserAnalytics;
        case 'CommunityAnalytics':
          return mockCommunityAnalytics;
        case 'VotingAnalytics':
          return mockVotingAnalytics;
        case 'DateDimension':
          return mockDateDimension;
        default:
          return {};
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset warehouse tables
    dataWarehouse.warehouseTables.clear();
    dataWarehouse.warehouseTables.set('UserAnalytics', mockUserAnalytics);
    dataWarehouse.warehouseTables.set('CommunityAnalytics', mockCommunityAnalytics);
    dataWarehouse.warehouseTables.set('VotingAnalytics', mockVotingAnalytics);
    dataWarehouse.warehouseTables.set('DateDimension', mockDateDimension);
  });

  describe('Initialization', () => {
    it('should initialize data warehouse', async () => {
      await dataWarehouse.initialize();
      
      expect(sequelize.define).toHaveBeenCalledWith(
        'UserAnalytics',
        expect.objectContaining({
          id: expect.any(Object),
          user_id: expect.any(Object),
          date_key: expect.any(Object)
        }),
        expect.any(Object)
      );
      
      expect(sequelize.sync).toHaveBeenCalledWith({ alter: true });
    });

    it('should handle initialization errors', async () => {
      sequelize.sync.mockRejectedValueOnce(new Error('Sync error'));
      
      await expect(dataWarehouse.initialize()).rejects.toThrow('Sync error');
    });
  });

  describe('ETL Processes', () => {
    it('should run ETL process for specific date', async () => {
      const testDate = new Date('2024-01-01');
      
      // Mock ETL processes
      dataWarehouse.etlProcesses.set('userAnalytics', jest.fn().mockResolvedValue(undefined));
      dataWarehouse.etlProcesses.set('communityAnalytics', jest.fn().mockResolvedValue(undefined));
      dataWarehouse.etlProcesses.set('votingAnalytics', jest.fn().mockResolvedValue(undefined));
      
      await dataWarehouse.runETL(testDate);
      
      expect(dataWarehouse.etlProcesses.get('userAnalytics')).toHaveBeenCalledWith(testDate);
      expect(dataWarehouse.etlProcesses.get('communityAnalytics')).toHaveBeenCalledWith(testDate);
      expect(dataWarehouse.etlProcesses.get('votingAnalytics')).toHaveBeenCalledWith(testDate);
    });

    it('should handle ETL process errors', async () => {
      const testDate = new Date('2024-01-01');
      
      // Mock ETL process that throws error
      dataWarehouse.etlProcesses.set('userAnalytics', jest.fn().mockRejectedValue(new Error('ETL error')));
      
      await expect(dataWarehouse.runETL(testDate)).rejects.toThrow('ETL process failed');
    });
  });

  describe('User Analytics ETL', () => {
    it('should extract user analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockUsers = [
        {
          id: 'user-1',
          Memberships: [{ Community: { id: 'community-1' } }],
          Votes: [{ id: 'vote-1' }],
          Questions: [{ id: 'question-1' }]
        }
      ];
      
      User.findAll.mockResolvedValue(mockUsers);
      
      const result = await dataWarehouse.extractUserAnalytics(testDate);
      
      expect(result).toEqual(mockUsers);
      expect(User.findAll).toHaveBeenCalledWith({
        include: expect.any(Array),
        where: expect.any(Object)
      });
    });

    it('should transform user analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockUsers = [
        {
          id: 'user-1',
          Memberships: [{ Community: { id: 'community-1' } }],
          Votes: [{ id: 'vote-1' }],
          Questions: [{ id: 'question-1' }],
          last_activity: new Date(),
          updated_at: new Date()
        }
      ];
      
      User.findAll.mockResolvedValue(mockUsers);
      
      const result = await dataWarehouse.transformUserAnalytics(testDate);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('user_id', 'user-1');
      expect(result[0]).toHaveProperty('date_key', '2024-01-01');
      expect(result[0]).toHaveProperty('total_communities', 1);
      expect(result[0]).toHaveProperty('total_votes', 1);
      expect(result[0]).toHaveProperty('total_questions', 1);
      expect(result[0]).toHaveProperty('activity_score');
    });

    it('should load user analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockTransformedData = [
        {
          user_id: 'user-1',
          date_key: '2024-01-01',
          total_communities: 1,
          total_votes: 1,
          total_questions: 1,
          activity_score: 50,
          last_activity: new Date()
        }
      ];
      
      User.findAll.mockResolvedValue([]);
      mockUserAnalytics.upsert.mockResolvedValue(undefined);
      
      await dataWarehouse.loadUserAnalytics(testDate);
      
      expect(mockUserAnalytics.upsert).toHaveBeenCalledWith(
        mockTransformedData[0],
        expect.any(Object)
      );
    });
  });

  describe('Community Analytics ETL', () => {
    it('should extract community analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockCommunities = [
        {
          id: 'community-1',
          Members: [{ id: 'member-1' }],
          Questions: [{ id: 'question-1' }]
        }
      ];
      
      Community.findAll.mockResolvedValue(mockCommunities);
      
      const result = await dataWarehouse.extractCommunityAnalytics(testDate);
      
      expect(result).toEqual(mockCommunities);
      expect(Community.findAll).toHaveBeenCalledWith({
        include: expect.any(Array),
        where: expect.any(Object)
      });
    });

    it('should transform community analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockCommunities = [
        {
          id: 'community-1',
          Members: [{ id: 'member-1' }],
          Questions: [{ id: 'question-1' }]
        }
      ];
      
      Community.findAll.mockResolvedValue(mockCommunities);
      Vote.count.mockResolvedValue(5);
      
      const result = await dataWarehouse.transformCommunityAnalytics(testDate);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('community_id', 'community-1');
      expect(result[0]).toHaveProperty('date_key', '2024-01-01');
      expect(result[0]).toHaveProperty('total_members', 1);
      expect(result[0]).toHaveProperty('total_questions', 1);
      expect(result[0]).toHaveProperty('total_votes', 5);
    });

    it('should load community analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockTransformedData = [
        {
          community_id: 'community-1',
          date_key: '2024-01-01',
          total_members: 1,
          total_questions: 1,
          total_votes: 5,
          engagement_rate: 50,
          growth_rate: 10
        }
      ];
      
      Community.findAll.mockResolvedValue([]);
      mockCommunityAnalytics.upsert.mockResolvedValue(undefined);
      
      await dataWarehouse.loadCommunityAnalytics(testDate);
      
      expect(mockCommunityAnalytics.upsert).toHaveBeenCalledWith(
        mockTransformedData[0],
        expect.any(Object)
      );
    });
  });

  describe('Voting Analytics ETL', () => {
    it('should extract voting analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockQuestions = [
        {
          id: 'question-1',
          community_id: 'community-1',
          Votes: [{ id: 'vote-1' }],
          Community: { id: 'community-1' }
        }
      ];
      
      VotingQuestion.findAll.mockResolvedValue(mockQuestions);
      
      const result = await dataWarehouse.extractVotingAnalytics(testDate);
      
      expect(result).toEqual(mockQuestions);
      expect(VotingQuestion.findAll).toHaveBeenCalledWith({
        include: expect.any(Array),
        where: expect.any(Object)
      });
    });

    it('should transform voting analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockQuestions = [
        {
          id: 'question-1',
          community_id: 'community-1',
          Votes: [
            { selected_options: JSON.stringify(['Option 1']) },
            { selected_options: JSON.stringify(['Option 2']) }
          ],
          Community: { Members: [{ id: 'member-1' }] }
        }
      ];
      
      VotingQuestion.findAll.mockResolvedValue(mockQuestions);
      
      const result = await dataWarehouse.transformVotingAnalytics(testDate);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('question_id', 'question-1');
      expect(result[0]).toHaveProperty('community_id', 'community-1');
      expect(result[0]).toHaveProperty('date_key', '2024-01-01');
      expect(result[0]).toHaveProperty('total_votes', 2);
      expect(result[0]).toHaveProperty('participation_rate');
      expect(result[0]).toHaveProperty('option_distribution');
    });

    it('should load voting analytics data', async () => {
      const testDate = new Date('2024-01-01');
      const mockTransformedData = [
        {
          question_id: 'question-1',
          community_id: 'community-1',
          date_key: '2024-01-01',
          total_votes: 2,
          participation_rate: 50,
          option_distribution: { 'Option 1': 1, 'Option 2': 1 }
        }
      ];
      
      VotingQuestion.findAll.mockResolvedValue([]);
      mockVotingAnalytics.upsert.mockResolvedValue(undefined);
      
      await dataWarehouse.loadVotingAnalytics(testDate);
      
      expect(mockVotingAnalytics.upsert).toHaveBeenCalledWith(
        mockTransformedData[0],
        expect.any(Object)
      );
    });
  });

  describe('Data Calculations', () => {
    it('should calculate activity score correctly', () => {
      const mockUser = {
        Memberships: [{ id: 'membership-1' }],
        Votes: [{ id: 'vote-1' }, { id: 'vote-2' }],
        Questions: [{ id: 'question-1' }],
        last_activity: new Date()
      };
      
      const score = dataWarehouse.calculateActivityScore(mockUser);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate engagement rate correctly', () => {
      const mockCommunity = {
        Members: [{ id: 'member-1' }, { id: 'member-2' }],
        Questions: [
          { Votes: [{ id: 'vote-1' }, { id: 'vote-2' }, { id: 'vote-3' }] }
        ]
      };
      
      const rate = dataWarehouse.calculateEngagementRate(mockCommunity);
      
      expect(rate).toBe(150); // 3 votes / 2 members * 100
    });

    it('should calculate participation rate correctly', () => {
      const mockQuestion = {
        Votes: [{ id: 'vote-1' }, { id: 'vote-2' }],
        Community: { Members: [{ id: 'member-1' }, { id: 'member-2' }, { id: 'member-3' }] }
      };
      
      const rate = dataWarehouse.calculateParticipationRate(mockQuestion);
      
      expect(rate).toBe(67); // 2 votes / 3 members * 100, rounded
    });

    it('should calculate option distribution correctly', () => {
      const mockQuestion = {
        Votes: [
          { selected_options: JSON.stringify({ 'Option 1': true }) },
          { selected_options: JSON.stringify({ 'Option 2': true }) },
          { selected_options: JSON.stringify({ 'Option 1': true, 'Option 2': true }) }
        ]
      };
      
      const distribution = dataWarehouse.calculateOptionDistribution(mockQuestion);
      
      expect(distribution).toEqual({
        'Option 1': 2,
        'Option 2': 2
      });
    });
  });

  describe('Data Querying', () => {
    it('should query warehouse data', async () => {
      const mockResult = [{ id: 1, name: 'test' }];
      sequelize.query.mockResolvedValue(mockResult);
      
      const result = await dataWarehouse.queryWarehouse(
        'SELECT * FROM test_table WHERE id = ?',
        [1]
      );
      
      expect(result).toEqual(mockResult);
      expect(sequelize.query).toHaveBeenCalledWith(
        'SELECT * FROM test_table WHERE id = ?',
        {
          replacements: [1],
          type: sequelize.QueryTypes.SELECT
        }
      );
    });

    it('should handle query errors', async () => {
      sequelize.query.mockRejectedValue(new Error('Query error'));
      
      await expect(dataWarehouse.queryWarehouse('SELECT * FROM invalid_table'))
        .rejects.toThrow('Warehouse query failed');
    });
  });

  describe('Table Management', () => {
    it('should get warehouse table', () => {
      const table = dataWarehouse.getTable('UserAnalytics');
      expect(table).toBe(mockUserAnalytics);
    });

    it('should return undefined for non-existent table', () => {
      const table = dataWarehouse.getTable('NonExistentTable');
      expect(table).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle extraction errors', async () => {
      User.findAll.mockRejectedValue(new Error('Database error'));
      
      await expect(dataWarehouse.extractUserAnalytics(new Date()))
        .rejects.toThrow('Database error');
    });

    it('should handle transformation errors', async () => {
      User.findAll.mockResolvedValue([]);
      
      // Mock a transformation error
      jest.spyOn(dataWarehouse, 'calculateActivityScore').mockImplementation(() => {
        throw new Error('Calculation error');
      });
      
      await expect(dataWarehouse.transformUserAnalytics(new Date()))
        .rejects.toThrow('Calculation error');
    });

    it('should handle loading errors', async () => {
      User.findAll.mockResolvedValue([]);
      mockUserAnalytics.upsert.mockRejectedValue(new Error('Upsert error'));
      
      await expect(dataWarehouse.loadUserAnalytics(new Date()))
        .rejects.toThrow('Upsert error');
    });
  });
}); 