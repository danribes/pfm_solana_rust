/**
 * Batch Processing for Analytics
 * Handles scheduled data aggregation, historical data processing, and data transformation
 */

const cron = require('node-cron');
const { User, Community, Member, VotingQuestion, Vote, Analytics } = require('../models');
const { Op } = require('sequelize');
const redis = require('../redis');

class BatchAnalytics {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
    this.processingStats = {
      jobsCompleted: 0,
      totalProcessingTime: 0,
      errors: 0,
      lastRun: null
    };
  }

  /**
   * Initialize batch processing jobs
   */
  async initialize() {
    try {
      // Daily analytics aggregation (runs at 2 AM daily)
      this.scheduleJob('daily-analytics', '0 2 * * *', () => {
        this.processDailyAnalytics();
      });

      // Weekly analytics aggregation (runs every Sunday at 3 AM)
      this.scheduleJob('weekly-analytics', '0 3 * * 0', () => {
        this.processWeeklyAnalytics();
      });

      // Monthly analytics aggregation (runs on 1st of month at 4 AM)
      this.scheduleJob('monthly-analytics', '0 4 1 * *', () => {
        this.processMonthlyAnalytics();
      });

      // Data cleanup job (runs daily at 1 AM)
      this.scheduleJob('data-cleanup', '0 1 * * *', () => {
        this.cleanupOldData();
      });

      console.log('Batch analytics jobs initialized successfully');
    } catch (error) {
      console.error('Failed to initialize batch analytics:', error);
      throw error;
    }
  }

  /**
   * Schedule a job
   */
  scheduleJob(name, schedule, task) {
    const job = cron.schedule(schedule, async () => {
      try {
        console.log(`Starting batch job: ${name}`);
        const startTime = Date.now();
        
        await task();
        
        const processingTime = Date.now() - startTime;
        this.processingStats.jobsCompleted++;
        this.processingStats.totalProcessingTime += processingTime;
        this.processingStats.lastRun = new Date().toISOString();
        
        console.log(`Completed batch job: ${name} in ${processingTime}ms`);
      } catch (error) {
        this.processingStats.errors++;
        console.error(`Batch job ${name} failed:`, error);
      }
    });

    this.jobs.set(name, job);
  }

  /**
   * Process daily analytics
   */
  async processDailyAnalytics() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

      // Aggregate user activity
      const userActivity = await this.aggregateUserActivity(startOfDay, endOfDay);
      
      // Aggregate community activity
      const communityActivity = await this.aggregateCommunityActivity(startOfDay, endOfDay);
      
      // Aggregate voting activity
      const votingActivity = await this.aggregateVotingActivity(startOfDay, endOfDay);

      // Store aggregated data
      await this.storeAggregatedData('daily', {
        date: startOfDay.toISOString().split('T')[0],
        userActivity,
        communityActivity,
        votingActivity
      });

      console.log('Daily analytics processed successfully');
    } catch (error) {
      throw new Error(`Daily analytics processing failed: ${error.message}`);
    }
  }

  /**
   * Process weekly analytics
   */
  async processWeeklyAnalytics() {
    try {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const startOfWeek = new Date(lastWeek.setHours(0, 0, 0, 0));
      const endOfWeek = new Date(lastWeek.setHours(23, 59, 59, 999));

      // Aggregate weekly metrics
      const weeklyMetrics = await this.aggregateWeeklyMetrics(startOfWeek, endOfWeek);
      
      // Store aggregated data
      await this.storeAggregatedData('weekly', {
        week: startOfWeek.toISOString().split('T')[0],
        metrics: weeklyMetrics
      });

      console.log('Weekly analytics processed successfully');
    } catch (error) {
      throw new Error(`Weekly analytics processing failed: ${error.message}`);
    }
  }

  /**
   * Process monthly analytics
   */
  async processMonthlyAnalytics() {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);

      // Aggregate monthly metrics
      const monthlyMetrics = await this.aggregateMonthlyMetrics(startOfMonth, endOfMonth);
      
      // Store aggregated data
      await this.storeAggregatedData('monthly', {
        month: startOfMonth.toISOString().split('T')[0].substring(0, 7),
        metrics: monthlyMetrics
      });

      console.log('Monthly analytics processed successfully');
    } catch (error) {
      throw new Error(`Monthly analytics processing failed: ${error.message}`);
    }
  }

  /**
   * Aggregate user activity
   */
  async aggregateUserActivity(startDate, endDate) {
    const userStats = await User.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_users'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "created_at" >= ? AND "created_at" <= ? THEN 1 END')), 'new_users'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "is_active" = true THEN 1 END')), 'active_users']
      ],
      where: {
        created_at: {
          [Op.lte]: endDate
        }
      },
      replacements: [startDate, endDate]
    });

    return userStats[0]?.dataValues || {};
  }

  /**
   * Aggregate community activity
   */
  async aggregateCommunityActivity(startDate, endDate) {
    const communityStats = await Community.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_communities'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "created_at" >= ? AND "created_at" <= ? THEN 1 END')), 'new_communities'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "is_active" = true THEN 1 END')), 'active_communities']
      ],
      where: {
        created_at: {
          [Op.lte]: endDate
        }
      },
      replacements: [startDate, endDate]
    });

    return communityStats[0]?.dataValues || {};
  }

  /**
   * Aggregate voting activity
   */
  async aggregateVotingActivity(startDate, endDate) {
    const votingStats = await Vote.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_votes'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN "voted_at" >= ? AND "voted_at" <= ? THEN 1 END')), 'new_votes']
      ],
      where: {
        voted_at: {
          [Op.lte]: endDate
        }
      },
      replacements: [startDate, endDate]
    });

    return votingStats[0]?.dataValues || {};
  }

  /**
   * Aggregate weekly metrics
   */
  async aggregateWeeklyMetrics(startDate, endDate) {
    // Get daily breakdown for the week
    const dailyMetrics = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const userActivity = await this.aggregateUserActivity(dayStart, dayEnd);
      const communityActivity = await this.aggregateCommunityActivity(dayStart, dayEnd);
      const votingActivity = await this.aggregateVotingActivity(dayStart, dayEnd);

      dailyMetrics.push({
        date: dayStart.toISOString().split('T')[0],
        userActivity,
        communityActivity,
        votingActivity
      });
    }

    return dailyMetrics;
  }

  /**
   * Aggregate monthly metrics
   */
  async aggregateMonthlyMetrics(startDate, endDate) {
    // Get weekly breakdown for the month
    const weeklyMetrics = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weeklyData = await this.aggregateWeeklyMetrics(weekStart, weekEnd);
      weeklyMetrics.push({
        week: weekStart.toISOString().split('T')[0],
        metrics: weeklyData
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeklyMetrics;
  }

  /**
   * Store aggregated data
   */
  async storeAggregatedData(period, data) {
    try {
      // Store in Redis for quick access
      if (redis.getRedisClient()) {
        const key = `analytics:aggregated:${period}:${data.date || data.week || data.month}`;
        await redis.getRedisClient().setex(key, 2592000, JSON.stringify(data)); // 30 days TTL
      }

      // Store in database for long-term storage
      await Analytics.create({
        period_type: period,
        period_value: data.date || data.week || data.month,
        data: JSON.stringify(data),
        created_at: new Date()
      });

      console.log(`Aggregated data stored for ${period} period`);
    } catch (error) {
      throw new Error(`Failed to store aggregated data: ${error.message}`);
    }
  }

  /**
   * Cleanup old data
   */
  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean up old analytics records
      const deletedCount = await Analytics.destroy({
        where: {
          created_at: {
            [Op.lt]: thirtyDaysAgo
          }
        }
      });

      console.log(`Cleaned up ${deletedCount} old analytics records`);
    } catch (error) {
      console.error('Data cleanup failed:', error);
    }
  }

  /**
   * Get processing statistics
   */
  getProcessingStats() {
    return {
      ...this.processingStats,
      activeJobs: this.jobs.size,
      averageProcessingTime: this.processingStats.jobsCompleted > 0 
        ? this.processingStats.totalProcessingTime / this.processingStats.jobsCompleted 
        : 0
    };
  }

  /**
   * Stop all jobs
   */
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Start a specific job manually
   */
  async runJobManually(jobName) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }

    try {
      console.log(`Running job manually: ${jobName}`);
      await job.fireOnTick();
    } catch (error) {
      throw new Error(`Manual job execution failed: ${error.message}`);
    }
  }
}

// Create singleton instance
const batchAnalytics = new BatchAnalytics();

module.exports = batchAnalytics; 