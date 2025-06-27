const { Op, Transaction } = require('sequelize');
const { User, Community, Member, VotingQuestion, Vote, sequelize } = require('../models');
const blockchainService = require('../services/blockchain');
const auditService = require('../services/audit');
const redis = require('../redis');
require('dotenv').config();

/**
 * State Reconciliation System
 * Handles conflict resolution and data repair mechanisms
 */
class StateReconciler {
  constructor() {
    this.reconciliationQueue = [];
    this.isReconciling = false;
    this.reconciliationStats = {
      totalReconciliations: 0,
      successfulReconciliations: 0,
      failedReconciliations: 0,
      conflictsResolved: 0,
      dataRepairs: 0
    };
    
    this.conflictResolvers = new Map();
    this.initializeConflictResolvers();
  }

  /**
   * Initialize conflict resolvers
   */
  initializeConflictResolvers() {
    this.conflictResolvers.set('community_conflict', this.resolveCommunityConflict.bind(this));
    this.conflictResolvers.set('membership_conflict', this.resolveMembershipConflict.bind(this));
    this.conflictResolvers.set('question_conflict', this.resolveQuestionConflict.bind(this));
    this.conflictResolvers.set('vote_conflict', this.resolveVoteConflict.bind(this));
    this.conflictResolvers.set('user_conflict', this.resolveUserConflict.bind(this));
  }

