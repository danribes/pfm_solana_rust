const { Member, Community, User } = require('../models');
const { Op } = require('sequelize');
const cache = require('./cache');
const notificationService = require('./notifications');

class MembershipService {
  // Apply to join a community
  async applyToCommunity(communityId, userId, applicationData = {}) {
    try {
      // Check if community exists and is active
      const community = await Community.findByPk(communityId);
      if (!community) {
        throw new Error('Community not found');
      }

      if (!community.is_active) {
        throw new Error('Community is not active');
      }

      // Check if user already has a membership
      const existingMembership = await Member.findOne({
        where: {
          community_id: communityId,
          user_id: userId
        }
      });

      if (existingMembership) {
        throw new Error('User already has a membership in this community');
      }

      // Check if community has reached max members
      if (community.max_members) {
        const memberCount = await Member.count({
          where: {
            community_id: communityId,
            status: 'approved'
          }
        });

        if (memberCount >= community.max_members) {
          throw new Error('Community has reached maximum member limit');
        }
      }

      // Create membership application
      const membership = await Member.create({
        community_id: communityId,
        user_id: userId,
        role: 'member',
        status: community.require_approval ? 'pending' : 'approved',
        joined_at: new Date(),
        approved_at: community.require_approval ? null : new Date(),
        approved_by: community.require_approval ? null : userId
      });

      // Invalidate cache
      await this.invalidateMembershipCache(communityId);

      // Send notification to admins if approval is required
      if (community.require_approval) {
        try {
          await notificationService.notifyJoinRequest(communityId, userId, applicationData);
        } catch (notificationError) {
          console.error('Failed to send join request notification:', notificationError);
          // Don't fail the application if notification fails
        }
      }

      return membership;
    } catch (error) {
      console.error('Error applying to community:', error);
      throw error;
    }
  }

