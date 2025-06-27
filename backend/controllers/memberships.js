const membershipService = require('../services/memberships');

class MembershipController {
  // Apply to join a community
  async applyToCommunity(req, res) {
    try {
      const { id: communityId } = req.params;
      const userId = req.session.userId;
      const applicationData = req.body;

      const membership = await membershipService.applyToCommunity(communityId, userId, applicationData);

      res.status(201).json({
        success: true,
        data: {
          membership,
          message: membership.status === 'approved' 
            ? 'Successfully joined the community!' 
            : 'Application submitted successfully. Waiting for approval.'
        }
      });
    } catch (error) {
      console.error('Apply to community error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('already has a membership')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('maximum member limit')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to apply to community'
      });
    }
  }

  // Get community members
  async getCommunityMembers(req, res) {
    try {
      const { id: communityId } = req.params;
      const {
        page = 1,
        limit = 20,
        status = 'approved',
        role,
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        role,
        search
      };

      const result = await membershipService.getCommunityMembers(communityId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get community members error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get community members'
      });
    }
  }

  // Get pending applications
  async getPendingApplications(req, res) {
    try {
      const { id: communityId } = req.params;
      const {
        page = 1,
        limit = 20,
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search
      };

      const result = await membershipService.getPendingApplications(communityId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get pending applications error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get pending applications'
      });
    }
  }

  // Get user's memberships
  async getUserMemberships(req, res) {
    try {
      const userId = req.session.userId;
      const {
        page = 1,
        limit = 20,
        status = 'approved',
        role
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        role
      };

      const result = await membershipService.getUserMemberships(userId, options);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get user memberships error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to get user memberships'
      });
    }
  }

  // Approve member
  async approveMember(req, res) {
    try {
      const { id: communityId, memberId } = req.params;
      const approvedBy = req.session.userId;

      const membership = await membershipService.approveMember(communityId, memberId, approvedBy);

      res.json({
        success: true,
        data: {
          membership,
          message: 'Member approved successfully'
        }
      });
    } catch (error) {
      console.error('Approve member error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('maximum member limit')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to approve member'
      });
    }
  }

  // Reject member
  async rejectMember(req, res) {
    try {
      const { id: communityId, memberId } = req.params;
      const rejectedBy = req.session.userId;
      const { reason } = req.body;

      const membership = await membershipService.rejectMember(communityId, memberId, rejectedBy, reason);

      res.json({
        success: true,
        data: {
          membership,
          message: 'Member application rejected'
        }
      });
    } catch (error) {
      console.error('Reject member error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to reject member'
      });
    }
  }

  // Remove member
  async removeMember(req, res) {
    try {
      const { id: communityId, memberId } = req.params;
      const removedBy = req.session.userId;

      const membership = await membershipService.removeMember(communityId, memberId, removedBy);

      res.json({
        success: true,
        data: {
          membership,
          message: 'Member removed from community'
        }
      });
    } catch (error) {
      console.error('Remove member error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Cannot remove community owner')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to remove member'
      });
    }
  }

  // Change member role
  async changeMemberRole(req, res) {
    try {
      const { id: communityId, memberId } = req.params;
      const { role } = req.body;
      const changedBy = req.session.userId;

      if (!role) {
        return res.status(400).json({
          success: false,
          error: 'Role is required'
        });
      }

      const membership = await membershipService.changeMemberRole(communityId, memberId, role, changedBy);

      res.json({
        success: true,
        data: {
          membership,
          message: `Member role changed to ${role}`
        }
      });
    } catch (error) {
      console.error('Change member role error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Invalid role')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Cannot change community owner')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to change member role'
      });
    }
  }

  // Get member status
  async getMemberStatus(req, res) {
    try {
      const { id: communityId, memberId } = req.params;

      const membership = await membershipService.getMemberStatus(communityId, memberId);

      res.json({
        success: true,
        data: {
          membership
        }
      });
    } catch (error) {
      console.error('Get member status error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get member status'
      });
    }
  }

  // Update member status
  async updateMemberStatus(req, res) {
    try {
      const { id: communityId, memberId } = req.params;
      const { status } = req.body;
      const updatedBy = req.session.userId;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const membership = await membershipService.updateMemberStatus(communityId, memberId, status, updatedBy);

      res.json({
        success: true,
        data: {
          membership,
          message: `Member status updated to ${status}`
        }
      });
    } catch (error) {
      console.error('Update member status error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Invalid status')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      if (error.message.includes('Cannot change community owner')) {
        return res.status(403).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update member status'
      });
    }
  }

  // Get membership history
  async getMembershipHistory(req, res) {
    try {
      const { id: membershipId } = req.params;

      const result = await membershipService.getMembershipHistory(membershipId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get membership history error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get membership history'
      });
    }
  }

  // Get community member count
  async getMemberCount(req, res) {
    try {
      const { id: communityId } = req.params;
      const { status = 'approved' } = req.query;

      const count = await membershipService.getMemberCount(communityId, status);

      res.json({
        success: true,
        data: {
          count,
          status
        }
      });
    } catch (error) {
      console.error('Get member count error:', error);

      res.status(500).json({
        success: false,
        error: 'Failed to get member count'
      });
    }
  }
}

module.exports = new MembershipController(); 