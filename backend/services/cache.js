const { cacheClient } = require('../cache/client');
const CommunityCacheStrategy = require('../cache/strategies/community');
const UserCacheStrategy = require('../cache/strategies/user');
const VotingCacheStrategy = require('../cache/strategies/voting');
const { cacheAnalytics } = require('../cache/analytics');

class CacheService {
  constructor() {
    this.communityCache = new CommunityCacheStrategy();
    this.userCache = new UserCacheStrategy();
    this.votingCache = new VotingCacheStrategy();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      const connected = await cacheClient.connect();
      if (connected) {
        this.isInitialized = true;
        console.log('Cache service initialized successfully');
        return true;
      } else {
        console.error('Failed to initialize cache service');
        return false;
      }
    } catch (error) {
      console.error('Cache service initialization error:', error);
      return false;
    }
  }

  async shutdown() {
    try {
      await cacheClient.disconnect();
      this.isInitialized = false;
      console.log('Cache service shutdown completed');
    } catch (error) {
      console.error('Cache service shutdown error:', error);
    }
  }

  // Generic cache operations
  async get(key, options = {}) {
    const startTime = Date.now();
    try {
      const result = await cacheClient.get(key, options);
      cacheAnalytics.trackRequest(result ? 'hit' : 'miss', startTime, true);
      return result;
    } catch (error) {
      cacheAnalytics.trackRequest('error', startTime, false, error);
      throw error;
    }
  }

  async set(key, value, options = {}) {
    const startTime = Date.now();
    try {
      const result = await cacheClient.set(key, value, options);
      cacheAnalytics.trackRequest('set', startTime, true);
      return result;
    } catch (error) {
      cacheAnalytics.trackRequest('error', startTime, false, error);
      throw error;
    }
  }

  async delete(key, options = {}) {
    const startTime = Date.now();
    try {
      const result = await cacheClient.delete(key, options);
      cacheAnalytics.trackRequest('delete', startTime, true);
      return result;
    } catch (error) {
      cacheAnalytics.trackRequest('error', startTime, false, error);
      throw error;
    }
  }

  async exists(key, options = {}) {
    const startTime = Date.now();
    try {
      const result = await cacheClient.exists(key, options);
      cacheAnalytics.trackRequest('exists', startTime, true);
      return result;
    } catch (error) {
      cacheAnalytics.trackRequest('error', startTime, false, error);
      throw error;
    }
  }

  // Community cache operations
  async getCommunityMetadata(communityId) {
    return await this.communityCache.getCommunityMetadata(communityId);
  }

  async setCommunityMetadata(communityId, metadata) {
    return await this.communityCache.setCommunityMetadata(communityId, metadata);
  }

  async getCommunityConfig(communityId) {
    return await this.communityCache.getCommunityConfig(communityId);
  }

  async setCommunityConfig(communityId, config) {
    return await this.communityCache.setCommunityConfig(communityId, config);
  }

  async getCommunityList(filters = {}) {
    return await this.communityCache.getCommunityList(filters);
  }

  async setCommunityList(communities, filters = {}) {
    return await this.communityCache.setCommunityList(communities, filters);
  }

  async invalidateCommunityData(communityId) {
    return await this.communityCache.invalidateAllCommunityData(communityId);
  }

  // User cache operations
  async getUserProfile(userId) {
    return await this.userCache.getUserProfile(userId);
  }

  async setUserProfile(userId, profile) {
    return await this.userCache.setUserProfile(userId, profile);
  }

  async getUserPermissions(userId, communityId = null) {
    return await this.userCache.getUserPermissions(userId, communityId);
  }

  async setUserPermissions(userId, permissions, communityId = null) {
    return await this.userCache.setUserPermissions(userId, permissions, communityId);
  }

  async getUserSessions(userId) {
    return await this.userCache.getUserSessions(userId);
  }

  async setUserSessions(userId, sessions) {
    return await this.userCache.setUserSessions(userId, sessions);
  }

  async invalidateUserData(userId) {
    return await this.userCache.invalidateAllUserData(userId);
  }

  // Voting cache operations
  async getVotingQuestion(questionId) {
    return await this.votingCache.getVotingQuestion(questionId);
  }

  async setVotingQuestion(questionId, question) {
    return await this.votingCache.setVotingQuestion(questionId, question);
  }

  async getVotingResults(questionId) {
    return await this.votingCache.getVotingResults(questionId);
  }

  async setVotingResults(questionId, results) {
    return await this.votingCache.setVotingResults(questionId, results);
  }

  async getVoteCount(questionId, optionId = null) {
    return await this.votingCache.getVoteCount(questionId, optionId);
  }

  async setVoteCount(questionId, count, optionId = null) {
    return await this.votingCache.setVoteCount(questionId, count, optionId);
  }

  async invalidateVotingData(questionId) {
    return await this.votingCache.invalidateAllVotingData(questionId);
  }

  // Cache warming operations
  async warmCommunityCache(communities) {
    return await this.communityCache.warmCommunityCache(communities);
  }

  async warmUserCache(users) {
    return await this.userCache.warmUserCache(users);
  }

  async warmVotingCache(questions) {
    return await this.votingCache.warmVotingCache(questions);
  }

  // Cache management operations
  async invalidateAll() {
    return await cacheClient.invalidateAll();
  }

  async invalidatePattern(pattern, options = {}) {
    return await cacheClient.invalidatePattern(pattern, options);
  }

  async invalidatePrefix(prefix) {
    return await cacheClient.invalidatePrefix(prefix);
  }

  // Health and monitoring operations
  async getHealthStatus() {
    return await cacheAnalytics.getHealthStatus();
  }

  async getPerformanceReport() {
    return await cacheAnalytics.getPerformanceReport();
  }

  getStats() {
    return {
      cache: cacheClient.getStats(),
      analytics: cacheAnalytics.getMetrics(),
      isInitialized: this.isInitialized
    };
  }

  async ping() {
    return await cacheClient.ping();
  }

  // Cache configuration
  setPerformanceThresholds(thresholds) {
    cacheAnalytics.setPerformanceThresholds(thresholds);
  }

  setMonitoringEnabled(enabled) {
    cacheAnalytics.setMonitoringEnabled(enabled);
  }

  // Utility methods
  isConnected() {
    return cacheClient.isConnected;
  }

  isHealthy() {
    return cacheAnalytics.isHealthy();
  }

  // Cache key generation utilities
  generateKey(prefix, identifier, version = null) {
    return cacheClient.generateKey(prefix, identifier, version);
  }

  // Cache statistics by strategy
  async getStrategyStats() {
    const [communityStats, userStats, votingStats] = await Promise.all([
      this.communityCache.getCacheStats(),
      this.userCache.getCacheStats(),
      this.votingCache.getCacheStats()
    ]);

    return {
      community: communityStats,
      user: userStats,
      voting: votingStats,
      overall: cacheClient.getStats()
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = {
  CacheService,
  cacheService
}; 