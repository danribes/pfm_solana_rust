const communityService = require('../services/communities');

class CommunityController {
  /**
   * Create a new community
   * POST /api/communities
   */
  async createCommunity(req, res) {
    try {
      const userId = req.session.userId;
      const communityData = req.body;

      const community = await communityService.createCommunity(communityData, userId);

      res.status(201).json({
        success: true,
        message: 'Community created successfully',
        data: community
      });
    } catch (error) {
      console.error('Create community controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create community'
      });
    }
  }

  /**
   * Get communities with filtering and pagination
   * GET /api/communities
   */
  async getCommunities(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        sort_by,
        sort_order
      } = req.query;

      const filters = {
        search,
        status,
        sort_by,
        sort_order
      };

      const result = await communityService.getCommunities(filters, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result.communities,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get communities controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get communities'
      });
    }
  }

  /**
   * Get community by ID
   * GET /api/communities/:id
   */
  async getCommunityById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;

      const community = await communityService.getCommunityById(id, userId);

      if (!community) {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      res.json({
        success: true,
        data: community
      });
    } catch (error) {
      console.error('Get community by ID controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get community'
      });
    }
  }

  /**
   * Update community
   * PUT /api/communities/:id
   */
  async updateCommunity(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      const updateData = req.body;

      const community = await communityService.updateCommunity(id, updateData, userId);

      res.json({
        success: true,
        message: 'Community updated successfully',
        data: community
      });
    } catch (error) {
      console.error('Update community controller error:', error);
      
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update this community'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update community'
      });
    }
  }

  /**
   * Delete community
   * DELETE /api/communities/:id
   */
  async deleteCommunity(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;

      await communityService.deleteCommunity(id, userId);

      res.json({
        success: true,
        message: 'Community deleted successfully'
      });
    } catch (error) {
      console.error('Delete community controller error:', error);
      
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      if (error.message === 'Only community owner can delete the community') {
        return res.status(403).json({
          success: false,
          error: 'Only community owner can delete the community'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete community'
      });
    }
  }

  /**
   * Get community configuration
   * GET /api/communities/:id/config
   */
  async getConfiguration(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;

      const community = await communityService.getCommunityById(id, userId);

      if (!community) {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      const config = {
        require_approval: community.require_approval,
        allow_public_voting: community.allow_public_voting,
        max_members: community.max_members,
        voting_threshold: community.voting_threshold
      };

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Get configuration controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get configuration'
      });
    }
  }

  /**
   * Update community configuration
   * PUT /api/communities/:id/config
   */
  async updateConfiguration(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.userId;
      const configData = req.body;

      const community = await communityService.updateConfiguration(id, configData, userId);

      res.json({
        success: true,
        message: 'Configuration updated successfully',
        data: community
      });
    } catch (error) {
      console.error('Update configuration controller error:', error);
      
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to update configuration'
        });
      }

      if (error.message === 'Max members cannot be less than current member count') {
        return res.status(400).json({
          success: false,
          error: 'Max members cannot be less than current member count'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update configuration'
      });
    }
  }

  /**
   * Validate community configuration
   * POST /api/communities/:id/config/validate
   */
  async validateConfiguration(req, res) {
    try {
      const { id } = req.params;
      const configData = req.body;

      const validation = await communityService.validateConfiguration(id, configData);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Validate configuration controller error:', error);
      
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to validate configuration'
      });
    }
  }

  /**
   * Get community analytics
   * GET /api/communities/:id/analytics
   */
  async getAnalytics(req, res) {
    try {
      const { id } = req.params;
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        period: req.query.period
      };

      const analytics = await communityService.getAnalytics(id, filters);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get analytics controller error:', error);
      
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          error: 'Community not found'
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get analytics'
      });
    }
  }

  /**
   * Get member statistics
   * GET /api/communities/:id/members/stats
   */
  async getMemberStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await communityService.getMemberStats(id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get member stats controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get member statistics'
      });
    }
  }

  /**
   * Get voting statistics
   * GET /api/communities/:id/voting/stats
   */
  async getVotingStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await communityService.getVotingStats(id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get voting stats controller error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get voting statistics'
      });
    }
  }
}

module.exports = new CommunityController(); 