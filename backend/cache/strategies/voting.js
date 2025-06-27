const { cacheClient } = require('../client');

class VotingCacheStrategy {
  constructor() {
    this.prefix = 'voting';
    this.resultsTTL = 300; // 5 minutes for real-time results
    this.analyticsTTL = 3600; // 1 hour for analytics
    this.questionsTTL = 1800; // 30 minutes for questions
    this.votesTTL = 600; // 10 minutes for vote counts
  }

  // Voting question caching
  async getVotingQuestion(questionId) {
    return await cacheClient.get(questionId, {
      prefix: `${this.prefix}:question`,
      ttl: this.questionsTTL
    });
  }

  async setVotingQuestion(questionId, question) {
    return await cacheClient.set(questionId, question, {
      prefix: `${this.prefix}:question`,
      ttl: this.questionsTTL
    });
  }

  async invalidateVotingQuestion(questionId) {
    return await cacheClient.delete(questionId, {
      prefix: `${this.prefix}:question`
    });
  }

  // Community questions list caching
  async getCommunityQuestions(communityId, filters = {}) {
    const filterKey = this.generateFilterKey(filters);
    return await cacheClient.get(`${communityId}:${filterKey}`, {
      prefix: `${this.prefix}:questions:list`,
      ttl: this.questionsTTL
    });
  }

  async setCommunityQuestions(communityId, questions, filters = {}) {
    const filterKey = this.generateFilterKey(filters);
    return await cacheClient.set(`${communityId}:${filterKey}`, questions, {
      prefix: `${this.prefix}:questions:list`,
      ttl: this.questionsTTL
    });
  }

  async invalidateCommunityQuestions(communityId) {
    return await cacheClient.invalidatePattern(`${communityId}:*`, {
      prefix: `${this.prefix}:questions:list`
    });
  }

  // Voting results caching
  async getVotingResults(questionId) {
    return await cacheClient.get(questionId, {
      prefix: `${this.prefix}:results`,
      ttl: this.resultsTTL
    });
  }

  async setVotingResults(questionId, results) {
    return await cacheClient.set(questionId, results, {
      prefix: `${this.prefix}:results`,
      ttl: this.resultsTTL
    });
  }

  async invalidateVotingResults(questionId) {
    return await cacheClient.delete(questionId, {
      prefix: `${this.prefix}:results`
    });
  }

  // Vote counts caching
  async getVoteCount(questionId, optionId = null) {
    const key = optionId ? `${questionId}:${optionId}` : questionId;
    return await cacheClient.get(key, {
      prefix: `${this.prefix}:count`,
      ttl: this.votesTTL
    });
  }

  async setVoteCount(questionId, count, optionId = null) {
    const key = optionId ? `${questionId}:${optionId}` : questionId;
    return await cacheClient.set(key, count, {
      prefix: `${this.prefix}:count`,
      ttl: this.votesTTL
    });
  }

  async incrementVoteCount(questionId, optionId = null, increment = 1) {
    // For atomic increments, we'd need to implement this in the cache client
    // For now, we'll invalidate the cache
    const key = optionId ? `${questionId}:${optionId}` : questionId;
    return await cacheClient.delete(key, {
      prefix: `${this.prefix}:count`
    });
  }

  async invalidateVoteCount(questionId, optionId = null) {
    const key = optionId ? `${questionId}:${optionId}` : questionId;
    return await cacheClient.delete(key, {
      prefix: `${this.prefix}:count`
    });
  }

  // User vote caching
  async getUserVote(userId, questionId) {
    return await cacheClient.get(`${userId}:${questionId}`, {
      prefix: `${this.prefix}:user:vote`,
      ttl: this.votesTTL
    });
  }

  async setUserVote(userId, questionId, vote) {
    return await cacheClient.set(`${userId}:${questionId}`, vote, {
      prefix: `${this.prefix}:user:vote`,
      ttl: this.votesTTL
    });
  }

  async invalidateUserVote(userId, questionId) {
    return await cacheClient.delete(`${userId}:${questionId}`, {
      prefix: `${this.prefix}:user:vote`
    });
  }

