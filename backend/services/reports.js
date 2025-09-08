const { Op, fn, col, literal } = require('sequelize');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../models');
const analyticsService = require('./analytics');
const redis = require('../redis');
const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
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
      'pdf': this.exportToPDF.bind(this),
      'xlsx': this.exportToExcel.bind(this)
    };
    
    this.reportsDir = path.join(__dirname, '../reports');
    this.ensureReportsDirectory();
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
   * Export report to Excel format with proper formatting and multiple sheets
   */
  async exportToExcel(report, filename = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFilename = filename || `${report.report_type}_${timestamp}.xlsx`;
      const filepath = path.join(this.reportsDir, reportFilename);
      
      // Create a new workbook using ExcelJS for better formatting
      const workbook = new ExcelJS.Workbook();
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.creator = 'PFM Community Management System';
      
      // Add summary worksheet
      const summaryWorksheet = workbook.addWorksheet('Summary');
      await this.createSummarySheet(summaryWorksheet, report);
      
      // Add data sheets based on report type
      if (report.member_statistics && report.member_statistics.length > 0) {
        const memberStatsSheet = workbook.addWorksheet('Member Statistics');
        await this.createMemberStatsSheet(memberStatsSheet, report.member_statistics);
      }
      
      if (report.voting_trends && report.voting_trends.length > 0) {
        const votingTrendsSheet = workbook.addWorksheet('Voting Trends');
        await this.createVotingTrendsSheet(votingTrendsSheet, report.voting_trends);
      }
      
      if (report.user_activity && report.user_activity.length > 0) {
        const userActivitySheet = workbook.addWorksheet('User Activity');
        await this.createUserActivitySheet(userActivitySheet, report.user_activity);
      }
      
      if (report.member_activity && report.member_activity.length > 0) {
        const memberActivitySheet = workbook.addWorksheet('Member Activity');
        await this.createMemberActivitySheet(memberActivitySheet, report.member_activity);
      }
      
      // Save the workbook
      await workbook.xlsx.writeFile(filepath);
      
      return {
        format: 'xlsx',
        filename: reportFilename,
        filepath: filepath,
        size: (await fs.stat(filepath)).size,
        sheets: workbook.worksheets.map(ws => ws.name)
      };
    } catch (error) {
      console.error('Failed to export report to Excel:', error.message);
      throw error;
    }
  }

  /**
   * Create formatted summary sheet
   */
  async createSummarySheet(worksheet, report) {
    // Set column widths
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];
    
    // Add title
    worksheet.addRow(['Report Summary', '']);
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.mergeCells('A1:B1');
    
    // Add report metadata
    worksheet.addRow(['Report Type', report.report_type]);
    worksheet.addRow(['Generated At', new Date(report.generated_at).toLocaleString()]);
    if (report.community_id) {
      worksheet.addRow(['Community ID', report.community_id]);
    }
    worksheet.addRow(['', '']); // Empty row
    
    // Add summary data
    if (report.summary) {
      worksheet.addRow(['Key Metrics', '']);
      worksheet.getCell(`A${worksheet.rowCount}`).font = { bold: true };
      
      for (const [key, value] of Object.entries(report.summary)) {
        worksheet.addRow([this.formatMetricName(key), value]);
      }
    }
    
    // Apply styling
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(column.width || 0, 15);
    });
  }

  /**
   * Create member statistics sheet
   */
  async createMemberStatsSheet(worksheet, memberStats) {
    worksheet.columns = [
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Total Count', key: 'count', width: 15 },
      { header: 'Active Count', key: 'active_count', width: 15 }
    ];
    
    // Add header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    
    // Add data
    memberStats.forEach(stat => {
      worksheet.addRow({
        role: stat.role,
        count: stat.count,
        active_count: stat.active_count
      });
    });
  }

  /**
   * Create voting trends sheet
   */
  async createVotingTrendsSheet(worksheet, votingTrends) {
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Votes Cast', key: 'votes_cast', width: 15 },
      { header: 'Active Voters', key: 'active_voters', width: 15 }
    ];
    
    // Add header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    
    // Add data
    votingTrends.forEach(trend => {
      worksheet.addRow({
        date: trend.date,
        votes_cast: trend.votes_cast,
        active_voters: trend.active_voters
      });
    });
  }

  /**
   * Create user activity sheet
   */
  async createUserActivitySheet(worksheet, userActivity) {
    worksheet.columns = [
      { header: 'User ID', key: 'user_id', width: 20 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Activity Count', key: 'activity_count', width: 15 },
      { header: 'Last Activity', key: 'last_activity', width: 20 }
    ];
    
    // Add header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    
    // Add data
    userActivity.forEach(activity => {
      worksheet.addRow({
        user_id: activity.user_id || activity.id,
        username: activity.username || 'N/A',
        activity_count: activity.activity_count || activity.dataValues?.activity_count || 0,
        last_activity: activity.last_activity || activity.dataValues?.last_activity || 'N/A'
      });
    });
  }

  /**
   * Create member activity sheet
   */
  async createMemberActivitySheet(worksheet, memberActivity) {
    worksheet.columns = [
      { header: 'Member ID', key: 'member_id', width: 20 },
      { header: 'User ID', key: 'user_id', width: 20 },
      { header: 'Activity Count', key: 'activity_count', width: 15 },
      { header: 'Join Date', key: 'join_date', width: 20 }
    ];
    
    // Add header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    
    // Add data
    memberActivity.forEach(activity => {
      worksheet.addRow({
        member_id: activity.member_id || activity.id,
        user_id: activity.user_id,
        activity_count: activity.activity_count || activity.dataValues?.activity_count || 0,
        join_date: activity.join_date || activity.createdAt || 'N/A'
      });
    });
  }

  /**
   * Helper method to format metric names for display
   */
  formatMetricName(metricName) {
    return metricName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Analyze Excel file structure
   * @param {string|Buffer} filePath - Path to Excel file or Buffer containing file data
   * @returns {Object} Analysis results including sheets, columns, data types, etc.
   */
  async analyzeExcelStructure(filePath) {
    try {
      let workbook;
      
      // Read the Excel file
      if (Buffer.isBuffer(filePath)) {
        workbook = XLSX.read(filePath, { type: 'buffer' });
      } else {
        workbook = XLSX.readFile(filePath);
      }
      
      const analysis = {
        filename: Buffer.isBuffer(filePath) ? 'uploaded_file' : path.basename(filePath),
        analyzed_at: new Date().toISOString(),
        total_sheets: workbook.SheetNames.length,
        sheets: []
      };
      
      // Analyze each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const sheetAnalysis = await this.analyzeWorksheet(worksheet, sheetName);
        analysis.sheets.push(sheetAnalysis);
      }
      
      // Calculate overall statistics
      analysis.summary = {
        total_cells: analysis.sheets.reduce((sum, sheet) => sum + sheet.total_cells, 0),
        total_rows: analysis.sheets.reduce((sum, sheet) => sum + sheet.row_count, 0),
        total_columns: analysis.sheets.reduce((sum, sheet) => sum + sheet.column_count, 0),
        has_headers: analysis.sheets.some(sheet => sheet.has_headers),
        data_types_found: [...new Set(analysis.sheets.flatMap(sheet => sheet.data_types))]
      };
      
      return analysis;
    } catch (error) {
      console.error('Failed to analyze Excel file structure:', error.message);
      throw new Error(`Excel analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze individual worksheet structure
   * @param {Object} worksheet - XLSX worksheet object
   * @param {string} sheetName - Name of the sheet
   * @returns {Object} Sheet analysis results
   */
  async analyzeWorksheet(worksheet, sheetName) {
    try {
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      
      const analysis = {
        name: sheetName,
        row_count: range.e.r + 1,
        column_count: range.e.c + 1,
        total_cells: (range.e.r + 1) * (range.e.c + 1),
        has_data: sheetData.length > 0,
        has_headers: false,
        columns: [],
        data_types: [],
        sample_data: []
      };
      
      if (sheetData.length > 0) {
        // Analyze first row to detect headers
        const firstRow = sheetData[0];
        const secondRow = sheetData.length > 1 ? sheetData[1] : [];
        
        analysis.has_headers = this.detectHeaders(firstRow, secondRow);
        
        // Get column letters
        const columnLetters = this.getColumnLetters(analysis.column_count);
        
        // Analyze each column
        for (let colIndex = 0; colIndex < analysis.column_count; colIndex++) {
          const columnLetter = columnLetters[colIndex];
          const columnAnalysis = this.analyzeColumn(sheetData, colIndex, analysis.has_headers);
          
          analysis.columns.push({
            letter: columnLetter,
            index: colIndex,
            header: analysis.has_headers ? (firstRow[colIndex] || `Column ${columnLetter}`) : `Column ${columnLetter}`,
            ...columnAnalysis
          });
          
          // Add unique data types to sheet analysis
          if (columnAnalysis.data_type && !analysis.data_types.includes(columnAnalysis.data_type)) {
            analysis.data_types.push(columnAnalysis.data_type);
          }
        }
        
        // Get sample data (first 5 rows, excluding header if present)
        const startRow = analysis.has_headers ? 1 : 0;
        analysis.sample_data = sheetData.slice(startRow, startRow + 5);
      }
      
      return analysis;
    } catch (error) {
      console.error(`Failed to analyze worksheet ${sheetName}:`, error.message);
      throw error;
    }
  }

  /**
   * Analyze individual column data
   * @param {Array} sheetData - Sheet data as array of arrays
   * @param {number} colIndex - Column index
   * @param {boolean} hasHeaders - Whether sheet has headers
   * @returns {Object} Column analysis results
   */
  analyzeColumn(sheetData, colIndex, hasHeaders) {
    const startRow = hasHeaders ? 1 : 0;
    const columnValues = sheetData.slice(startRow).map(row => row[colIndex]).filter(val => val !== undefined && val !== '');
    
    const analysis = {
      total_values: columnValues.length,
      empty_cells: sheetData.length - startRow - columnValues.length,
      data_type: this.detectDataType(columnValues),
      unique_values: [...new Set(columnValues)].length,
      sample_values: columnValues.slice(0, 3)
    };
    
    // Add type-specific analysis
    if (analysis.data_type === 'number') {
      const numbers = columnValues.map(val => parseFloat(val)).filter(num => !isNaN(num));
      if (numbers.length > 0) {
        analysis.numeric_stats = {
          min: Math.min(...numbers),
          max: Math.max(...numbers),
          avg: numbers.reduce((sum, num) => sum + num, 0) / numbers.length
        };
      }
    }
    
    if (analysis.data_type === 'date') {
      const dates = columnValues.map(val => new Date(val)).filter(date => !isNaN(date));
      if (dates.length > 0) {
        analysis.date_range = {
          earliest: new Date(Math.min(...dates)).toISOString(),
          latest: new Date(Math.max(...dates)).toISOString()
        };
      }
    }
    
    return analysis;
  }

  /**
   * Detect if first row contains headers
   * @param {Array} firstRow - First row data
   * @param {Array} secondRow - Second row data
   * @returns {boolean} True if headers are detected
   */
  detectHeaders(firstRow, secondRow) {
    if (!firstRow || firstRow.length === 0) return false;
    if (!secondRow || secondRow.length === 0) return true; // Only one row, assume it's headers
    
    // Check if first row values are strings and second row has different types
    let headerIndicators = 0;
    
    for (let i = 0; i < Math.min(firstRow.length, secondRow.length); i++) {
      const first = firstRow[i];
      const second = secondRow[i];
      
      // If first is string and second is number, likely header
      if (typeof first === 'string' && !isNaN(parseFloat(second))) {
        headerIndicators++;
      }
      
      // If first looks like a column name (contains common header words)
      if (typeof first === 'string' && this.looksLikeHeader(first)) {
        headerIndicators++;
      }
    }
    
    // If more than 30% of columns look like headers, assume headers exist
    return headerIndicators / firstRow.length > 0.3;
  }

  /**
   * Check if string looks like a header
   * @param {string} str - String to check
   * @returns {boolean} True if looks like header
   */
  looksLikeHeader(str) {
    if (typeof str !== 'string') return false;
    
    const headerPatterns = [
      /^(id|name|title|date|time|count|total|amount|value|type|status|email|phone|address)$/i,
      /^[a-zA-Z_]+$/,  // Only letters and underscores
      /\s/  // Contains spaces (likely a descriptive name)
    ];
    
    return headerPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Detect data type of column values
   * @param {Array} values - Column values
   * @returns {string} Detected data type
   */
  detectDataType(values) {
    if (values.length === 0) return 'empty';
    
    let numbers = 0;
    let dates = 0;
    let booleans = 0;
    let strings = 0;
    
    for (const value of values) {
      if (value === null || value === undefined || value === '') continue;
      
      // Check for number
      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        numbers++;
        continue;
      }
      
      // Check for boolean
      if (typeof value === 'boolean' || /^(true|false|yes|no|y|n|1|0)$/i.test(String(value))) {
        booleans++;
        continue;
      }
      
      // Check for date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime()) && String(value).match(/\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}|\d{1,2}[-\/]\d{1,4}/)) {
        dates++;
        continue;
      }
      
      strings++;
    }
    
    const total = numbers + dates + booleans + strings;
    if (total === 0) return 'empty';
    
    // Return type with highest percentage (at least 70% to be confident)
    if (numbers / total >= 0.7) return 'number';
    if (dates / total >= 0.7) return 'date';
    if (booleans / total >= 0.7) return 'boolean';
    
    return 'text';
  }

  /**
   * Get column letters for Excel columns (A, B, C, ..., AA, AB, etc.)
   * @param {number} columnCount - Number of columns
   * @returns {Array} Array of column letters
   */
  getColumnLetters(columnCount) {
    const letters = [];
    for (let i = 0; i < columnCount; i++) {
      letters.push(XLSX.utils.encode_col(i));
    }
    return letters;
  }

  /**
   * Import data from Excel file and convert to standard format
   * @param {string|Buffer} filePath - Path to Excel file or Buffer
   * @param {Object} options - Import options
   * @returns {Object} Imported data and metadata
   */
  async importExcelData(filePath, options = {}) {
    try {
      const {
        sheetName = null,  // Import specific sheet, null for first sheet
        hasHeaders = true,
        skipRows = 0,
        maxRows = null
      } = options;
      
      let workbook;
      if (Buffer.isBuffer(filePath)) {
        workbook = XLSX.read(filePath, { type: 'buffer' });
      } else {
        workbook = XLSX.readFile(filePath);
      }
      
      const targetSheet = sheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[targetSheet];
      
      if (!worksheet) {
        throw new Error(`Sheet "${targetSheet}" not found`);
      }
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: hasHeaders ? 1 : undefined,
        range: skipRows > 0 ? skipRows : undefined,
        raw: false
      });
      
      // Limit rows if specified
      const data = maxRows ? jsonData.slice(0, maxRows) : jsonData;
      
      return {
        sheet_name: targetSheet,
        total_sheets: workbook.SheetNames.length,
        available_sheets: workbook.SheetNames,
        row_count: data.length,
        column_count: data.length > 0 ? Object.keys(data[0]).length : 0,
        has_headers: hasHeaders,
        data: data,
        imported_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to import Excel data:', error.message);
      throw new Error(`Excel import failed: ${error.message}`);
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