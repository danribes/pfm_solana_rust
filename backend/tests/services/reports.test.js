const reportService = require('../../services/reports');
const analyticsService = require('../../services/analytics');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../../models');
const fs = require('fs').promises;
const path = require('path');

// Mock dependencies
jest.mock('../../services/analytics');
jest.mock('fs').promises;

describe('Report Service', () => {
  let testUser, testCommunity, testQuestion;

  beforeEach(async () => {
    // Clear database
    await Analytics.destroy({ where: {} });
    await Vote.destroy({ where: {} });
    await VotingQuestion.destroy({ where: {} });
    await Member.destroy({ where: {} });
    await Community.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test data
    testUser = await User.create({
      wallet_address: 'test-wallet-address',
      username: 'testuser',
      status: 'active'
    });

    testCommunity = await Community.create({
      on_chain_id: 'test-community-123',
      name: 'Test Community',
      description: 'A test community',
      created_by: testUser.id,
      status: 'active'
    });

    testQuestion = await VotingQuestion.create({
      on_chain_id: 'test-question-123',
      community_id: testCommunity.id,
      title: 'Test Question',
      description: 'A test question',
      options: JSON.stringify(['Option 1', 'Option 2']),
      deadline: new Date(Date.now() + 86400000),
      created_by: testUser.id,
      status: 'active'
    });

    // Mock fs.promises
    fs.access = jest.fn();
    fs.mkdir = jest.fn();
    fs.writeFile = jest.fn();
    fs.readdir = jest.fn();
    fs.stat = jest.fn();
    fs.unlink = jest.fn();
    fs.readFile = jest.fn();
  });

  describe('generateCommunityOverviewReport', () => {
    it('should generate community overview report', async () => {
      // Mock analytics service responses
      const mockOverview = {
        community: {
          id: testCommunity.id,
          name: 'Test Community',
          member_count: 5,
          question_count: 3
        },
        member_statistics: [
          { role: 'member', count: 4, active_count: 3 },
          { role: 'admin', count: 1, active_count: 1 }
        ],
        voting_statistics: { total_questions: 3, total_votes: 10 },
        recent_activity: []
      };

      const mockEngagement = {
        member_growth: [],
        member_activity: [],
        member_retention: []
      };

      analyticsService.getCommunityOverview.mockResolvedValue(mockOverview);
      analyticsService.getMemberEngagement.mockResolvedValue(mockEngagement);

      const result = await reportService.generateCommunityOverviewReport(testCommunity.id, {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(result).toHaveProperty('report_type', 'community_overview');
      expect(result).toHaveProperty('community_id', testCommunity.id);
      expect(result).toHaveProperty('generated_at');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('member_statistics');
      expect(result).toHaveProperty('voting_statistics');
      expect(result).toHaveProperty('member_growth');
      expect(result).toHaveProperty('member_activity');
      expect(result).toHaveProperty('recent_activity');

      expect(result.summary.total_members).toBe(5);
      expect(result.summary.total_questions).toBe(3);
      expect(result.summary.active_members).toBe(3);
      expect(result.summary.admins).toBe(1);
    });

    it('should handle analytics service errors', async () => {
      analyticsService.getCommunityOverview.mockRejectedValue(new Error('Analytics error'));

      await expect(
        reportService.generateCommunityOverviewReport(testCommunity.id)
      ).rejects.toThrow('Analytics error');
    });
  });

  describe('generateVotingSummaryReport', () => {
    it('should generate voting summary report', async () => {
      const mockAnalytics = {
        participation_rates: {
          total_votes: 50,
          unique_voters: 25,
          questions_voted_on: 10
        },
        voting_trends: [],
        question_analytics: []
      };

      analyticsService.getVotingAnalytics.mockResolvedValue(mockAnalytics);

      const result = await reportService.generateVotingSummaryReport({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(result).toHaveProperty('report_type', 'voting_summary');
      expect(result).toHaveProperty('generated_at');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('participation_rates');
      expect(result).toHaveProperty('voting_trends');
      expect(result).toHaveProperty('question_analytics');

      expect(result.summary.total_votes).toBe(50);
      expect(result.summary.unique_voters).toBe(25);
      expect(result.summary.questions_voted_on).toBe(10);
      expect(result.summary.avg_votes_per_question).toBe('5.00');
    });

    it('should handle zero votes correctly', async () => {
      const mockAnalytics = {
        participation_rates: {
          total_votes: 0,
          unique_voters: 0,
          questions_voted_on: 0
        },
        voting_trends: [],
        question_analytics: []
      };

      analyticsService.getVotingAnalytics.mockResolvedValue(mockAnalytics);

      const result = await reportService.generateVotingSummaryReport();

      expect(result.summary.avg_votes_per_question).toBe(0);
    });
  });

  describe('generateUserActivityReport', () => {
    it('should generate user activity report', async () => {
      const mockAnalytics = {
        user_activity: [],
        user_engagement: [
          {
            dataValues: {
              community_count: 2,
              vote_count: 5,
              question_count: 1
            }
          },
          {
            dataValues: {
              community_count: 1,
              vote_count: 3,
              question_count: 0
            }
          }
        ],
        user_retention: []
      };

      analyticsService.getUserAnalytics.mockResolvedValue(mockAnalytics);

      const result = await reportService.generateUserActivityReport({
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(result).toHaveProperty('report_type', 'user_activity');
      expect(result).toHaveProperty('generated_at');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('user_activity');
      expect(result).toHaveProperty('user_engagement');
      expect(result).toHaveProperty('user_retention');

      expect(result.summary.total_users).toBe(2);
      expect(result.summary.active_users).toBe(0);
      expect(result.summary.avg_communities_per_user).toBe('1.50');
      expect(result.summary.avg_votes_per_user).toBe('4.00');
    });

    it('should handle empty user engagement correctly', async () => {
      const mockAnalytics = {
        user_activity: [],
        user_engagement: [],
        user_retention: []
      };

      analyticsService.getUserAnalytics.mockResolvedValue(mockAnalytics);

      const result = await reportService.generateUserActivityReport();

      expect(result.summary.avg_communities_per_user).toBe(0);
      expect(result.summary.avg_votes_per_user).toBe(0);
    });
  });

  describe('generateMemberEngagementReport', () => {
    it('should generate member engagement report', async () => {
      const mockEngagement = {
        member_growth: [],
        member_activity: [
          {
            dataValues: {
              activity_count: 10
            }
          },
          {
            dataValues: {
              activity_count: 5
            }
          }
        ],
        member_retention: []
      };

      analyticsService.getMemberEngagement.mockResolvedValue(mockEngagement);

      const result = await reportService.generateMemberEngagementReport(testCommunity.id, {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z'
      });

      expect(result).toHaveProperty('report_type', 'member_engagement');
      expect(result).toHaveProperty('community_id', testCommunity.id);
      expect(result).toHaveProperty('generated_at');
      expect(result).toHaveProperty('filters');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('member_growth');
      expect(result).toHaveProperty('member_activity');
      expect(result).toHaveProperty('member_retention');

      expect(result.summary.total_members).toBe(0);
      expect(result.summary.active_members).toBe(2);
      expect(result.summary.avg_activity_per_member).toBe('7.50');
    });
  });

  describe('generateCustomReport', () => {
    it('should generate custom report with community overview', async () => {
      const mockOverview = {
        community: { id: testCommunity.id, name: 'Test Community' },
        member_statistics: [],
        voting_statistics: {},
        recent_activity: []
      };

      analyticsService.getCommunityOverview.mockResolvedValue(mockOverview);
      analyticsService.getMemberEngagement.mockResolvedValue({
        member_growth: [],
        member_activity: [],
        member_retention: []
      });

      const config = {
        reportType: 'community_overview',
        filters: {
          communityId: testCommunity.id,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z'
        },
        customMetrics: [
          { name: 'total_users', type: 'user_count' },
          { name: 'total_votes', type: 'vote_count' }
        ]
      };

      const result = await reportService.generateCustomReport(config);

      expect(result).toHaveProperty('report_type', 'custom');
      expect(result).toHaveProperty('config', config);
      expect(result).toHaveProperty('custom_metrics');
    });

    it('should handle invalid report type', async () => {
      const config = {
        reportType: 'invalid_type',
        filters: {}
      };

      await expect(
        reportService.generateCustomReport(config)
      ).rejects.toThrow('Unknown report type: invalid_type');
    });
  });

  describe('calculateCustomMetrics', () => {
    it('should calculate user count metric', async () => {
      const metrics = [{ name: 'total_users', type: 'user_count' }];
      const filters = { status: 'active' };

      const result = await reportService.calculateCustomMetrics(metrics, filters);

      expect(result).toHaveProperty('total_users');
      expect(typeof result.total_users).toBe('number');
    });

    it('should calculate community count metric', async () => {
      const metrics = [{ name: 'total_communities', type: 'community_count' }];
      const filters = { status: 'active' };

      const result = await reportService.calculateCustomMetrics(metrics, filters);

      expect(result).toHaveProperty('total_communities');
      expect(typeof result.total_communities).toBe('number');
    });

    it('should calculate vote count metric', async () => {
      const metrics = [{ name: 'total_votes', type: 'vote_count' }];
      const filters = { community_id: testCommunity.id };

      const result = await reportService.calculateCustomMetrics(metrics, filters);

      expect(result).toHaveProperty('total_votes');
      expect(typeof result.total_votes).toBe('number');
    });

    it('should calculate member count metric', async () => {
      const metrics = [{ name: 'total_members', type: 'member_count' }];
      const filters = { community_id: testCommunity.id };

      const result = await reportService.calculateCustomMetrics(metrics, filters);

      expect(result).toHaveProperty('total_members');
      expect(typeof result.total_members).toBe('number');
    });

    it('should handle unknown metric type', async () => {
      const metrics = [{ name: 'unknown_metric', type: 'unknown_type' }];
      const filters = {};

      const result = await reportService.calculateCustomMetrics(metrics, filters);

      expect(result).toHaveProperty('unknown_metric', null);
    });

    it('should handle errors gracefully', async () => {
      const metrics = [{ name: 'test_metric', type: 'user_count' }];
      const filters = { invalid_field: 'invalid_value' };

      const result = await reportService.calculateCustomMetrics(metrics, filters);

      expect(result).toHaveProperty('test_metric');
    });
  });

  describe('exportToJSON', () => {
    it('should export report to JSON', async () => {
      const report = {
        report_type: 'test_report',
        data: { test: 'value' }
      };

      fs.stat.mockResolvedValue({ size: 1024 });

      const result = await reportService.exportToJSON(report, 'test-report.json');

      expect(result).toHaveProperty('format', 'json');
      expect(result).toHaveProperty('filename', 'test-report.json');
      expect(result).toHaveProperty('filepath');
      expect(result).toHaveProperty('size', 1024);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should generate filename if not provided', async () => {
      const report = { report_type: 'test_report' };
      fs.stat.mockResolvedValue({ size: 512 });

      const result = await reportService.exportToJSON(report);

      expect(result).toHaveProperty('filename');
      expect(result.filename).toContain('test_report');
      expect(result.filename).toContain('.json');
    });

    it('should handle file system errors', async () => {
      const report = { report_type: 'test_report' };
      fs.writeFile.mockRejectedValue(new Error('File system error'));

      await expect(
        reportService.exportToJSON(report)
      ).rejects.toThrow('File system error');
    });
  });

  describe('exportToCSV', () => {
    it('should export report to CSV', async () => {
      const report = {
        summary: {
          total_members: 10,
          total_questions: 5
        },
        member_statistics: [
          { role: 'member', count: 8, active_count: 6 },
          { role: 'admin', count: 2, active_count: 2 }
        ],
        voting_trends: [
          { date: '2024-01-01', votes_cast: 10, active_voters: 8 },
          { date: '2024-01-02', votes_cast: 15, active_voters: 12 }
        ]
      };

      fs.stat.mockResolvedValue({ size: 2048 });

      const result = await reportService.exportToCSV(report, 'test-report.csv');

      expect(result).toHaveProperty('format', 'csv');
      expect(result).toHaveProperty('filename', 'test-report.csv');
      expect(result).toHaveProperty('filepath');
      expect(result).toHaveProperty('size', 2048);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should generate filename if not provided', async () => {
      const report = { report_type: 'test_report' };
      fs.stat.mockResolvedValue({ size: 1024 });

      const result = await reportService.exportToCSV(report);

      expect(result).toHaveProperty('filename');
      expect(result.filename).toContain('test_report');
      expect(result.filename).toContain('.csv');
    });
  });

  describe('exportToPDF', () => {
    it('should export report to PDF (placeholder)', async () => {
      const report = { report_type: 'test_report' };
      fs.stat.mockResolvedValue({ size: 1536 });

      const result = await reportService.exportToPDF(report, 'test-report.pdf');

      expect(result).toHaveProperty('format', 'pdf');
      expect(result).toHaveProperty('filename', 'test-report.pdf');
      expect(result).toHaveProperty('filepath');
      expect(result).toHaveProperty('size', 1536);
      expect(result).toHaveProperty('note', 'This is a placeholder for PDF export');
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('generateAndExportReport', () => {
    it('should generate and export report', async () => {
      const mockOverview = {
        community: { id: testCommunity.id, name: 'Test Community' },
        member_statistics: [],
        voting_statistics: {},
        recent_activity: []
      };

      analyticsService.getCommunityOverview.mockResolvedValue(mockOverview);
      analyticsService.getMemberEngagement.mockResolvedValue({
        member_growth: [],
        member_activity: [],
        member_retention: []
      });

      fs.stat.mockResolvedValue({ size: 1024 });

      const config = {
        reportType: 'community_overview',
        filters: { communityId: testCommunity.id },
        exportFormat: 'json',
        filename: 'test-report.json'
      };

      const result = await reportService.generateAndExportReport(config);

      expect(result).toHaveProperty('report');
      expect(result).toHaveProperty('export');
      expect(result.report).toHaveProperty('report_type', 'community_overview');
      expect(result.export).toHaveProperty('format', 'json');
    });

    it('should handle generation errors', async () => {
      analyticsService.getCommunityOverview.mockRejectedValue(new Error('Generation error'));

      const config = {
        reportType: 'community_overview',
        filters: { communityId: testCommunity.id },
        exportFormat: 'json'
      };

      await expect(
        reportService.generateAndExportReport(config)
      ).rejects.toThrow('Generation error');
    });
  });

  describe('listReports', () => {
    it('should list generated reports', async () => {
      const mockFiles = ['report1.json', 'report2.csv', 'report3.pdf'];
      const mockStats = [
        { size: 1024, birthtime: new Date(), mtime: new Date() },
        { size: 2048, birthtime: new Date(), mtime: new Date() },
        { size: 3072, birthtime: new Date(), mtime: new Date() }
      ];

      fs.readdir.mockResolvedValue(mockFiles);
      fs.stat
        .mockResolvedValueOnce(mockStats[0])
        .mockResolvedValueOnce(mockStats[1])
        .mockResolvedValueOnce(mockStats[2]);

      const result = await reportService.listReports();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toHaveProperty('filename');
      expect(result[0]).toHaveProperty('filepath');
      expect(result[0]).toHaveProperty('size');
      expect(result[0]).toHaveProperty('created_at');
      expect(result[0]).toHaveProperty('modified_at');
    });

    it('should handle empty reports directory', async () => {
      fs.readdir.mockResolvedValue([]);

      const result = await reportService.listReports();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle file system errors', async () => {
      fs.readdir.mockRejectedValue(new Error('File system error'));

      const result = await reportService.listReports();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('deleteReport', () => {
    it('should delete report file', async () => {
      const filename = 'test-report.json';

      const result = await reportService.deleteReport(filename);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should handle file system errors', async () => {
      const filename = 'test-report.json';
      fs.unlink.mockRejectedValue(new Error('File not found'));

      await expect(
        reportService.deleteReport(filename)
      ).rejects.toThrow('File not found');
    });
  });

  describe('getReportContent', () => {
    it('should get JSON report content', async () => {
      const filename = 'test-report.json';
      const content = JSON.stringify({ test: 'data' });

      fs.readFile.mockResolvedValue(content);

      const result = await reportService.getReportContent(filename);

      expect(result).toEqual({ test: 'data' });
    });

    it('should get CSV report content', async () => {
      const filename = 'test-report.csv';
      const content = 'header1,header2\nvalue1,value2';

      fs.readFile.mockResolvedValue(content);

      const result = await reportService.getReportContent(filename);

      expect(result).toBe(content);
    });

    it('should handle file system errors', async () => {
      const filename = 'test-report.json';
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(
        reportService.getReportContent(filename)
      ).rejects.toThrow('File not found');
    });
  });

  describe('getAvailableReportTypes', () => {
    it('should return available report types', () => {
      const result = reportService.getAvailableReportTypes();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('community_overview');
      expect(result).toContain('voting_summary');
      expect(result).toContain('user_activity');
      expect(result).toContain('member_engagement');
    });
  });

  describe('getAvailableExportFormats', () => {
    it('should return available export formats', () => {
      const result = reportService.getAvailableExportFormats();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('json');
      expect(result).toContain('csv');
      expect(result).toContain('pdf');
    });
  });
}); 