  // Voting analytics caching
  async getVotingAnalytics(communityId, timeframe = 'recent') {
    return await cacheClient.get(`${communityId}:${timeframe}`, {
      prefix: `${this.prefix}:analytics`,
      ttl: this.analyticsTTL
    });
  }

  async setVotingAnalytics(communityId, analytics, timeframe = 'recent') {
    return await cacheClient.set(`${communityId}:${timeframe}`, analytics, {
      prefix: `${this.prefix}:analytics`,
      ttl: this.analyticsTTL
    });
  }

  async invalidateVotingAnalytics(communityId) {
    return await cacheClient.invalidatePattern(`${communityId}:*`, {
      prefix: `${this.prefix}:analytics`
    });
  }

  // Participation rates caching
  async getParticipationRate(questionId) {
    return await cacheClient.get(questionId, {
      prefix: `${this.prefix}:participation`,
      ttl: this.resultsTTL
    });
  }

  async setParticipationRate(questionId, rate) {
    return await cacheClient.set(questionId, rate, {
      prefix: `${this.prefix}:participation`,
      ttl: this.resultsTTL
    });
  }

  async invalidateParticipationRate(questionId) {
    return await cacheClient.delete(questionId, {
      prefix: `${this.prefix}:participation`
    });
  }

  // Trending questions caching
  async getTrendingQuestions(communityId, limit = 10) {
    return await cacheClient.get(`${communityId}:${limit}`, {
      prefix: `${this.prefix}:trending`,
      ttl: this.questionsTTL
    });
  }

  async setTrendingQuestions(communityId, questions, limit = 10) {
    return await cacheClient.set(`${communityId}:${limit}`, questions, {
      prefix: `${this.prefix}:trending`,
      ttl: this.questionsTTL
    });
  }

  async invalidateTrendingQuestions(communityId) {
    return await cacheClient.invalidatePattern(`${communityId}:*`, {
      prefix: `${this.prefix}:trending`
    });
  }

  // Real-time updates caching
  async getRealTimeUpdates(questionId) {
    return await cacheClient.get(questionId, {
      prefix: `${this.prefix}:realtime`,
      ttl: this.resultsTTL
    });
  }

  async setRealTimeUpdates(questionId, updates) {
    return await cacheClient.set(questionId, updates, {
      prefix: `${this.prefix}:realtime`,
      ttl: this.resultsTTL
    });
  }

  async invalidateRealTimeUpdates(questionId) {
    return await cacheClient.delete(questionId, {
      prefix: `${this.prefix}:realtime`
    });
  }

  // Bulk invalidation
  async invalidateAllVotingData(questionId) {
    const promises = [
      this.invalidateVotingQuestion(questionId),
      this.invalidateVotingResults(questionId),
      this.invalidateVoteCount(questionId),
      this.invalidateParticipationRate(questionId),
      this.invalidateRealTimeUpdates(questionId)
    ];

    await Promise.all(promises);
    return true;
  }

  async invalidateAllCommunityVotingData(communityId) {
    const promises = [
      this.invalidateCommunityQuestions(communityId),
      this.invalidateVotingAnalytics(communityId),
      this.invalidateTrendingQuestions(communityId)
    ];

    await Promise.all(promises);
    return true;
  }

  // Cache warming for voting
  async warmVotingCache(questions) {
    const warmData = questions.map(question => ({
      key: question.id,
      value: question,
      options: {
        prefix: `${this.prefix}:question`,
        ttl: this.questionsTTL
      }
    }));

    return await cacheClient.warmCache(warmData);
  }

  // Utility methods
  generateFilterKey(filters) {
    const sortedFilters = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join(':');
    
    return sortedFilters || 'default';
  }

  // Cache statistics for voting
  async getCacheStats() {
    const stats = cacheClient.getStats();
    return {
      ...stats,
      strategy: 'voting',
      prefixes: [
        `${this.prefix}:question`,
        `${this.prefix}:questions:list`,
        `${this.prefix}:results`,
        `${this.prefix}:count`,
        `${this.prefix}:user:vote`,
        `${this.prefix}:analytics`,
        `${this.prefix}:participation`,
        `${this.prefix}:trending`,
        `${this.prefix}:realtime`
      ]
    };
  }
}

module.exports = VotingCacheStrategy; 