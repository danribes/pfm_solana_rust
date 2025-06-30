const { Sequelize } = require('sequelize');
const Redis = require('ioredis');

/**
 * Test Data Manager for CI Integration
 * Handles test data setup, cleanup, and isolation
 */

class TestDataManager {
  constructor() {
    this.db = null;
    this.redis = null;
    this.testData = {
      users: [],
      communities: [],
      sessions: [],
      votes: []
    };
  }

  /**
   * Initialize test environment
   */
  async initialize() {
    console.log('🧪 Initializing test environment...');
    
    // Initialize database connection
    this.db = new Sequelize(
      process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/pfm_community_test',
      {
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    // Initialize Redis connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: 1, // Use test database
      lazyConnect: true
    });

    // Test connections
    await this.testConnections();
  }

  /**
   * Test database and Redis connections
   */
  async testConnections() {
    try {
      await this.db.authenticate();
      console.log('✅ Database connection established');

      await this.redis.ping();
      console.log('✅ Redis connection established');
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      throw error;
    }
  }

  /**
   * Create test users
   */
  async createTestUsers(count = 3) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = {
        id: `test-user-${i}`,
        wallet_address: `test-wallet-${i}`,
        username: `testuser${i}`,
        email: `test${i}@example.com`,
        created_at: new Date(),
        updated_at: new Date()
      };
      users.push(user);
    }
    
    this.testData.users = users;
    return users;
  }

  /**
   * Create test communities
   */
  async createTestCommunities(count = 2) {
    const communities = [];
    for (let i = 0; i < count; i++) {
      const community = {
        id: `test-community-${i}`,
        name: `Test Community ${i}`,
        description: `Test community ${i} for automated testing`,
        admin_wallet: `test-wallet-${i}`,
        member_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      };
      communities.push(community);
    }
    
    this.testData.communities = communities;
    return communities;
  }

  /**
   * Create test sessions
   */
  async createTestSessions(userCount = 2) {
    const sessions = [];
    for (let i = 0; i < userCount; i++) {
      const sessionId = `test-session-${i}`;
      const sessionData = {
        user_id: `test-user-${i}`,
        wallet_address: `test-wallet-${i}`,
        created_at: Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      // Store in Redis
      await this.redis.setex(sessionId, 86400, JSON.stringify(sessionData));
      sessions.push({ id: sessionId, data: sessionData });
    }
    
    this.testData.sessions = sessions;
    return sessions;
  }

  /**
   * Setup complete test environment
   */
  async setupTestEnvironment() {
    console.log('�� Setting up test environment...');
    
    await this.createTestUsers(3);
    await this.createTestCommunities(2);
    await this.createTestSessions(2);
    
    console.log(`✅ Test environment ready:
      - Users: ${this.testData.users.length}
      - Communities: ${this.testData.communities.length}
      - Sessions: ${this.testData.sessions.length}`);
    
    return this.testData;
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Clean Redis test data
      if (this.redis) {
        const keys = await this.redis.keys('test-*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`✅ Cleaned ${keys.length} Redis keys`);
        }
      }

      // Clean database test data
      if (this.db) {
        // Clean up test records (basic cleanup)
        await this.db.query("DELETE FROM votes WHERE voter_wallet LIKE 'test-wallet-%'");
        await this.db.query("DELETE FROM members WHERE wallet_address LIKE 'test-wallet-%'");
        await this.db.query("DELETE FROM communities WHERE admin_wallet LIKE 'test-wallet-%'");
        await this.db.query("DELETE FROM users WHERE wallet_address LIKE 'test-wallet-%'");
        console.log('✅ Cleaned database test data');
      }

      // Reset test data tracking
      this.testData = {
        users: [],
        communities: [],
        sessions: [],
        votes: []
      };

    } catch (error) {
      console.warn('⚠️  Cleanup warning:', error.message);
    }
  }

  /**
   * Close connections
   */
  async close() {
    try {
      if (this.redis) {
        await this.redis.disconnect();
        console.log('✅ Redis connection closed');
      }

      if (this.db) {
        await this.db.close();
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.warn('⚠️  Connection close warning:', error.message);
    }
  }

  /**
   * Get test data for use in tests
   */
  getTestData() {
    return this.testData;
  }
}

// Global test data manager instance
const testDataManager = new TestDataManager();

module.exports = {
  TestDataManager,
  testDataManager
};