  // Get community members with pagination and filtering
  async getCommunityMembers(communityId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'approved',
        role,
        search
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {
        community_id: communityId
      };

      if (status !== 'all') {
        whereClause.status = status;
      }

      if (role) {
        whereClause.role = role;
      }

      // Add search functionality
      if (search) {
        whereClause['$User.username$'] = {
          [Op.iLike]: `%${search}%`
        };
      }

      const { count, rows: members } = await Member.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'email', 'avatar_url', 'created_at']
          }
        ],
        order: [['joined_at', 'DESC']],
        limit,
        offset
      });

      return {
        members,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error getting community members:', error);
      throw error;
    }
  }

  // Get pending applications
  async getPendingApplications(communityId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {
        community_id: communityId,
        status: 'pending'
      };

      // Add search functionality
      if (search) {
        whereClause['$User.username$'] = {
          [Op.iLike]: `%${search}%`
        };
      }

      const { count, rows: applications } = await Member.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'email', 'avatar_url', 'created_at']
          }
        ],
        order: [['joined_at', 'ASC']],
        limit,
        offset
      });

      return {
        applications,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error getting pending applications:', error);
      throw error;
    }
  }

  // Get user's memberships across communities
  async getUserMemberships(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'approved',
        role
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {
        user_id: userId
      };

      if (status !== 'all') {
        whereClause.status = status;
      }

      if (role) {
        whereClause.role = role;
      }

      const { count, rows: memberships } = await Member.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Community,
            as: 'Community',
            attributes: ['id', 'name', 'description', 'logo_url', 'is_active', 'created_at']
          }
        ],
        order: [['joined_at', 'DESC']],
        limit,
        offset
      });

      return {
        memberships,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user memberships:', error);
      throw error;
    }
  }

  // Approve member application
  async approveMember(communityId, memberId, approvedBy) {
    try {
      const membership = await Member.findOne({
        where: {
          id: memberId,
          community_id: communityId,
          status: 'pending'
        }
      });

      if (!membership) {
        throw new Error('Pending membership application not found');
      }

      // Check if community has reached max members
      const community = await Community.findByPk(communityId);
      if (community.max_members) {
        const memberCount = await Member.count({
          where: {
            community_id: communityId,
            status: 'approved'
          }
        });

        if (memberCount >= community.max_members) {
          throw new Error('Community has reached maximum member limit');
        }
      }

      // Update membership
      await membership.update({
        status: 'approved',
        approved_at: new Date(),
        approved_by: approvedBy,
        updated_at: new Date()
      });

      // Invalidate cache
      await this.invalidateMembershipCache(communityId);

      // Send notification to the user
      try {
        await notificationService.notifyMembershipApproved(communityId, membership.user_id, approvedBy);
      } catch (notificationError) {
        console.error('Failed to send approval notification:', notificationError);
        // Don't fail the approval if notification fails
      }

      return membership;
    } catch (error) {
      console.error('Error approving member:', error);
      throw error;
    }
  }

  // Reject member application
  async rejectMember(communityId, memberId, rejectedBy, reason = '') {
    try {
      const membership = await Member.findOne({
        where: {
          id: memberId,
          community_id: communityId,
          status: 'pending'
        }
      });

      if (!membership) {
        throw new Error('Pending membership application not found');
      }

      // Update membership
      await membership.update({
        status: 'rejected',
        updated_at: new Date()
      });

      // Invalidate cache
      await this.invalidateMembershipCache(communityId);

      // Send notification to the user
      try {
        await notificationService.notifyMembershipRejected(communityId, membership.user_id, rejectedBy, reason);
      } catch (notificationError) {
        console.error('Failed to send rejection notification:', notificationError);
        // Don't fail the rejection if notification fails
      }

      return membership;
    } catch (error) {
      console.error('Error rejecting member:', error);
      throw error;
    }
  }

  // Remove member from community
  async removeMember(communityId, memberId, removedBy) {
    try {
      const membership = await Member.findOne({
        where: {
          id: memberId,
          community_id: communityId,
          status: 'approved'
        }
      });

      if (!membership) {
        throw new Error('Approved membership not found');
      }

      // Prevent removing community owner
      const community = await Community.findByPk(communityId);
      if (community.created_by === membership.user_id) {
        throw new Error('Cannot remove community owner');
      }

      // Update membership
      await membership.update({
        status: 'banned',
        updated_at: new Date()
      });

      // Invalidate cache
      await this.invalidateMembershipCache(communityId);

      return membership;
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  // Change member role
  async changeMemberRole(communityId, memberId, newRole, changedBy) {
    try {
      const membership = await Member.findOne({
        where: {
          id: memberId,
          community_id: communityId,
          status: 'approved'
        }
      });

      if (!membership) {
        throw new Error('Approved membership not found');
      }

      // Validate role
      const validRoles = ['member', 'moderator', 'admin'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role');
      }

      // Prevent changing community owner role
      const community = await Community.findByPk(communityId);
      if (community.created_by === membership.user_id) {
        throw new Error('Cannot change community owner role');
      }

      // Update membership
      await membership.update({
        role: newRole,
        updated_at: new Date()
      });

      // Invalidate cache
      await this.invalidateMembershipCache(communityId);

      return membership;
    } catch (error) {
      console.error('Error changing member role:', error);
      throw error;
    }
  }

  // Get member status
  async getMemberStatus(communityId, memberId) {
    try {
      const membership = await Member.findOne({
        where: {
          id: memberId,
          community_id: communityId
        },
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'email', 'avatar_url']
          }
        ]
      });

      if (!membership) {
        throw new Error('Membership not found');
      }

      return membership;
    } catch (error) {
      console.error('Error getting member status:', error);
      throw error;
    }
  }

  // Update member status
  async updateMemberStatus(communityId, memberId, newStatus, updatedBy) {
    try {
      const membership = await Member.findOne({
        where: {
          id: memberId,
          community_id: communityId
        }
      });

      if (!membership) {
        throw new Error('Membership not found');
      }

      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected', 'banned'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status');
      }

      // Prevent changing community owner status
      const community = await Community.findByPk(communityId);
      if (community.created_by === membership.user_id) {
        throw new Error('Cannot change community owner status');
      }

      // Update membership
      const updateData = {
        status: newStatus,
        updated_at: new Date()
      };

      if (newStatus === 'approved' && membership.status === 'pending') {
        updateData.approved_at = new Date();
        updateData.approved_by = updatedBy;
      }

      await membership.update(updateData);

      // Invalidate cache
      await this.invalidateMembershipCache(communityId);

      return membership;
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  }

  // Get membership history
  async getMembershipHistory(membershipId) {
    try {
      const membership = await Member.findByPk(membershipId, {
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'username', 'email', 'avatar_url']
          },
          {
            model: Community,
            as: 'Community',
            attributes: ['id', 'name', 'description', 'logo_url']
          }
        ]
      });

      if (!membership) {
        throw new Error('Membership not found');
      }

      // For now, return the membership with its current state
      // In a real implementation, you might want to track changes in a separate table
      return {
        membership,
        history: [
          {
            action: 'created',
            timestamp: membership.joined_at,
            details: 'Membership application submitted'
          },
          ...(membership.approved_at ? [{
            action: 'approved',
            timestamp: membership.approved_at,
            details: 'Membership approved'
          }] : []),
          {
            action: 'updated',
            timestamp: membership.updated_at,
            details: `Status changed to ${membership.status}, role: ${membership.role}`
          }
        ]
      };
    } catch (error) {
      console.error('Error getting membership history:', error);
      throw error;
    }
  }

  // Invalidate membership-related cache
  async invalidateMembershipCache(communityId) {
    try {
      const cacheKeys = [
        `community:${communityId}:members`,
        `community:${communityId}:pending`,
        `community:${communityId}:member_count`
      ];

      for (const key of cacheKeys) {
        await cache.del(key);
      }
    } catch (error) {
      console.error('Error invalidating membership cache:', error);
    }
  }

  // Get community member count
  async getMemberCount(communityId, status = 'approved') {
    try {
      const whereClause = {
        community_id: communityId
      };

      if (status !== 'all') {
        whereClause.status = status;
      }

      return await Member.count({ where: whereClause });
    } catch (error) {
      console.error('Error getting member count:', error);
      throw error;
    }
  }
}

module.exports = new MembershipService(); 