const { cacheClient } = require('../client');

class UserCacheStrategy {
  constructor() {
    this.prefix = 'user';
    this.profileTTL = 3600; // 1 hour
    this.permissionsTTL = 1800; // 30 minutes
    this.sessionsTTL = 7200; // 2 hours
    this.preferencesTTL = 86400; // 24 hours
  }

  // User profile caching
  async getUserProfile(userId) {
    return await cacheClient.get(userId, {
      prefix: `${this.prefix}:profile`,
      ttl: this.profileTTL
    });
  }

  async setUserProfile(userId, profile) {
    return await cacheClient.set(userId, profile, {
      prefix: `${this.prefix}:profile`,
      ttl: this.profileTTL
    });
  }

  async invalidateUserProfile(userId) {
    return await cacheClient.delete(userId, {
      prefix: `${this.prefix}:profile`
    });
  }

  // User permissions caching
  async getUserPermissions(userId, communityId = null) {
    const key = communityId ? `${userId}:${communityId}` : userId;
    return await cacheClient.get(key, {
      prefix: `${this.prefix}:permissions`,
      ttl: this.permissionsTTL
    });
  }

  async setUserPermissions(userId, permissions, communityId = null) {
    const key = communityId ? `${userId}:${communityId}` : userId;
    return await cacheClient.set(key, permissions, {
      prefix: `${this.prefix}:permissions`,
      ttl: this.permissionsTTL
    });
  }

  async invalidateUserPermissions(userId, communityId = null) {
    if (communityId) {
      const key = `${userId}:${communityId}`;
      return await cacheClient.delete(key, {
        prefix: `${this.prefix}:permissions`
      });
    } else {
      // Invalidate all permissions for user across all communities
      return await cacheClient.invalidatePattern(`${userId}:*`, {
        prefix: `${this.prefix}:permissions`
      });
    }
  }

  // User sessions caching
  async getUserSessions(userId) {
    return await cacheClient.get(userId, {
      prefix: `${this.prefix}:sessions`,
      ttl: this.sessionsTTL
    });
  }

  async setUserSessions(userId, sessions) {
    return await cacheClient.set(userId, sessions, {
      prefix: `${this.prefix}:sessions`,
      ttl: this.sessionsTTL
    });
  }

  async invalidateUserSessions(userId) {
    return await cacheClient.delete(userId, {
      prefix: `${this.prefix}:sessions`
    });
  }

  // User preferences caching
  async getUserPreferences(userId) {
    return await cacheClient.get(userId, {
      prefix: `${this.prefix}:preferences`,
      ttl: this.preferencesTTL
    });
  }

  async setUserPreferences(userId, preferences) {
    return await cacheClient.set(userId, preferences, {
      prefix: `${this.prefix}:preferences`,
      ttl: this.preferencesTTL
    });
  }

  async invalidateUserPreferences(userId) {
    return await cacheClient.delete(userId, {
      prefix: `${this.prefix}:preferences`
    });
  }

  // User activity caching
  async getUserActivity(userId, timeframe = 'recent') {
    return await cacheClient.get(`${userId}:${timeframe}`, {
      prefix: `${this.prefix}:activity`,
      ttl: this.profileTTL
    });
  }

  async setUserActivity(userId, activity, timeframe = 'recent') {
    return await cacheClient.set(`${userId}:${timeframe}`, activity, {
      prefix: `${this.prefix}:activity`,
      ttl: this.profileTTL
    });
  }

  async invalidateUserActivity(userId) {
    return await cacheClient.invalidatePattern(`${userId}:*`, {
      prefix: `${this.prefix}:activity`
    });
  }

  // User community memberships caching
  async getUserMemberships(userId) {
    return await cacheClient.get(userId, {
      prefix: `${this.prefix}:memberships`,
      ttl: this.profileTTL
    });
  }

  async setUserMemberships(userId, memberships) {
    return await cacheClient.set(userId, memberships, {
      prefix: `${this.prefix}:memberships`,
      ttl: this.profileTTL
    });
  }

  async invalidateUserMemberships(userId) {
    return await cacheClient.delete(userId, {
      prefix: `${this.prefix}:memberships`
    });
  }

  // User wallet address mapping
  async getWalletUserMapping(walletAddress) {
    return await cacheClient.get(walletAddress, {
      prefix: `${this.prefix}:wallet`,
      ttl: this.profileTTL
    });
  }

  async setWalletUserMapping(walletAddress, userId) {
    return await cacheClient.set(walletAddress, userId, {
      prefix: `${this.prefix}:wallet`,
      ttl: this.profileTTL
    });
  }

  async invalidateWalletUserMapping(walletAddress) {
    return await cacheClient.delete(walletAddress, {
      prefix: `${this.prefix}:wallet`
    });
  }

  // User search results caching
  async getUserSearchResults(query, filters = {}) {
    const searchKey = this.generateSearchKey(query, filters);
    return await cacheClient.get(searchKey, {
      prefix: `${this.prefix}:search`,
      ttl: this.profileTTL
    });
  }

  async setUserSearchResults(query, results, filters = {}) {
    const searchKey = this.generateSearchKey(query, filters);
    return await cacheClient.set(searchKey, results, {
      prefix: `${this.prefix}:search`,
      ttl: this.profileTTL
    });
  }

  async invalidateUserSearchResults() {
    return await cacheClient.invalidatePrefix(`${this.prefix}:search`);
  }

  // Bulk invalidation
  async invalidateAllUserData(userId) {
    const promises = [
      this.invalidateUserProfile(userId),
      this.invalidateUserPermissions(userId),
      this.invalidateUserSessions(userId),
      this.invalidateUserPreferences(userId),
      this.invalidateUserActivity(userId),
      this.invalidateUserMemberships(userId)
    ];

    await Promise.all(promises);
    return true;
  }

  // Cache warming for users
  async warmUserCache(users) {
    const warmData = users.map(user => ({
      key: user.id,
      value: user,
      options: {
        prefix: `${this.prefix}:profile`,
        ttl: this.profileTTL
      }
    }));

    return await cacheClient.warmCache(warmData);
  }

  // Utility methods
  generateSearchKey(query, filters) {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join(':');
    
    return `${query}:${filterString}`;
  }

  // Cache statistics for users
  async getCacheStats() {
    const stats = cacheClient.getStats();
    return {
      ...stats,
      strategy: 'user',
      prefixes: [
        `${this.prefix}:profile`,
        `${this.prefix}:permissions`,
        `${this.prefix}:sessions`,
        `${this.prefix}:preferences`,
        `${this.prefix}:activity`,
        `${this.prefix}:memberships`,
        `${this.prefix}:wallet`,
        `${this.prefix}:search`
      ]
    };
  }
}

module.exports = UserCacheStrategy; 