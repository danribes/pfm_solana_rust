const { Op } = require('sequelize');
const { User, Community, Member, VotingQuestion, Vote } = require('../models');
const blockchainService = require('../services/blockchain');
const auditService = require('../services/audit');
const redis = require('../redis');
require('dotenv').config();

/**
 * State Synchronization System
 * Handles periodic state verification and data consistency checks
 */
class StateSynchronizer {
  constructor() {
    this.syncInterval = parseInt(process.env.SYNC_INTERVAL || '300000', 10); // 5 minutes
    this.isRunning = false;
    this.lastSyncTime = null;
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastError: null
    };
    
    this.syncHandlers = new Map();
    this.initializeSyncHandlers();
  }

  /**
   * Initialize synchronization handlers
   */
  initializeSyncHandlers() {
    this.syncHandlers.set('communities', this.syncCommunities.bind(this));
    this.syncHandlers.set('memberships', this.syncMemberships.bind(this));
    this.syncHandlers.set('questions', this.syncQuestions.bind(this));
    this.syncHandlers.set('votes', this.syncVotes.bind(this));
    this.syncHandlers.set('users', this.syncUsers.bind(this));
  }

  /**
   * Start periodic synchronization
   */
  async startPeriodicSync() {
    if (this.isRunning) {
      console.log('State synchronization already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting periodic state synchronization...');
    
    // Run initial sync
    await this.performFullSync();
    
    // Set up periodic sync
    this.syncInterval = setInterval(async () => {
      await this.performFullSync();
    }, this.syncInterval);
    
    await auditService.logAuditEvent('state_sync_started', {
      level: 'INFO',
      category: 'SYNC',
      details: { syncInterval: this.syncInterval }
    });
  }

  /**
   * Stop periodic synchronization
   */
  async stopPeriodicSync() {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    console.log('Periodic state synchronization stopped');
    
    await auditService.logAuditEvent('state_sync_stopped', {
      level: 'INFO',
      category: 'SYNC',
      details: { syncStats: this.syncStats }
    });
  }

  /**
   * Perform full synchronization
   */
  async performFullSync() {
    try {
      console.log('Starting full state synchronization...');
      
      this.syncStats.totalSyncs++;
      this.lastSyncTime = new Date();
      
      // Sync all data types
      const syncPromises = Array.from(this.syncHandlers.values()).map(handler => handler());
      await Promise.allSettled(syncPromises);
      
      this.syncStats.successfulSyncs++;
      
      console.log('Full state synchronization completed successfully');
      
      await auditService.logAuditEvent('state_sync_completed', {
        level: 'INFO',
        category: 'SYNC',
        details: { syncStats: this.syncStats }
      });
      
    } catch (error) {
      console.error('Full state synchronization failed:', error.message);
      
      this.syncStats.failedSyncs++;
      this.syncStats.lastError = error.message;
      
      await auditService.logAuditEvent('state_sync_failed', {
        level: 'ERROR',
        category: 'SYNC',
        details: { error: error.message, syncStats: this.syncStats }
      });
    }
  }

  /**
   * Synchronize communities
   */
  async syncCommunities() {
    try {
      console.log('Synchronizing communities...');
      
      const contractManager = blockchainService.getContractManager();
      const backendCommunities = await Community.findAll({
        where: { status: 'active' }
      });
      
      for (const community of backendCommunities) {
        try {
          // Get blockchain state
          const blockchainData = await contractManager.getCommunityData(community.on_chain_id);
          
          if (!blockchainData) {
            // Community doesn't exist on blockchain, mark as inactive
            await community.update({ status: 'inactive' });
            console.log(`Community ${community.on_chain_id} marked as inactive`);
            continue;
          }
          
          // Compare and update if different
          const needsUpdate = this.compareCommunityData(community, blockchainData);
          
          if (needsUpdate) {
            await community.update({
              name: blockchainData.name,
              description: blockchainData.description,
              config: JSON.stringify(blockchainData.config),
              updated_at: new Date()
            });
            
            console.log(`Community ${community.on_chain_id} updated from blockchain`);
          }
          
        } catch (error) {
          console.error(`Failed to sync community ${community.on_chain_id}:`, error.message);
        }
      }
      
      console.log('Community synchronization completed');
      
    } catch (error) {
      console.error('Community synchronization failed:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize memberships
   */
  async syncMemberships() {
    try {
      console.log('Synchronizing memberships...');
      
      const contractManager = blockchainService.getContractManager();
      const backendMemberships = await Member.findAll({
        include: [
          { model: Community, as: 'Community' },
          { model: User, as: 'User' }
        ],
        where: { status: 'active' }
      });
      
      for (const membership of backendMemberships) {
        try {
          // Get blockchain membership data
          const blockchainData = await contractManager.getMembershipData(
            membership.Community.on_chain_id,
            membership.User.wallet_address
          );
          
          if (!blockchainData) {
            // Membership doesn't exist on blockchain, mark as inactive
            await membership.update({ status: 'inactive' });
            console.log(`Membership ${membership.id} marked as inactive`);
            continue;
          }
          
          // Compare and update if different
          const needsUpdate = this.compareMembershipData(membership, blockchainData);
          
          if (needsUpdate) {
            await membership.update({
              role: blockchainData.role,
              status: blockchainData.status,
              updated_at: new Date()
            });
            
            console.log(`Membership ${membership.id} updated from blockchain`);
          }
          
        } catch (error) {
          console.error(`Failed to sync membership ${membership.id}:`, error.message);
        }
      }
      
      console.log('Membership synchronization completed');
      
    } catch (error) {
      console.error('Membership synchronization failed:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize voting questions
   */
  async syncQuestions() {
    try {
      console.log('Synchronizing voting questions...');
      
      const contractManager = blockchainService.getContractManager();
      const backendQuestions = await VotingQuestion.findAll({
        include: [{ model: Community, as: 'Community' }],
        where: { status: 'active' }
      });
      
      for (const question of backendQuestions) {
        try {
          // Get blockchain question data
          const blockchainData = await contractManager.getQuestionData(question.on_chain_id);
          
          if (!blockchainData) {
            // Question doesn't exist on blockchain, mark as inactive
            await question.update({ status: 'inactive' });
            console.log(`Question ${question.on_chain_id} marked as inactive`);
            continue;
          }
          
          // Compare and update if different
          const needsUpdate = this.compareQuestionData(question, blockchainData);
          
          if (needsUpdate) {
            await question.update({
              title: blockchainData.title,
              description: blockchainData.description,
              options: JSON.stringify(blockchainData.options),
              deadline: new Date(blockchainData.deadline),
              status: blockchainData.status,
              updated_at: new Date()
            });
            
            console.log(`Question ${question.on_chain_id} updated from blockchain`);
          }
          
        } catch (error) {
          console.error(`Failed to sync question ${question.on_chain_id}:`, error.message);
        }
      }
      
      console.log('Question synchronization completed');
      
    } catch (error) {
      console.error('Question synchronization failed:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize votes
   */
  async syncVotes() {
    try {
      console.log('Synchronizing votes...');
      
      const contractManager = blockchainService.getContractManager();
      const backendVotes = await Vote.findAll({
        include: [
          { model: VotingQuestion, as: 'VotingQuestion' },
          { model: User, as: 'User' }
        ]
      });
      
      for (const vote of backendVotes) {
        try {
          // Get blockchain vote data
          const blockchainData = await contractManager.getVoteData(
            vote.VotingQuestion.on_chain_id,
            vote.User.wallet_address
          );
          
          if (!blockchainData) {
            // Vote doesn't exist on blockchain, mark as inactive
            await vote.update({ status: 'inactive' });
            console.log(`Vote ${vote.id} marked as inactive`);
            continue;
          }
          
          // Compare and update if different
          const needsUpdate = this.compareVoteData(vote, blockchainData);
          
          if (needsUpdate) {
            await vote.update({
              vote_data: JSON.stringify(blockchainData.voteData),
              signature: blockchainData.signature,
              updated_at: new Date()
            });
            
            console.log(`Vote ${vote.id} updated from blockchain`);
          }
          
        } catch (error) {
          console.error(`Failed to sync vote ${vote.id}:`, error.message);
        }
      }
      
      console.log('Vote synchronization completed');
      
    } catch (error) {
      console.error('Vote synchronization failed:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize users
   */
  async syncUsers() {
    try {
      console.log('Synchronizing users...');
      
      const backendUsers = await User.findAll({
        where: { status: 'active' }
      });
      
      for (const user of backendUsers) {
        try {
          // Check if wallet is still valid on blockchain
          const solanaClient = blockchainService.getSolanaClient();
          const connection = solanaClient.getConnection('mainnet-beta');
          
          // Get account info to verify wallet exists
          const accountInfo = await connection.getAccountInfo(user.wallet_address);
          
          if (!accountInfo) {
            // Wallet doesn't exist on blockchain, mark as inactive
            await user.update({ status: 'inactive' });
            console.log(`User ${user.wallet_address} marked as inactive`);
          }
          
        } catch (error) {
          console.error(`Failed to sync user ${user.wallet_address}:`, error.message);
        }
      }
      
      console.log('User synchronization completed');
      
    } catch (error) {
      console.error('User synchronization failed:', error.message);
      throw error;
    }
  }

  /**
   * Compare community data
   */
  compareCommunityData(backendCommunity, blockchainData) {
    return (
      backendCommunity.name !== blockchainData.name ||
      backendCommunity.description !== blockchainData.description ||
      JSON.stringify(JSON.parse(backendCommunity.config)) !== JSON.stringify(blockchainData.config)
    );
  }

  /**
   * Compare membership data
   */
  compareMembershipData(backendMembership, blockchainData) {
    return (
      backendMembership.role !== blockchainData.role ||
      backendMembership.status !== blockchainData.status
    );
  }

  /**
   * Compare question data
   */
  compareQuestionData(backendQuestion, blockchainData) {
    return (
      backendQuestion.title !== blockchainData.title ||
      backendQuestion.description !== blockchainData.description ||
      JSON.stringify(JSON.parse(backendQuestion.options)) !== JSON.stringify(blockchainData.options) ||
      new Date(backendQuestion.deadline).getTime() !== new Date(blockchainData.deadline).getTime() ||
      backendQuestion.status !== blockchainData.status
    );
  }

  /**
   * Compare vote data
   */
  compareVoteData(backendVote, blockchainData) {
    return (
      JSON.stringify(JSON.parse(backendVote.vote_data)) !== JSON.stringify(blockchainData.voteData) ||
      backendVote.signature !== blockchainData.signature
    );
  }

  /**
   * Get synchronization status
   */
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      syncStats: this.syncStats,
      syncInterval: this.syncInterval
    };
  }

  /**
   * Force immediate synchronization
   */
  async forceSync() {
    console.log('Forcing immediate synchronization...');
    await this.performFullSync();
  }

  /**
   * Get data consistency report
   */
  async getConsistencyReport() {
    try {
      const report = {
        communities: await this.getCommunityConsistency(),
        memberships: await this.getMembershipConsistency(),
        questions: await this.getQuestionConsistency(),
        votes: await this.getVoteConsistency(),
        timestamp: new Date()
      };
      
      return report;
    } catch (error) {
      console.error('Failed to generate consistency report:', error.message);
      throw error;
    }
  }

  /**
   * Get community consistency data
   */
  async getCommunityConsistency() {
    const totalCommunities = await Community.count({ where: { status: 'active' } });
    const syncedCommunities = await Community.count({
      where: {
        status: 'active',
        updated_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    return {
      total: totalCommunities,
      synced: syncedCommunities,
      consistency: totalCommunities > 0 ? (syncedCommunities / totalCommunities) * 100 : 100
    };
  }

  /**
   * Get membership consistency data
   */
  async getMembershipConsistency() {
    const totalMemberships = await Member.count({ where: { status: 'active' } });
    const syncedMemberships = await Member.count({
      where: {
        status: 'active',
        updated_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    return {
      total: totalMemberships,
      synced: syncedMemberships,
      consistency: totalMemberships > 0 ? (syncedMemberships / totalMemberships) * 100 : 100
    };
  }

  /**
   * Get question consistency data
   */
  async getQuestionConsistency() {
    const totalQuestions = await VotingQuestion.count({ where: { status: 'active' } });
    const syncedQuestions = await VotingQuestion.count({
      where: {
        status: 'active',
        updated_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    return {
      total: totalQuestions,
      synced: syncedQuestions,
      consistency: totalQuestions > 0 ? (syncedQuestions / totalQuestions) * 100 : 100
    };
  }

  /**
   * Get vote consistency data
   */
  async getVoteConsistency() {
    const totalVotes = await Vote.count();
    const syncedVotes = await Vote.count({
      where: {
        updated_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    return {
      total: totalVotes,
      synced: syncedVotes,
      consistency: totalVotes > 0 ? (syncedVotes / totalVotes) * 100 : 100
    };
  }
}

// Create singleton instance
const stateSynchronizer = new StateSynchronizer();

module.exports = stateSynchronizer; 