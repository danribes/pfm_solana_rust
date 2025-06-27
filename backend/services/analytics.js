const { Op, fn, col, literal } = require('sequelize');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../models');
const redis = require('../redis');
require('dotenv').config();

/**
 * Analytics Service
 * Provides comprehensive analytics and reporting capabilities
 */
class AnalyticsService {
  constructor() {
    this.cacheExpiry = parseInt(process.env.ANALYTICS_CACHE_EXPIRY || '3600', 10); // 1 hour
    try {
      this.redisClient = redis.getRedisClient();
    } catch (error) {
      console.warn('Redis client not available for analytics caching:', error.message);
      this.redisClient = null;
    }
  }

  /**
   * Get community analytics overview
   */
  async getCommunityAnalytics(filters = {}) {
    try {
      const cacheKey = `analytics:communities:${JSON.stringify(filters)}`;
      
      // Try to get from cache
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const { startDate, endDate, limit = 10 } = filters;
      const communityWhereClause = {};
      const memberWhereClause = {};
      
      if (startDate && endDate) {
        communityWhereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
        memberWhereClause.joined_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Community growth over time
      const communityGrowth = await Community.findAll({
        where: communityWhereClause,
        attributes: [
          [fn('DATE', col('created_at')), 'date'],
          [fn('COUNT', col('id')), 'new_communities'],
          [fn('COUNT', literal('CASE WHEN is_active = true THEN 1 END')), 'active_communities']
        ],
        group: [fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'DESC']],
        limit
      });

      // Member engagement metrics
      const memberEngagement = await Member.findAll({
        where: memberWhereClause,
        attributes: [
          [fn('COUNT', col('id')), 'total_members'],
          [fn('COUNT', literal('CASE WHEN status = \'approved\' THEN 1 END')), 'active_members'],
          [fn('AVG', literal('EXTRACT(EPOCH FROM (NOW() - joined_at))/86400')), 'avg_membership_days']
        ]
      });

      // Activity metrics
      const activityMetrics = await Analytics.findAll({
        where: {
          event_type: {
            [Op.in]: ['community_created', 'member_joined', 'vote_cast', 'question_created']
          },
          ...(startDate && endDate ? {
            created_at: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {})
        },
        attributes: [
          'event_type',
          [fn('COUNT', col('id')), 'count'],
          [fn('DATE', col('created_at')), 'date']
        ],
        group: ['event_type', fn('DATE', col('created_at'))],
        order: [[fn('DATE', col('created_at')), 'DESC']]
      });

      const result = {
        community_growth: communityGrowth,
        member_engagement: memberEngagement[0] || {},
        activity_metrics: activityMetrics,
        generated_at: new Date().toISOString()
      };

      // Cache the result
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, this.cacheExpiry, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('Failed to get community analytics:', error.message);
      throw error;
    }
  }

  /**
   * Get specific community analytics
   */
  async getCommunityOverview(communityId, filters = {}) {
    try {
      const cacheKey = `analytics:community:${communityId}:overview:${JSON.stringify(filters)}`;
      
      // Try to get from cache
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const { startDate, endDate } = filters;
      const whereClause = { community_id: communityId };
      
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Community basic info
      const community = await Community.findByPk(communityId, {
        include: [
          { model: Member, as: 'Members' },
          { model: VotingQuestion, as: 'VotingQuestions' }
        ]
      });

      if (!community) {
        throw new Error('Community not found');
      }

      // Member statistics
      const memberStats = await Member.findAll({
        where: { community_id: communityId },
        attributes: [
          'role',
          [fn('COUNT', col('id')), 'count'],
          [fn('COUNT', literal('CASE WHEN status = \'approved\' THEN 1 END')), 'active_count']
        ],
        group: ['role']
      });

      // Voting statistics - simplified
      const totalQuestions = await VotingQuestion.count({ where: { community_id: communityId } });
      const activeQuestions = await VotingQuestion.count({ where: { community_id: communityId, is_active: true } });
      const totalVotes = await Vote.count({
        include: [{ model: VotingQuestion, as: 'VotingQuestion', where: { community_id: communityId } }]
      });
      const votingStats = {
        total_questions: totalQuestions,
        active_questions: activeQuestions,
        total_votes: totalVotes
      };

      // Recent activity
      const recentActivity = await Analytics.findAll({
        where: {
          ...whereClause,
          event_type: {
            [Op.in]: ['member_joined', 'vote_cast', 'question_created']
          }
        },
        order: [['created_at', 'DESC']],
        limit: 20
      });

      const result = {
        community: {
          id: community.id,
          name: community.name,
          description: community.description,
          created_at: community.created_at,
          member_count: community.Members.length,
          question_count: community.VotingQuestions.length
        },
        member_statistics: memberStats,
        voting_statistics: votingStats,
        recent_activity: recentActivity,
        generated_at: new Date().toISOString()
      };

      // Cache the result
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, this.cacheExpiry, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('Failed to get community overview:', error.message);
      throw error;
    }
  }

  /**
   * Get member engagement analytics
   */
  async getMemberEngagement(communityId, filters = {}) {
    try {
      const cacheKey = `analytics:community:${communityId}:members:${JSON.stringify(filters)}`;
      
      // Try to get from cache
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const { startDate, endDate } = filters;
      const whereClause = { community_id: communityId };
      
      if (startDate && endDate) {
        whereClause.joined_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Member growth over time
      const memberGrowth = await Member.findAll({
        where: whereClause,
        attributes: [
          [fn('DATE', col('joined_at')), 'date'],
          [fn('COUNT', col('id')), 'new_members'],
          [fn('COUNT', literal('CASE WHEN role = \'admin\' THEN 1 END')), 'admins'],
          [fn('COUNT', literal('CASE WHEN role = \'member\' THEN 1 END')), 'members']
        ],
        group: [fn('DATE', col('joined_at'))],
        order: [[fn('DATE', col('joined_at')), 'DESC']]
      });

      // Member activity - simplified
      const activityRows = await Analytics.findAll({
        where: {
          community_id: communityId,
          event_type: {
            [Op.in]: ['vote_cast', 'question_created', 'member_activity']
          }
        },
        attributes: [
          'user_id',
          [fn('COUNT', col('id')), 'activity_count'],
          [fn('MAX', col('created_at')), 'last_activity']
        ],
        group: ['user_id'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 20,
        raw: true
      });
      const memberActivity = activityRows.map(row => ({
        user_id: row.user_id,
        activity_count: row.activity_count,
        last_activity: row.last_activity
      }));

      // Member retention
      const memberRetention = await this.calculateMemberRetention(communityId, filters);

      const result = {
        member_growth: memberGrowth,
        member_activity: memberActivity,
        member_retention: memberRetention,
        generated_at: new Date().toISOString()
      };

      // Cache the result
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, this.cacheExpiry, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('Failed to get member engagement:', error.message);
      throw error;
    }
  }

  /**
   * Get voting analytics
   */
  async getVotingAnalytics(filters = {}) {
    try {
      const cacheKey = `analytics:voting:${JSON.stringify(filters)}`;
      
      // Try to get from cache
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const { startDate, endDate, communityId } = filters;
      const whereClause = {};
      
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      if (communityId) {
        whereClause.community_id = communityId;
      }

      // Overall participation rates - simplified query
      const totalVotes = await Vote.count({
        include: [
          { 
            model: VotingQuestion, 
            as: 'VotingQuestion',
            where: whereClause
          }
        ]
      });

      // Get unique voters count - simplified approach
      const uniqueVotersResult = await Vote.findAll({
        include: [
          { 
            model: VotingQuestion, 
            as: 'VotingQuestion',
            where: whereClause
          }
        ],
        attributes: [
          [fn('DISTINCT', col('user_id')), 'user_id']
        ],
        raw: true
      });
      const uniqueVoters = uniqueVotersResult.length;

      // Get questions voted on count - simplified approach
      const questionsVotedOnResult = await Vote.findAll({
        include: [
          { 
            model: VotingQuestion, 
            as: 'VotingQuestion',
            where: whereClause
          }
        ],
        attributes: [
          [fn('DISTINCT', col('VotingQuestion.id')), 'question_id']
        ],
        raw: true
      });
      const questionsVotedOn = questionsVotedOnResult.length;

      const participationRates = {
        total_votes: totalVotes,
        unique_voters: uniqueVoters,
        questions_voted_on: questionsVotedOn
      };

      // Voting trends over time - simplified without GROUP BY
      const allVotes = await Vote.findAll({
        include: [
          { 
            model: VotingQuestion, 
            as: 'VotingQuestion',
            where: whereClause
          }
        ],
        attributes: [
          'voted_at',
          'user_id'
        ],
        raw: true
      });

      // Group votes by date manually
      const voteGroups = {};
      allVotes.forEach(vote => {
        const date = vote.voted_at.split('T')[0]; // Get just the date part
        if (!voteGroups[date]) {
          voteGroups[date] = {
            votes: [],
            users: new Set()
          };
        }
        voteGroups[date].votes.push(vote);
        voteGroups[date].users.add(vote.user_id);
      });

      const votingTrendsWithCounts = Object.entries(voteGroups).map(([date, data]) => ({
        date,
        votes_cast: data.votes.length,
        active_voters: data.users.size
      })).sort((a, b) => new Date(b.date) - new Date(a.date));

      // Question-specific analytics - simplified
      const questionAnalytics = await VotingQuestion.findAll({
        where: whereClause,
        include: [
          { model: Vote, as: 'Votes' },
          { model: Community, as: 'Community' }
        ],
        attributes: [
          'id',
          'title',
          'is_active'
        ]
      });

      // Add vote counts separately to avoid GROUP BY issues
      const questionAnalyticsWithCounts = await Promise.all(
        questionAnalytics.map(async (question) => {
          const voteCount = await Vote.count({
            where: { question_id: question.id }
          });
          
          const uniqueVoters = await Vote.count({
            where: { question_id: question.id },
            distinct: true,
            col: 'user_id'
          });

          return {
            id: question.id,
            title: question.title,
            is_active: question.is_active,
            vote_count: voteCount,
            unique_voters: uniqueVoters,
            community: {
              id: question.Community.id,
              name: question.Community.name
            }
          };
        })
      );

      const result = {
        participation_rates: participationRates,
        voting_trends: votingTrendsWithCounts,
        question_analytics: questionAnalyticsWithCounts,
        generated_at: new Date().toISOString()
      };

      // Cache the result
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, this.cacheExpiry, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('Failed to get voting analytics:', error.message);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(filters = {}) {
    try {
      const cacheKey = `analytics:users:${JSON.stringify(filters)}`;
      
      // Try to get from cache
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const { startDate, endDate } = filters;
      const whereClause = {};
      
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // User activity patterns - simplified
      const activityRows = await Analytics.findAll({
        where: whereClause,
        attributes: [
          'user_id',
          'event_type',
          [fn('COUNT', col('id')), 'event_count'],
          [fn('MAX', col('created_at')), 'last_activity']
        ],
        group: ['user_id', 'event_type'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        raw: true
      });
      const userActivity = activityRows.map(row => ({
        user_id: row.user_id,
        event_type: row.event_type,
        event_count: row.event_count,
        last_activity: row.last_activity
      }));

      // User engagement metrics - simplified
      const users = await User.findAll({
        where: whereClause,
        attributes: ['id'],
        limit: 50
      });

      const userEngagement = await Promise.all(
        users.map(async (user) => {
          const communityCount = await Member.count({ where: { user_id: user.id } });
          const voteCount = await Vote.count({ where: { user_id: user.id } });
          const questionCount = await VotingQuestion.count({ where: { created_by: user.id } });

          return {
            id: user.id,
            community_count: communityCount,
            vote_count: voteCount,
            question_count: questionCount
          };
        })
      );

      // User retention
      const userRetention = await this.calculateUserRetention(filters);

      const result = {
        user_activity: userActivity,
        user_engagement: userEngagement,
        user_retention: userRetention,
        generated_at: new Date().toISOString()
      };

      // Cache the result
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, this.cacheExpiry, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('Failed to get user analytics:', error.message);
      throw error;
    }
  }

  /**
   * Calculate member retention
   */
  async calculateMemberRetention(communityId, filters = {}) {
    try {
      const { startDate, endDate } = filters;
      const whereClause = { community_id: communityId };
      
      if (startDate && endDate) {
        whereClause.joined_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const members = await Member.findAll({
        where: whereClause,
        include: [{ model: User, as: 'User' }],
        order: [['joined_at', 'ASC']]
      });

      // Calculate retention rates
      const retentionData = [];
      const totalMembers = members.length;

      for (let i = 1; i <= 30; i++) {
        const activeMembers = members.filter(member => {
          const daysSinceJoin = Math.floor((new Date() - new Date(member.joined_at)) / (1000 * 60 * 60 * 24));
          return daysSinceJoin >= i && member.status === 'approved';
        }).length;

        retentionData.push({
          day: i,
          retained_members: activeMembers,
          retention_rate: totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0
        });
      }

      return retentionData;
    } catch (error) {
      console.error('Failed to calculate member retention:', error.message);
      return [];
    }
  }

  /**
   * Calculate user retention
   */
  async calculateUserRetention(filters = {}) {
    try {
      const { startDate, endDate } = filters;
      const whereClause = {};
      
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const users = await User.findAll({
        where: whereClause,
        order: [['created_at', 'ASC']]
      });

      // Calculate retention rates
      const retentionData = [];
      const totalUsers = users.length;

      for (let i = 1; i <= 30; i++) {
        const activeUsers = users.filter(user => {
          const daysSinceJoin = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
          return daysSinceJoin >= i && user.is_active === true;
        }).length;

        retentionData.push({
          day: i,
          retained_users: activeUsers,
          retention_rate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
        });
      }

      return retentionData;
    } catch (error) {
      console.error('Failed to calculate user retention:', error.message);
      return [];
    }
  }

  /**
   * Get question-specific analytics
   */
  async getQuestionAnalytics(questionId) {
    try {
      const cacheKey = `analytics:question:${questionId}`;
      
      // Try to get from cache
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const question = await VotingQuestion.findByPk(questionId, {
        include: [
          { model: Vote, as: 'Votes' },
          { model: Community, as: 'Community' },
          { model: User, as: 'Creator' }
        ]
      });

      if (!question) {
        throw new Error('Question not found');
      }

      // Vote distribution
      const voteDistribution = await Vote.findAll({
        where: { question_id: questionId },
        attributes: [
          'selected_options',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['selected_options']
      });

      // Voting timeline
      const votingTimeline = await Vote.findAll({
        where: { question_id: questionId },
        attributes: [
          [fn('DATE', col('voted_at')), 'date'],
          [fn('COUNT', col('id')), 'votes']
        ],
        group: [fn('DATE', col('voted_at'))],
        order: [[fn('DATE', col('voted_at')), 'ASC']]
      });

      // Participation rate
      const totalMembers = await Member.count({
        where: { community_id: question.community_id, status: 'approved' }
      });

      const participationRate = totalMembers > 0 ? 
        (question.Votes.length / totalMembers) * 100 : 0;

      const result = {
        question: {
          id: question.id,
          title: question.title,
          description: question.description,
          is_active: question.is_active,
          voting_end_at: question.voting_end_at,
          created_at: question.created_at
        },
        community: {
          id: question.Community.id,
          name: question.Community.name
        },
        creator: {
          id: question.Creator.id,
          username: question.Creator.username
        },
        vote_distribution: voteDistribution,
        voting_timeline: votingTimeline,
        participation_rate: participationRate,
        total_votes: question.Votes.length,
        total_members: totalMembers,
        generated_at: new Date().toISOString()
      };

      // Cache the result
      if (this.redisClient) {
        await this.redisClient.setex(cacheKey, this.cacheExpiry, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('Failed to get question analytics:', error.message);
      throw error;
    }
  }

  /**
   * Clear analytics cache
   */
  async clearCache(pattern = 'analytics:*') {
    try {
      if (!this.redisClient) {
        console.log('Redis client not available, skipping cache clear');
        return;
      }
      
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        console.log(`Cleared ${keys.length} analytics cache keys`);
      }
    } catch (error) {
      console.error('Failed to clear analytics cache:', error.message);
    }
  }

  /**
   * Get analytics cache statistics
   */
  async getCacheStats() {
    try {
      if (!this.redisClient) {
        return { total_keys: 0, memory_usage: 0, key_patterns: {} };
      }
      
      const keys = await this.redisClient.keys('analytics:*');
      const stats = {
        total_keys: keys.length,
        memory_usage: 0,
        key_patterns: {}
      };

      for (const key of keys) {
        const pattern = key.split(':')[1];
        stats.key_patterns[pattern] = (stats.key_patterns[pattern] || 0) + 1;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get cache stats:', error.message);
      return { total_keys: 0, memory_usage: 0, key_patterns: {} };
    }
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

module.exports = analyticsService; 