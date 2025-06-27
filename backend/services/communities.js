const { Community, Member, User, VotingQuestion, Vote, Analytics } = require('../models');
const { Op } = require('sequelize');
const cache = require('../services/cache');

class CommunityService {
  /**
   * Create a new community
   */
  async createCommunity(communityData, userId) {
    try {
      // Generate on-chain ID (simplified for demo)
      const onChainId = `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const community = await Community.create({
        ...communityData,
        on_chain_id: onChainId,
        created_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Add creator as owner member
      await Member.create({
        community_id: community.id,
        user_id: userId,
        role: 'owner',
        status: 'approved',
        joined_at: new Date()
      });

      // Update member count
      await community.update({ member_count: 1 });

      // Invalidate cache
      await cache.invalidatePattern('communities:*');
      await cache.invalidatePattern(`community:${community.id}:*`);

      return community;
    } catch (error) {
      console.error('Create community error:', error);
      throw error;
    }
  }

  /**
   * Get communities with filtering and pagination
   */
  async getCommunities(filters = {}, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};
      const orderClause = [];

      // Apply filters
      if (filters.search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      if (filters.status && filters.status !== 'all') {
        whereClause.is_active = filters.status === 'active';
      }

      // Apply sorting
      if (filters.sort_by) {
        const sortOrder = filters.sort_order || 'desc';
        orderClause.push([filters.sort_by, sortOrder.toUpperCase()]);
      } else {
        orderClause.push(['created_at', 'DESC']);
      }

      const { count, rows: communities } = await Community.findAndCountAll({
        where: whereClause,
        order: orderClause,
        limit,
        offset,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'wallet_address', 'username']
          }
        ]
      });

      return {
        communities,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Get communities error:', error);
      throw error;
    }
  }

  /**
   * Get community by ID with detailed information
   */
  async getCommunityById(communityId, userId = null) {
    try {
      const cacheKey = `community:${communityId}:details`;
      let community = await cache.get(cacheKey);

      if (!community) {
        community = await Community.findByPk(communityId, {
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'wallet_address', 'username']
            },
            {
              model: Member,
              as: 'members',
              include: [
                {
                  model: User,
                  attributes: ['id', 'wallet_address', 'username']
                }
              ]
            }
          ]
        });

        if (community) {
          await cache.set(cacheKey, community, 300); // Cache for 5 minutes
        }
      }

      if (!community) {
        return null;
      }

      // Add user-specific data if authenticated
      if (userId) {
        const userMember = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: userId
          }
        });

        community.dataValues.userMembership = userMember ? {
          role: userMember.role,
          status: userMember.status,
          joinedAt: userMember.joined_at
        } : null;
      }

      return community;
    } catch (error) {
      console.error('Get community by ID error:', error);
      throw error;
    }
  }

  /**
   * Update community information
   */
  async updateCommunity(communityId, updateData, userId) {
    try {
      const community = await Community.findByPk(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      // Check permissions
      if (community.created_by !== userId) {
        const member = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: userId,
            role: ['admin', 'owner']
          }
        });

        if (!member) {
          throw new Error('Insufficient permissions');
        }
      }

      // Update community
      await community.update({
        ...updateData,
        updated_at: new Date()
      });

      // Invalidate cache
      await cache.invalidatePattern(`community:${communityId}:*`);
      await cache.invalidatePattern('communities:*');

      return community;
    } catch (error) {
      console.error('Update community error:', error);
      throw error;
    }
  }

  /**
   * Delete community (soft delete)
   */
  async deleteCommunity(communityId, userId) {
    try {
      const community = await Community.findByPk(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      // Only owner can delete
      if (community.created_by !== userId) {
        throw new Error('Only community owner can delete the community');
      }

      // Soft delete
      await community.update({
        is_active: false,
        updated_at: new Date()
      });

      // Invalidate cache
      await cache.invalidatePattern(`community:${communityId}:*`);
      await cache.invalidatePattern('communities:*');

      return { success: true };
    } catch (error) {
      console.error('Delete community error:', error);
      throw error;
    }
  }

  /**
   * Update community configuration
   */
  async updateConfiguration(communityId, configData, userId) {
    try {
      const community = await Community.findByPk(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      // Check permissions
      if (community.created_by !== userId) {
        const member = await Member.findOne({
          where: {
            community_id: communityId,
            user_id: userId,
            role: ['admin', 'owner']
          }
        });

        if (!member) {
          throw new Error('Insufficient permissions');
        }
      }

      // Validate configuration
      if (configData.max_members && configData.max_members < community.member_count) {
        throw new Error('Max members cannot be less than current member count');
      }

      // Update configuration
      await community.update({
        ...configData,
        updated_at: new Date()
      });

      // Invalidate cache
      await cache.invalidatePattern(`community:${communityId}:*`);

      return community;
    } catch (error) {
      console.error('Update configuration error:', error);
      throw error;
    }
  }

  /**
   * Get community analytics
   */
  async getAnalytics(communityId, filters = {}) {
    try {
      const cacheKey = `community:${communityId}:analytics:${JSON.stringify(filters)}`;
      let analytics = await cache.get(cacheKey);

      if (!analytics) {
        const community = await Community.findByPk(communityId);
        if (!community) {
          throw new Error('Community not found');
        }

        // Get member statistics
        const memberStats = await Member.findAll({
          where: { community_id: communityId },
          attributes: [
            'status',
            'role',
            [Member.sequelize.fn('COUNT', Member.sequelize.col('id')), 'count']
          ],
          group: ['status', 'role']
        });

        // Get voting statistics
        const votingStats = await VotingQuestion.findAll({
          where: { community_id: communityId },
          attributes: [
            'status',
            [VotingQuestion.sequelize.fn('COUNT', VotingQuestion.sequelize.col('id')), 'count']
          ],
          group: ['status']
        });

        // Get recent activity
        const recentActivity = await Analytics.findAll({
          where: { 
            community_id: communityId,
            created_at: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          order: [['created_at', 'DESC']],
          limit: 50
        });

        analytics = {
          memberStats,
          votingStats,
          recentActivity,
          totalMembers: community.member_count,
          totalQuestions: votingStats.reduce((sum, stat) => sum + parseInt(stat.dataValues.count), 0)
        };

        await cache.set(cacheKey, analytics, 600); // Cache for 10 minutes
      }

      return analytics;
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  }

  /**
   * Get member statistics
   */
  async getMemberStats(communityId) {
    try {
      const cacheKey = `community:${communityId}:member_stats`;
      let stats = await cache.get(cacheKey);

      if (!stats) {
        const memberStats = await Member.findAll({
          where: { community_id: communityId },
          attributes: [
            'status',
            'role',
            [Member.sequelize.fn('COUNT', Member.sequelize.col('id')), 'count']
          ],
          group: ['status', 'role']
        });

        const totalMembers = await Member.count({
          where: { 
            community_id: communityId,
            status: 'approved'
          }
        });

        const pendingMembers = await Member.count({
          where: { 
            community_id: communityId,
            status: 'pending'
          }
        });

        stats = {
          memberStats,
          totalMembers,
          pendingMembers
        };

        await cache.set(cacheKey, stats, 300); // Cache for 5 minutes
      }

      return stats;
    } catch (error) {
      console.error('Get member stats error:', error);
      throw error;
    }
  }

  /**
   * Get voting statistics
   */
  async getVotingStats(communityId) {
    try {
      const cacheKey = `community:${communityId}:voting_stats`;
      let stats = await cache.get(cacheKey);

      if (!stats) {
        const questionStats = await VotingQuestion.findAll({
          where: { community_id: communityId },
          attributes: [
            'status',
            [VotingQuestion.sequelize.fn('COUNT', VotingQuestion.sequelize.col('id')), 'count']
          ],
          group: ['status']
        });

        const totalVotes = await Vote.count({
          include: [{
            model: VotingQuestion,
            where: { community_id: communityId }
          }]
        });

        const activeQuestions = await VotingQuestion.count({
          where: { 
            community_id: communityId,
            status: 'active'
          }
        });

        stats = {
          questionStats,
          totalVotes,
          activeQuestions
        };

        await cache.set(cacheKey, stats, 300); // Cache for 5 minutes
      }

      return stats;
    } catch (error) {
      console.error('Get voting stats error:', error);
      throw error;
    }
  }

  /**
   * Validate community configuration
   */
  async validateConfiguration(communityId, configData) {
    try {
      const community = await Community.findByPk(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      const errors = [];

      // Validate max members
      if (configData.max_members && configData.max_members < community.member_count) {
        errors.push('Max members cannot be less than current member count');
      }

      // Validate voting threshold
      if (configData.voting_threshold) {
        if (configData.voting_threshold < 1 || configData.voting_threshold > 100) {
          errors.push('Voting threshold must be between 1 and 100');
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Validate configuration error:', error);
      throw error;
    }
  }
}

module.exports = new CommunityService(); 