  /**
   * Detect and resolve conflicts
   */
  async detectAndResolveConflicts() {
    try {
      console.log('Starting conflict detection and resolution...');
      
      this.reconciliationStats.totalReconciliations++;
      
      // Detect conflicts in parallel
      const conflictPromises = [
        this.detectCommunityConflicts(),
        this.detectMembershipConflicts(),
        this.detectQuestionConflicts(),
        this.detectVoteConflicts(),
        this.detectUserConflicts()
      ];
      
      const conflictResults = await Promise.allSettled(conflictPromises);
      
      // Process all detected conflicts
      const allConflicts = conflictResults
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);
      
      console.log(`Detected ${allConflicts.length} conflicts`);
      
      // Resolve conflicts
      for (const conflict of allConflicts) {
        await this.resolveConflict(conflict);
      }
      
      this.reconciliationStats.successfulReconciliations++;
      
      console.log('Conflict detection and resolution completed');
      
      await auditService.logAuditEvent('conflict_reconciliation_completed', {
        level: 'INFO',
        category: 'RECONCILIATION',
        details: { 
          conflictsResolved: allConflicts.length,
          reconciliationStats: this.reconciliationStats 
        }
      });
      
    } catch (error) {
      console.error('Conflict detection and resolution failed:', error.message);
      
      this.reconciliationStats.failedReconciliations++;
      
      await auditService.logAuditEvent('conflict_reconciliation_failed', {
        level: 'ERROR',
        category: 'RECONCILIATION',
        details: { error: error.message }
      });
    }
  }

  /**
   * Detect community conflicts
   */
  async detectCommunityConflicts() {
    const conflicts = [];
    
    try {
      const contractManager = blockchainService.getContractManager();
      const communities = await Community.findAll({
        where: { status: 'active' }
      });
      
      for (const community of communities) {
        try {
          const blockchainData = await contractManager.getCommunityData(community.on_chain_id);
          
          if (!blockchainData) {
            conflicts.push({
              type: 'community_conflict',
              entityId: community.id,
              onChainId: community.on_chain_id,
              conflictType: 'missing_on_blockchain',
              backendData: community.toJSON(),
              blockchainData: null
            });
            continue;
          }
          
          // Check for data inconsistencies
          if (this.hasCommunityDataConflict(community, blockchainData)) {
            conflicts.push({
              type: 'community_conflict',
              entityId: community.id,
              onChainId: community.on_chain_id,
              conflictType: 'data_mismatch',
              backendData: community.toJSON(),
              blockchainData
            });
          }
          
        } catch (error) {
          console.error(`Failed to check community ${community.on_chain_id}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Failed to detect community conflicts:', error.message);
    }
    
    return conflicts;
  }

  /**
   * Detect membership conflicts
   */
  async detectMembershipConflicts() {
    const conflicts = [];
    
    try {
      const contractManager = blockchainService.getContractManager();
      const memberships = await Member.findAll({
        include: [
          { model: Community, as: 'Community' },
          { model: User, as: 'User' }
        ],
        where: { status: 'active' }
      });
      
      for (const membership of memberships) {
        try {
          const blockchainData = await contractManager.getMembershipData(
            membership.Community.on_chain_id,
            membership.User.wallet_address
          );
          
          if (!blockchainData) {
            conflicts.push({
              type: 'membership_conflict',
              entityId: membership.id,
              communityId: membership.Community.on_chain_id,
              userAddress: membership.User.wallet_address,
              conflictType: 'missing_on_blockchain',
              backendData: membership.toJSON(),
              blockchainData: null
            });
            continue;
          }
          
          // Check for data inconsistencies
          if (this.hasMembershipDataConflict(membership, blockchainData)) {
            conflicts.push({
              type: 'membership_conflict',
              entityId: membership.id,
              communityId: membership.Community.on_chain_id,
              userAddress: membership.User.wallet_address,
              conflictType: 'data_mismatch',
              backendData: membership.toJSON(),
              blockchainData
            });
          }
          
        } catch (error) {
          console.error(`Failed to check membership ${membership.id}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Failed to detect membership conflicts:', error.message);
    }
    
    return conflicts;
  }

  /**
   * Detect question conflicts
   */
  async detectQuestionConflicts() {
    const conflicts = [];
    
    try {
      const contractManager = blockchainService.getContractManager();
      const questions = await VotingQuestion.findAll({
        include: [{ model: Community, as: 'Community' }],
        where: { status: 'active' }
      });
      
      for (const question of questions) {
        try {
          const blockchainData = await contractManager.getQuestionData(question.on_chain_id);
          
          if (!blockchainData) {
            conflicts.push({
              type: 'question_conflict',
              entityId: question.id,
              onChainId: question.on_chain_id,
              conflictType: 'missing_on_blockchain',
              backendData: question.toJSON(),
              blockchainData: null
            });
            continue;
          }
          
          // Check for data inconsistencies
          if (this.hasQuestionDataConflict(question, blockchainData)) {
            conflicts.push({
              type: 'question_conflict',
              entityId: question.id,
              onChainId: question.on_chain_id,
              conflictType: 'data_mismatch',
              backendData: question.toJSON(),
              blockchainData
            });
          }
          
        } catch (error) {
          console.error(`Failed to check question ${question.on_chain_id}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Failed to detect question conflicts:', error.message);
    }
    
    return conflicts;
  }

  /**
   * Detect vote conflicts
   */
  async detectVoteConflicts() {
    const conflicts = [];
    
    try {
      const contractManager = blockchainService.getContractManager();
      const votes = await Vote.findAll({
        include: [
          { model: VotingQuestion, as: 'VotingQuestion' },
          { model: User, as: 'User' }
        ]
      });
      
      for (const vote of votes) {
        try {
          const blockchainData = await contractManager.getVoteData(
            vote.VotingQuestion.on_chain_id,
            vote.User.wallet_address
          );
          
          if (!blockchainData) {
            conflicts.push({
              type: 'vote_conflict',
              entityId: vote.id,
              questionId: vote.VotingQuestion.on_chain_id,
              userAddress: vote.User.wallet_address,
              conflictType: 'missing_on_blockchain',
              backendData: vote.toJSON(),
              blockchainData: null
            });
            continue;
          }
          
          // Check for data inconsistencies
          if (this.hasVoteDataConflict(vote, blockchainData)) {
            conflicts.push({
              type: 'vote_conflict',
              entityId: vote.id,
              questionId: vote.VotingQuestion.on_chain_id,
              userAddress: vote.User.wallet_address,
              conflictType: 'data_mismatch',
              backendData: vote.toJSON(),
              blockchainData
            });
          }
          
        } catch (error) {
          console.error(`Failed to check vote ${vote.id}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Failed to detect vote conflicts:', error.message);
    }
    
    return conflicts;
  }

  /**
   * Detect user conflicts
   */
  async detectUserConflicts() {
    const conflicts = [];
    
    try {
      const users = await User.findAll({
        where: { status: 'active' }
      });
      
      for (const user of users) {
        try {
          const solanaClient = blockchainService.getSolanaClient();
          const connection = solanaClient.getConnection('mainnet-beta');
          
          // Check if wallet exists on blockchain
          const accountInfo = await connection.getAccountInfo(user.wallet_address);
          
          if (!accountInfo) {
            conflicts.push({
              type: 'user_conflict',
              entityId: user.id,
              walletAddress: user.wallet_address,
              conflictType: 'missing_on_blockchain',
              backendData: user.toJSON(),
              blockchainData: null
            });
          }
          
        } catch (error) {
          console.error(`Failed to check user ${user.wallet_address}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Failed to detect user conflicts:', error.message);
    }
    
    return conflicts;
  }

  /**
   * Resolve a specific conflict
   */
  async resolveConflict(conflict) {
    try {
      const resolver = this.conflictResolvers.get(conflict.type);
      
      if (!resolver) {
        console.warn(`No resolver found for conflict type: ${conflict.type}`);
        return;
      }
      
      await resolver(conflict);
      this.reconciliationStats.conflictsResolved++;
      
      console.log(`Resolved conflict: ${conflict.type} for ${conflict.entityId}`);
      
    } catch (error) {
      console.error(`Failed to resolve conflict ${conflict.type}:`, error.message);
      throw error;
    }
  }

  /**
   * Resolve community conflict
   */
  async resolveCommunityConflict(conflict) {
    const transaction = await sequelize.transaction();
    
    try {
      const community = await Community.findByPk(conflict.entityId, { transaction });
      
      if (!community) {
        await transaction.rollback();
        return;
      }
      
      if (conflict.conflictType === 'missing_on_blockchain') {
        // Community doesn't exist on blockchain, mark as inactive
        await community.update({ status: 'inactive' }, { transaction });
        
        // Also mark related memberships as inactive
        await Member.update(
          { status: 'inactive' },
          { 
            where: { community_id: community.id },
            transaction 
          }
        );
        
      } else if (conflict.conflictType === 'data_mismatch') {
        // Update with blockchain data
        await community.update({
          name: conflict.blockchainData.name,
          description: conflict.blockchainData.description,
          config: JSON.stringify(conflict.blockchainData.config),
          updated_at: new Date()
        }, { transaction });
      }
      
      await transaction.commit();
      this.reconciliationStats.dataRepairs++;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Resolve membership conflict
   */
  async resolveMembershipConflict(conflict) {
    const transaction = await sequelize.transaction();
    
    try {
      const membership = await Member.findByPk(conflict.entityId, { transaction });
      
      if (!membership) {
        await transaction.rollback();
        return;
      }
      
      if (conflict.conflictType === 'missing_on_blockchain') {
        // Membership doesn't exist on blockchain, mark as inactive
        await membership.update({ status: 'inactive' }, { transaction });
        
      } else if (conflict.conflictType === 'data_mismatch') {
        // Update with blockchain data
        await membership.update({
          role: conflict.blockchainData.role,
          status: conflict.blockchainData.status,
          updated_at: new Date()
        }, { transaction });
      }
      
      await transaction.commit();
      this.reconciliationStats.dataRepairs++;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Resolve question conflict
   */
  async resolveQuestionConflict(conflict) {
    const transaction = await sequelize.transaction();
    
    try {
      const question = await VotingQuestion.findByPk(conflict.entityId, { transaction });
      
      if (!question) {
        await transaction.rollback();
        return;
      }
      
      if (conflict.conflictType === 'missing_on_blockchain') {
        // Question doesn't exist on blockchain, mark as inactive
        await question.update({ status: 'inactive' }, { transaction });
        
      } else if (conflict.conflictType === 'data_mismatch') {
        // Update with blockchain data
        await question.update({
          title: conflict.blockchainData.title,
          description: conflict.blockchainData.description,
          options: JSON.stringify(conflict.blockchainData.options),
          deadline: new Date(conflict.blockchainData.deadline),
          status: conflict.blockchainData.status,
          updated_at: new Date()
        }, { transaction });
      }
      
      await transaction.commit();
      this.reconciliationStats.dataRepairs++;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Resolve vote conflict
   */
  async resolveVoteConflict(conflict) {
    const transaction = await sequelize.transaction();
    
    try {
      const vote = await Vote.findByPk(conflict.entityId, { transaction });
      
      if (!vote) {
        await transaction.rollback();
        return;
      }
      
      if (conflict.conflictType === 'missing_on_blockchain') {
        // Vote doesn't exist on blockchain, mark as inactive
        await vote.update({ status: 'inactive' }, { transaction });
        
      } else if (conflict.conflictType === 'data_mismatch') {
        // Update with blockchain data
        await vote.update({
          vote_data: JSON.stringify(conflict.blockchainData.voteData),
          signature: conflict.blockchainData.signature,
          updated_at: new Date()
        }, { transaction });
      }
      
      await transaction.commit();
      this.reconciliationStats.dataRepairs++;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Resolve user conflict
   */
  async resolveUserConflict(conflict) {
    const transaction = await sequelize.transaction();
    
    try {
      const user = await User.findByPk(conflict.entityId, { transaction });
      
      if (!user) {
        await transaction.rollback();
        return;
      }
      
      if (conflict.conflictType === 'missing_on_blockchain') {
        // User doesn't exist on blockchain, mark as inactive
        await user.update({ status: 'inactive' }, { transaction });
      }
      
      await transaction.commit();
      this.reconciliationStats.dataRepairs++;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Check for community data conflicts
   */
  hasCommunityDataConflict(community, blockchainData) {
    return (
      community.name !== blockchainData.name ||
      community.description !== blockchainData.description ||
      JSON.stringify(JSON.parse(community.config)) !== JSON.stringify(blockchainData.config)
    );
  }

  /**
   * Check for membership data conflicts
   */
  hasMembershipDataConflict(membership, blockchainData) {
    return (
      membership.role !== blockchainData.role ||
      membership.status !== blockchainData.status
    );
  }

  /**
   * Check for question data conflicts
   */
  hasQuestionDataConflict(question, blockchainData) {
    return (
      question.title !== blockchainData.title ||
      question.description !== blockchainData.description ||
      JSON.stringify(JSON.parse(question.options)) !== JSON.stringify(blockchainData.options) ||
      new Date(question.deadline).getTime() !== new Date(blockchainData.deadline).getTime() ||
      question.status !== blockchainData.status
    );
  }

  /**
   * Check for vote data conflicts
   */
  hasVoteDataConflict(vote, blockchainData) {
    return (
      JSON.stringify(JSON.parse(vote.vote_data)) !== JSON.stringify(blockchainData.voteData) ||
      vote.signature !== blockchainData.signature
    );
  }

  /**
   * Get reconciliation statistics
   */
  getReconciliationStats() {
    return this.reconciliationStats;
  }

  /**
   * Force reconciliation
   */
  async forceReconciliation() {
    console.log('Forcing reconciliation...');
    await this.detectAndResolveConflicts();
  }

  /**
   * Get conflict summary
   */
  async getConflictSummary() {
    try {
      const conflicts = await Promise.all([
        this.detectCommunityConflicts(),
        this.detectMembershipConflicts(),
        this.detectQuestionConflicts(),
        this.detectVoteConflicts(),
        this.detectUserConflicts()
      ]);
      
      const summary = {
        total: conflicts.flat().length,
        byType: {
          community: conflicts[0].length,
          membership: conflicts[1].length,
          question: conflicts[2].length,
          vote: conflicts[3].length,
          user: conflicts[4].length
        },
        byConflictType: {
          missing_on_blockchain: conflicts.flat().filter(c => c.conflictType === 'missing_on_blockchain').length,
          data_mismatch: conflicts.flat().filter(c => c.conflictType === 'data_mismatch').length
        },
        timestamp: new Date()
      };
      
      return summary;
    } catch (error) {
      console.error('Failed to get conflict summary:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const stateReconciler = new StateReconciler();

module.exports = stateReconciler; 