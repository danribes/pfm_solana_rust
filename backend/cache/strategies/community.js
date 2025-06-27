const { cacheClient } = require('../client');

class CommunityCacheStrategy {
  constructor() {
    this.prefix = 'community';
    this.defaultTTL = 1800; // 30 minutes
    this.configTTL = 3600; // 1 hour
    this.metadataTTL = 7200; // 2 hours
  }

  // Community metadata caching
  async getCommunityMetadata(communityId) {
    return await cacheClient.get(communityId, {
      prefix: `${this.prefix}:metadata`,
      ttl: this.metadataTTL
    });
  }

  async setCommunityMetadata(communityId, metadata) {
    return await cacheClient.set(communityId, metadata, {
      prefix: `${this.prefix}:metadata`,
      ttl: this.metadataTTL
    });
  }

  async invalidateCommunityMetadata(communityId) {
    return await cacheClient.delete(communityId, {
      prefix: `${this.prefix}:metadata`
    });
  }

  // Community configuration caching
  async getCommunityConfig(communityId) {
    return await cacheClient.get(communityId, {
      prefix: `${this.prefix}:config`,
      ttl: this.configTTL
    });
  }

  async setCommunityConfig(communityId, config) {
    return await cacheClient.set(communityId, config, {
      prefix: `${this.prefix}:config`,
      ttl: this.configTTL
    });
  }

  async invalidateCommunityConfig(communityId) {
    return await cacheClient.delete(communityId, {
      prefix: `${this.prefix}:config`
    });
  }

  // Community list caching
  async getCommunityList(filters = {}) {
    const filterKey = this.generateFilterKey(filters);
    return await cacheClient.get(filterKey, {
      prefix: `${this.prefix}:list`,
      ttl: this.defaultTTL
    });
  }

  async setCommunityList(communities, filters = {}) {
    const filterKey = this.generateFilterKey(filters);
    return await cacheClient.set(filterKey, communities, {
      prefix: `${this.prefix}:list`,
      ttl: this.defaultTTL
    });
  }

  async invalidateCommunityList() {
    return await cacheClient.invalidatePrefix(`${this.prefix}:list`);
  }

  // Community member count caching
  async getMemberCount(communityId) {
    return await cacheClient.get(communityId, {
      prefix: `${this.prefix}:members:count`,
      ttl: this.defaultTTL
    });
  }

  async setMemberCount(communityId, count) {
    return await cacheClient.set(communityId, count, {
      prefix: `${this.prefix}:members:count`,
      ttl: this.defaultTTL
    });
  }

  async incrementMemberCount(communityId, increment = 1) {
    // For atomic increments, we'd need to implement this in the cache client
    // For now, we'll invalidate the cache
    return await this.invalidateMemberCount(communityId);
  }

  async invalidateMemberCount(communityId) {
    return await cacheClient.delete(communityId, {
      prefix: `${this.prefix}:members:count`
    });
  }

  // Community activity caching
  async getCommunityActivity(communityId, timeframe = 'recent') {
    return await cacheClient.get(`${communityId}:${timeframe}`, {
      prefix: `${this.prefix}:activity`,
      ttl: this.defaultTTL
    });
  }

  async setCommunityActivity(communityId, activity, timeframe = 'recent') {
    return await cacheClient.set(`${communityId}:${timeframe}`, activity, {
      prefix: `${this.prefix}:activity`,
      ttl: this.defaultTTL
    });
  }

  async invalidateCommunityActivity(communityId) {
    return await cacheClient.invalidatePattern('*', {
      prefix: `${this.prefix}:activity`
    });
  }

  // Bulk invalidation
  async invalidateAllCommunityData(communityId) {
    const promises = [
      this.invalidateCommunityMetadata(communityId),
      this.invalidateCommunityConfig(communityId),
      this.invalidateMemberCount(communityId),
      this.invalidateCommunityActivity(communityId)
    ];

    await Promise.all(promises);
    return true;
  }

  // Cache warming for communities
  async warmCommunityCache(communities) {
    const warmData = communities.map(community => ({
      key: community.id,
      value: community,
      options: {
        prefix: `${this.prefix}:metadata`,
        ttl: this.metadataTTL
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

  // Cache statistics for communities
  async getCacheStats() {
    const stats = cacheClient.getStats();
    return {
      ...stats,
      strategy: 'community',
      prefixes: [
        `${this.prefix}:metadata`,
        `${this.prefix}:config`,
        `${this.prefix}:list`,
        `${this.prefix}:members:count`,
        `${this.prefix}:activity`
      ]
    };
  }
}

module.exports = CommunityCacheStrategy; 