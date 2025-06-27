const analyticsService = require('../services/analytics');
const reportService = require('../services/reports');
const { validationResult } = require('express-validator');

/**
 * Analytics Controller
 * Handles HTTP requests for analytics endpoints
 */
class AnalyticsController {
  /**
   * Get community analytics
   */
  async getCommunityAnalytics(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const filters = {
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        limit: parseInt(req.query.limit) || 10
      };

      const analytics = await analyticsService.getCommunityAnalytics(filters);

      res.json({
        success: true,
        data: analytics,
        message: 'Community analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve community analytics',
        error: error.message
      });
    }
  }

  /**
   * Get community overview
   */
  async getCommunityOverview(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const filters = {
        startDate: req.query.start_date,
        endDate: req.query.end_date
      };

      const overview = await analyticsService.getCommunityOverview(id, filters);

      res.json({
        success: true,
        data: overview,
        message: 'Community overview retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve community overview',
        error: error.message
      });
    }
  }

  /**
   * Get member engagement analytics
   */
  async getMemberEngagement(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const filters = {
        startDate: req.query.start_date,
        endDate: req.query.end_date
      };

      const engagement = await analyticsService.getMemberEngagement(id, filters);

      res.json({
        success: true,
        data: engagement,
        message: 'Member engagement analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve member engagement analytics',
        error: error.message
      });
    }
  }

  /**
   * Get voting analytics
   */
  async getVotingAnalytics(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const filters = {
        startDate: req.query.start_date,
        endDate: req.query.end_date,
        communityId: req.query.community_id
      };

      const analytics = await analyticsService.getVotingAnalytics(filters);

      res.json({
        success: true,
        data: analytics,
        message: 'Voting analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve voting analytics',
        error: error.message
      });
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const filters = {
        startDate: req.query.start_date,
        endDate: req.query.end_date
      };

      const analytics = await analyticsService.getUserAnalytics(filters);

      res.json({
        success: true,
        data: analytics,
        message: 'User analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user analytics',
        error: error.message
      });
    }
  }

  /**
   * Get question-specific analytics
   */
  async getQuestionAnalytics(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const analytics = await analyticsService.getQuestionAnalytics(id);

      res.json({
        success: true,
        data: analytics,
        message: 'Question analytics retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      
      if (error.message === 'Question not found') {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve question analytics',
        error: error.message
      });
    }
  }

  /**
   * Generate community report
   */
  async generateCommunityReport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { format = 'json', filename } = req.body;
      const filters = {
        startDate: req.body.start_date,
        endDate: req.body.end_date
      };

      const result = await reportService.generateAndExportReport({
        reportType: 'community_overview',
        filters: { ...filters, communityId: id },
        exportFormat: format,
        filename
      });

      res.json({
        success: true,
        data: result,
        message: 'Community report generated successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate community report',
        error: error.message
      });
    }
  }

  /**
   * Generate voting report
   */
  async generateVotingReport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { format = 'json', filename } = req.body;
      const filters = {
        startDate: req.body.start_date,
        endDate: req.body.end_date,
        communityId: req.body.community_id
      };

      const result = await reportService.generateAndExportReport({
        reportType: 'voting_summary',
        filters,
        exportFormat: format,
        filename
      });

      res.json({
        success: true,
        data: result,
        message: 'Voting report generated successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate voting report',
        error: error.message
      });
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { reportType, filters, customMetrics, format = 'json', filename } = req.body;

      const result = await reportService.generateAndExportReport({
        reportType,
        filters,
        customMetrics,
        exportFormat: format,
        filename
      });

      res.json({
        success: true,
        data: result,
        message: 'Custom report generated successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate custom report',
        error: error.message
      });
    }
  }

  /**
   * List available reports
   */
  async listReports(req, res) {
    try {
      const reports = await reportService.listReports();

      res.json({
        success: true,
        data: reports,
        message: 'Reports listed successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to list reports',
        error: error.message
      });
    }
  }

  /**
   * Download report
   */
  async downloadReport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { filename } = req.params;
      const content = await reportService.getReportContent(filename);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to download report',
        error: error.message
      });
    }
  }

  /**
   * Delete report
   */
  async deleteReport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { filename } = req.params;
      const result = await reportService.deleteReport(filename);

      res.json({
        success: true,
        data: result,
        message: 'Report deleted successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report',
        error: error.message
      });
    }
  }

  /**
   * Get analytics cache statistics
   */
  async getCacheStats(req, res) {
    try {
      const stats = await analyticsService.getCacheStats();

      res.json({
        success: true,
        data: stats,
        message: 'Cache statistics retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cache statistics',
        error: error.message
      });
    }
  }

  /**
   * Clear analytics cache
   */
  async clearCache(req, res) {
    try {
      const { pattern } = req.body;
      await analyticsService.clearCache(pattern);

      res.json({
        success: true,
        message: 'Analytics cache cleared successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to clear analytics cache',
        error: error.message
      });
    }
  }

  /**
   * Get available report types
   */
  async getReportTypes(req, res) {
    try {
      const reportTypes = reportService.getAvailableReportTypes();
      const exportFormats = reportService.getAvailableExportFormats();

      res.json({
        success: true,
        data: {
          report_types: reportTypes,
          export_formats: exportFormats
        },
        message: 'Available report types and formats retrieved successfully'
      });

    } catch (error) {
      console.error('Analytics controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available report types',
        error: error.message
      });
    }
  }
}

// Create singleton instance
const analyticsController = new AnalyticsController();

module.exports = analyticsController; 