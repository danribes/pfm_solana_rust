/**
 * Data Warehousing for Analytics
 * Handles analytics data schema, ETL processes, and data partitioning
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../models');
const { User, Community, Member, VotingQuestion, Vote } = require('../models');

class DataWarehouse {
  constructor() {
    this.warehouseTables = new Map();
    this.etlProcesses = new Map();
  }

  /**
   * Initialize data warehouse
   */
  async initialize() {
    try {
      // Create warehouse tables
      await this.createWarehouseTables();
      
      // Set up ETL processes
      await this.setupETLProcesses();
      
      // Create indexes for performance
      await this.createIndexes();
      
      console.log('Data warehouse initialized successfully');
    } catch (error) {
      console.error('Failed to initialize data warehouse:', error);
      throw error;
    }
  }

  /**
   * Create warehouse tables
   */
  async createWarehouseTables() {
    // User Analytics Fact Table
    const UserAnalytics = sequelize.define('UserAnalytics', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      date_key: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      total_communities: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      total_votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      total_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      activity_score: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      last_activity: {
        type: DataTypes.DATE
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'user_analytics_fact',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id', 'date_key']
        },
        {
          fields: ['date_key']
        }
      ]
    });

    // Community Analytics Fact Table
    const CommunityAnalytics = sequelize.define('CommunityAnalytics', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      community_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Communities',
          key: 'id'
        }
      },
      date_key: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      total_members: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      total_questions: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      total_votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      engagement_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
      },
      growth_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'community_analytics_fact',
      timestamps: true,
      indexes: [
        {
          fields: ['community_id', 'date_key']
        },
        {
          fields: ['date_key']
        }
      ]
    });

    // Voting Analytics Fact Table
    const VotingAnalytics = sequelize.define('VotingAnalytics', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'VotingQuestions',
          key: 'id'
        }
      },
      community_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Communities',
          key: 'id'
        }
      },
      date_key: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      total_votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      participation_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
      },
      option_distribution: {
        type: DataTypes.JSONB
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'voting_analytics_fact',
      timestamps: true,
      indexes: [
        {
          fields: ['question_id', 'date_key']
        },
        {
          fields: ['community_id', 'date_key']
        },
        {
          fields: ['date_key']
        }
      ]
    });

    // Date Dimension Table
    const DateDimension = sequelize.define('DateDimension', {
      date_key: {
        type: DataTypes.DATEONLY,
        primaryKey: true
      },
      year: {
        type: DataTypes.INTEGER
      },
      month: {
        type: DataTypes.INTEGER
      },
      day: {
        type: DataTypes.INTEGER
      },
      week: {
        type: DataTypes.INTEGER
      },
      quarter: {
        type: DataTypes.INTEGER
      },
      day_of_week: {
        type: DataTypes.INTEGER
      },
      day_name: {
        type: DataTypes.STRING
      },
      month_name: {
        type: DataTypes.STRING
      },
      is_weekend: {
        type: DataTypes.BOOLEAN
      },
      is_holiday: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      tableName: 'date_dimension',
      timestamps: false
    });

    // Store table references
    this.warehouseTables.set('UserAnalytics', UserAnalytics);
    this.warehouseTables.set('CommunityAnalytics', CommunityAnalytics);
    this.warehouseTables.set('VotingAnalytics', VotingAnalytics);
    this.warehouseTables.set('DateDimension', DateDimension);

    // Sync tables
    await sequelize.sync({ alter: true });
  }

  /**
   * Set up ETL processes
   */
  async setupETLProcesses() {
    // User Analytics ETL
    this.etlProcesses.set('userAnalytics', async (date) => {
      await this.extractUserAnalytics(date);
      await this.transformUserAnalytics(date);
      await this.loadUserAnalytics(date);
    });

    // Community Analytics ETL
    this.etlProcesses.set('communityAnalytics', async (date) => {
      await this.extractCommunityAnalytics(date);
      await this.transformCommunityAnalytics(date);
      await this.loadCommunityAnalytics(date);
    });

    // Voting Analytics ETL
    this.etlProcesses.set('votingAnalytics', async (date) => {
      await this.extractVotingAnalytics(date);
      await this.transformVotingAnalytics(date);
      await this.loadVotingAnalytics(date);
    });
  }

  /**
   * Extract user analytics data
   */
  async extractUserAnalytics(date) {
    const UserAnalytics = this.warehouseTables.get('UserAnalytics');
    
    // Get user data for the specified date
    const users = await User.findAll({
      include: [
        {
          model: Member,
          as: 'Memberships',
          include: [{ model: Community, as: 'Community' }]
        },
        {
          model: Vote,
          as: 'Votes'
        },
        {
          model: VotingQuestion,
          as: 'Questions'
        }
      ],
      where: {
        created_at: {
          [sequelize.Op.lte]: date
        }
      }
    });

    return users;
  }

  /**
   * Transform user analytics data
   */
  async transformUserAnalytics(date) {
    const users = await this.extractUserAnalytics(date);
    
    return users.map(user => ({
      user_id: user.id,
      date_key: date.toISOString().split('T')[0],
      total_communities: user.Memberships?.length || 0,
      total_votes: user.Votes?.length || 0,
      total_questions: user.Questions?.length || 0,
      activity_score: this.calculateActivityScore(user),
      last_activity: user.last_activity || user.updated_at
    }));
  }

  /**
   * Load user analytics data
   */
  async loadUserAnalytics(date) {
    const UserAnalytics = this.warehouseTables.get('UserAnalytics');
    const transformedData = await this.transformUserAnalytics(date);
    
    // Upsert data (insert or update)
    for (const record of transformedData) {
      await UserAnalytics.upsert(record, {
        where: {
          user_id: record.user_id,
          date_key: record.date_key
        }
      });
    }
  }

  /**
   * Extract community analytics data
   */
  async extractCommunityAnalytics(date) {
    const communities = await Community.findAll({
      include: [
        {
          model: Member,
          as: 'Members'
        },
        {
          model: VotingQuestion,
          as: 'Questions'
        }
      ],
      where: {
        created_at: {
          [sequelize.Op.lte]: date
        }
      }
    });

    return communities;
  }

  /**
   * Transform community analytics data
   */
  async transformCommunityAnalytics(date) {
    const communities = await this.extractCommunityAnalytics(date);
    
    return Promise.all(communities.map(async community => ({
      community_id: community.id,
      date_key: date.toISOString().split('T')[0],
      total_members: community.Members?.length || 0,
      total_questions: community.Questions?.length || 0,
      total_votes: await this.getCommunityVoteCount(community.id, date),
      engagement_rate: this.calculateEngagementRate(community),
      growth_rate: this.calculateGrowthRate(community, date)
    })));
  }

  /**
   * Load community analytics data
   */
  async loadCommunityAnalytics(date) {
    const CommunityAnalytics = this.warehouseTables.get('CommunityAnalytics');
    const transformedData = await this.transformCommunityAnalytics(date);
    
    for (const record of transformedData) {
      await CommunityAnalytics.upsert(record, {
        where: {
          community_id: record.community_id,
          date_key: record.date_key
        }
      });
    }
  }

  /**
   * Extract voting analytics data
   */
  async extractVotingAnalytics(date) {
    const questions = await VotingQuestion.findAll({
      include: [
        {
          model: Vote,
          as: 'Votes'
        },
        {
          model: Community,
          as: 'Community'
        }
      ],
      where: {
        created_at: {
          [sequelize.Op.lte]: date
        }
      }
    });

    return questions;
  }

  /**
   * Transform voting analytics data
   */
  async transformVotingAnalytics(date) {
    const questions = await this.extractVotingAnalytics(date);
    
    return questions.map(question => ({
      question_id: question.id,
      community_id: question.community_id,
      date_key: date.toISOString().split('T')[0],
      total_votes: question.Votes?.length || 0,
      participation_rate: this.calculateParticipationRate(question),
      option_distribution: this.calculateOptionDistribution(question)
    }));
  }

  /**
   * Load voting analytics data
   */
  async loadVotingAnalytics(date) {
    const VotingAnalytics = this.warehouseTables.get('VotingAnalytics');
    const transformedData = await this.transformVotingAnalytics(date);
    
    for (const record of transformedData) {
      await VotingAnalytics.upsert(record, {
        where: {
          question_id: record.question_id,
          date_key: record.date_key
        }
      });
    }
  }

  /**
   * Calculate activity score for user
   */
  calculateActivityScore(user) {
    let score = 0;
    
    // Community membership weight
    score += (user.Memberships?.length || 0) * 10;
    
    // Voting activity weight
    score += (user.Votes?.length || 0) * 5;
    
    // Question creation weight
    score += (user.Questions?.length || 0) * 15;
    
    // Recency bonus
    if (user.last_activity) {
      const daysSinceActivity = (Date.now() - new Date(user.last_activity)) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity <= 7) score += 20;
      else if (daysSinceActivity <= 30) score += 10;
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Calculate engagement rate for community
   */
  calculateEngagementRate(community) {
    const totalMembers = community.Members?.length || 0;
    const totalVotes = community.Questions?.reduce((sum, question) => sum + (question.Votes?.length || 0), 0) || 0;
    
    if (totalMembers === 0) return 0;
    
    return Math.round((totalVotes / totalMembers) * 100);
  }

  /**
   * Calculate growth rate for community
   */
  calculateGrowthRate(community, date) {
    // This would need historical data to calculate properly
    // For now, return a placeholder
    return 0;
  }

  /**
   * Get community vote count
   */
  async getCommunityVoteCount(communityId, date) {
    const voteCount = await Vote.count({
      include: [{
        model: VotingQuestion,
        as: 'Question',
        where: { community_id: communityId }
      }],
      where: {
        voted_at: {
          [sequelize.Op.lte]: date
        }
      }
    });
    
    return voteCount;
  }

  /**
   * Calculate participation rate for question
   */
  calculateParticipationRate(question) {
    const totalVotes = question.Votes?.length || 0;
    const communityMembers = question.Community?.Members?.length || 0;
    
    if (communityMembers === 0) return 0;
    
    return Math.round((totalVotes / communityMembers) * 100);
  }

  /**
   * Calculate option distribution for question
   */
  calculateOptionDistribution(question) {
    const votes = question.Votes || [];
    const distribution = {};
    
    votes.forEach(vote => {
      const options = JSON.parse(vote.selected_options || '{}');
      Object.keys(options).forEach(option => {
        distribution[option] = (distribution[option] || 0) + 1;
      });
    });
    
    return distribution;
  }

  /**
   * Create indexes for performance
   */
  async createIndexes() {
    // Indexes are already defined in the table definitions
    // Additional indexes can be added here if needed
    console.log('Indexes created successfully');
  }

  /**
   * Run ETL process for specific date
   */
  async runETL(date = new Date()) {
    try {
      console.log(`Starting ETL process for ${date.toISOString().split('T')[0]}`);
      
      for (const [processName, process] of this.etlProcesses) {
        console.log(`Running ETL process: ${processName}`);
        await process(date);
      }
      
      console.log('ETL process completed successfully');
    } catch (error) {
      console.error('ETL process failed:', error);
      throw error;
    }
  }

  /**
   * Get warehouse table
   */
  getTable(tableName) {
    return this.warehouseTables.get(tableName);
  }

  /**
   * Query warehouse data
   */
  async queryWarehouse(query, params = {}) {
    try {
      const result = await sequelize.query(query, {
        replacements: params,
        type: sequelize.QueryTypes.SELECT
      });
      
      return result;
    } catch (error) {
      throw new Error(`Warehouse query failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const dataWarehouse = new DataWarehouse();

module.exports = dataWarehouse; 