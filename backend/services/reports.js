const { Op, fn, col, literal } = require('sequelize');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../models');
const analyticsService = require('./analytics');
const redis = require('../redis');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

/**
 * Report Generation Service
 * Handles custom report creation, data export, and report formatting
 */
class ReportService {
  constructor() {
    this.reportTypes = {
      'community_overview': this.generateCommunityOverviewReport.bind(this),
      'voting_summary': this.generateVotingSummaryReport.bind(this),
      'user_activity': this.generateUserActivityReport.bind(this),
      'member_engagement': this.generateMemberEngagementReport.bind(this),
      'custom': this.generateCustomReport.bind(this)
    };
    
    this.exportFormats = {
      'json': this.exportToJSON.bind(this),
      'csv': this.exportToCSV.bind(this),
      'pdf': this.exportToPDF.bind(this)
    };
    
    this.reportsDir = path.join(__dirname, '../reports');
    // Initialize directory asynchronously
    this.ensureReportsDirectory().catch(error => {
      console.error('Failed to ensure reports directory:', error.message);
    });
  }

  /**
   * Ensure reports directory exists
   */
  async ensureReportsDirectory() {
    try {
      await fs.access(this.reportsDir);
    } catch (error) {
      await fs.mkdir(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate community overview report
   */
  async generateCommunityOverviewReport(communityId, filters = {}) {
    try {
      const overview = await analyticsService.getCommunityOverview(communityId, filters);
      const memberEngagement = await analyticsService.getMemberEngagement(communityId, filters);

      const report = {
        report_type: 'community_overview',
        community_id: communityId,
        generated_at: new Date().toISOString(),
        filters: filters,
        summary: {
          total_members: overview.community.member_count,
          total_questions: overview.community.question_count,
          active_members: overview.member_statistics.find(s => s.role === 'member')?.active_count || 0,
          admins: overview.member_statistics.find(s => s.role === 'admin')?.count || 0
        },
        member_statistics: overview.member_statistics,
        voting_statistics: overview.voting_statistics,
        member_growth: memberEngagement.member_growth,
        member_activity: memberEngagement.member_activity,
        recent_activity: overview.recent_activity
      };

      return report;
    } catch (error) {
      console.error('Failed to generate community overview report:', error.message);
      throw error;
    }
  }

  /**
   * Generate voting summary report
   */
  async generateVotingSummaryReport(filters = {}) {
    try {
      const votingAnalytics = await analyticsService.getVotingAnalytics(filters);

      const report = {
        report_type: 'voting_summary',
        generated_at: new Date().toISOString(),
        filters: filters,
        summary: {
          total_votes: votingAnalytics.participation_rates.total_votes || 0,
          unique_voters: votingAnalytics.participation_rates.unique_voters || 0,
          questions_voted_on: votingAnalytics.participation_rates.questions_voted_on || 0,
          avg_votes_per_question: votingAnalytics.participation_rates.total_votes > 0 ? 
            (votingAnalytics.participation_rates.total_votes / votingAnalytics.participation_rates.questions_voted_on).toFixed(2) : 0
        },
        participation_rates: votingAnalytics.participation_rates,
        voting_trends: votingAnalytics.voting_trends,
        question_analytics: votingAnalytics.question_analytics
      };

      return report;
    } catch (error) {
      console.error('Failed to generate voting summary report:', error.message);
      throw error;
    }
  }

  /**
   * Generate user activity report
   */
  async generateUserActivityReport(filters = {}) {
    try {
      const userAnalytics = await analyticsService.getUserAnalytics(filters);

      const report = {
        report_type: 'user_activity',
        generated_at: new Date().toISOString(),
        filters: filters,
        summary: {
          total_users: userAnalytics.user_engagement.length,
          active_users: userAnalytics.user_activity.length,
          avg_communities_per_user: userAnalytics.user_engagement.length > 0 ? 
            (userAnalytics.user_engagement.reduce((sum, user) => sum + parseInt(user.dataValues.community_count), 0) / userAnalytics.user_engagement.length).toFixed(2) : 0,
          avg_votes_per_user: userAnalytics.user_engagement.length > 0 ? 
            (userAnalytics.user_engagement.reduce((sum, user) => sum + parseInt(user.dataValues.vote_count), 0) / userAnalytics.user_engagement.length).toFixed(2) : 0
        },
        user_activity: userAnalytics.user_activity,
        user_engagement: userAnalytics.user_engagement,
        user_retention: userAnalytics.user_retention
      };

      return report;
    } catch (error) {
      console.error('Failed to generate user activity report:', error.message);
      throw error;
    }
  }

  /**
   * Generate member engagement report
   */
  async generateMemberEngagementReport(communityId, filters = {}) {
    try {
      const memberEngagement = await analyticsService.getMemberEngagement(communityId, filters);

      const report = {
        report_type: 'member_engagement',
        community_id: communityId,
        generated_at: new Date().toISOString(),
        filters: filters,
        summary: {
          total_members: memberEngagement.member_growth.reduce((sum, day) => sum + parseInt(day.dataValues.new_members), 0),
          active_members: memberEngagement.member_activity.length,
          avg_activity_per_member: memberEngagement.member_activity.length > 0 ? 
            (memberEngagement.member_activity.reduce((sum, activity) => sum + parseInt(activity.dataValues.activity_count), 0) / memberEngagement.member_activity.length).toFixed(2) : 0
        },
        member_growth: memberEngagement.member_growth,
        member_activity: memberEngagement.member_activity,
        member_retention: memberEngagement.member_retention
      };

      return report;
    } catch (error) {
      console.error('Failed to generate member engagement report:', error.message);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(config) {
    try {
      const { reportType, filters, customMetrics } = config;
      
      let report;
      
      switch (reportType) {
        case 'community_overview':
          report = await this.generateCommunityOverviewReport(filters.communityId, filters);
          break;
        case 'voting_summary':
          report = await this.generateVotingSummaryReport(filters);
          break;
        case 'user_activity':
          report = await this.generateUserActivityReport(filters);
          break;
        case 'member_engagement':
          report = await this.generateMemberEngagementReport(filters.communityId, filters);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      // Add custom metrics if provided
      if (customMetrics && customMetrics.length > 0) {
        report.custom_metrics = await this.calculateCustomMetrics(customMetrics, filters);
      }

      report.report_type = 'custom';
      report.config = config;

      return report;
    } catch (error) {
      console.error('Failed to generate custom report:', error.message);
      throw error;
    }
  }

  /**
   * Calculate custom metrics
   */
  async calculateCustomMetrics(metrics, filters) {
    try {
      const results = {};
      
      for (const metric of metrics) {
        switch (metric.type) {
          case 'user_count':
            results[metric.name] = await User.count({ where: filters });
            break;
          case 'community_count':
            results[metric.name] = await Community.count({ where: filters });
            break;
          case 'vote_count':
            results[metric.name] = await Vote.count({ 
              include: [{ model: VotingQuestion, as: 'VotingQuestion', where: filters }]
            });
            break;
          case 'member_count':
            results[metric.name] = await Member.count({ where: filters });
            break;
          default:
            results[metric.name] = null;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Failed to calculate custom metrics:', error.message);
      return {};
    }
  }

  /**
   * Export report to JSON
   */
  async exportToJSON(report, filename = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFilename = filename || `${report.report_type}_${timestamp}.json`;
      const filepath = path.join(this.reportsDir, reportFilename);
      
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      
      return {
        format: 'json',
        filename: reportFilename,
        filepath: filepath,
        size: (await fs.stat(filepath)).size
      };
    } catch (error) {
      console.error('Failed to export report to JSON:', error.message);
      throw error;
    }
  }

  /**
   * Export report to CSV
   */
  async exportToCSV(report, filename = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFilename = filename || `${report.report_type}_${timestamp}.csv`;
      const filepath = path.join(this.reportsDir, reportFilename);
      
      let csvContent = '';
      
      // Convert report data to CSV format
      if (report.summary) {
        csvContent += 'Summary\n';
        csvContent += 'Metric,Value\n';
        for (const [key, value] of Object.entries(report.summary)) {
          csvContent += `${key},${value}\n`;
        }
        csvContent += '\n';
      }
      
      if (report.member_statistics) {
        csvContent += 'Member Statistics\n';
        csvContent += 'Role,Count,Active Count\n';
        for (const stat of report.member_statistics) {
          csvContent += `${stat.role},${stat.count},${stat.active_count}\n`;
        }
        csvContent += '\n';
      }
      
      if (report.voting_trends) {
        csvContent += 'Voting Trends\n';
        csvContent += 'Date,Votes Cast,Active Voters\n';
        for (const trend of report.voting_trends) {
          csvContent += `${trend.date},${trend.votes_cast},${trend.active_voters}\n`;
        }
        csvContent += '\n';
      }
      
      await fs.writeFile(filepath, csvContent);
      
      return {
        format: 'csv',
        filename: reportFilename,
        filepath: filepath,
        size: (await fs.stat(filepath)).size
      };
    } catch (error) {
      console.error('Failed to export report to CSV:', error.message);
      throw error;
    }
  }

  /**
   * Export report to PDF (placeholder)
   */
  async exportToPDF(report, filename = null) {
    try {
      // This is a placeholder for PDF export
      // In a real implementation, you would use a library like puppeteer or jsPDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFilename = filename || `${report.report_type}_${timestamp}.pdf`;
      const filepath = path.join(this.reportsDir, reportFilename);
      
      // For now, we'll create a simple text file as a placeholder
      const pdfContent = `PDF Export Placeholder\n\nReport: ${report.report_type}\nGenerated: ${report.generated_at}\n\nThis is a placeholder for PDF export functionality.`;
      
      await fs.writeFile(filepath, pdfContent);
      
      return {
        format: 'pdf',
        filename: reportFilename,
        filepath: filepath,
        size: (await fs.stat(filepath)).size,
        note: 'This is a placeholder for PDF export'
      };
    } catch (error) {
      console.error('Failed to export report to PDF:', error.message);
      throw error;
    }
  }

  /**
   * Generate and export report
   */
  async generateAndExportReport(config) {
    try {
      const { reportType, filters, exportFormat = 'json', filename } = config;
      
      // Generate the report
      const report = await this.generateCustomReport({
        reportType,
        filters,
        customMetrics: config.customMetrics || []
      });
      
      // Export the report
      const exportResult = await this.exportFormats[exportFormat](report, filename);
      
      return {
        report: report,
        export: exportResult
      };
    } catch (error) {
      console.error('Failed to generate and export report:', error.message);
      throw error;
    }
  }

  /**
   * Get available report types
   */
  getAvailableReportTypes() {
    return Object.keys(this.reportTypes);
  }

  /**
   * Get available export formats
   */
  getAvailableExportFormats() {
    return Object.keys(this.exportFormats);
  }

  /**
   * List generated reports
   */
  async listReports() {
    try {
      const files = await fs.readdir(this.reportsDir);
      const reports = [];
      
      for (const file of files) {
        const filepath = path.join(this.reportsDir, file);
        const stats = await fs.stat(filepath);
        
        reports.push({
          filename: file,
          filepath: filepath,
          size: stats.size,
          created_at: stats.birthtime,
          modified_at: stats.mtime
        });
      }
      
      return reports.sort((a, b) => b.modified_at - a.modified_at);
    } catch (error) {
      console.error('Failed to list reports:', error.message);
      return [];
    }
  }

  /**
   * Delete report file
   */
  async deleteReport(filename) {
    try {
      const filepath = path.join(this.reportsDir, filename);
      await fs.unlink(filepath);
      return { success: true, message: `Report ${filename} deleted successfully` };
    } catch (error) {
      console.error('Failed to delete report:', error.message);
      throw error;
    }
  }

  /**
   * Get report file content
   */
  async getReportContent(filename) {
    try {
      const filepath = path.join(this.reportsDir, filename);
      const content = await fs.readFile(filepath, 'utf8');
      
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.json') {
        return JSON.parse(content);
      }
      
      return content;
    } catch (error) {
      console.error('Failed to get report content:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const reportService = new ReportService();

module.exports = reportService; 