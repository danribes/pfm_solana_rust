const { Transaction, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');
const { Program, AnchorProvider, web3, BN } = require('@project-serum/anchor');
const solanaClient = require('./solana');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Smart Contract Integration
 * Handles contract instruction calls, transaction building, and state queries
 */
class ContractManager {
  constructor() {
    this.programs = new Map();
    this.programIds = {
      voting: process.env.VOTING_PROGRAM_ID || '11111111111111111111111111111111'
    };
    
    this.initializePrograms();
  }

  /**
   * Initialize Anchor programs
   */
  async initializePrograms() {
    try {
      console.log('Initializing Anchor programs...');
      
      const connection = solanaClient.getConnection();
      const wallet = this.createProviderWallet();
      
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
      );
      
      // Load voting program
      const votingProgramId = new PublicKey(this.programIds.voting);
      const votingProgram = new Program(this.getVotingIDL(), votingProgramId, provider);
      
      this.programs.set('voting', votingProgram);
      
      console.log('Anchor programs initialized successfully');
    } catch (error) {
      console.error('Failed to initialize programs:', error.message);
      throw error;
    }
  }

  /**
   * Get voting program IDL
   */
  getVotingIDL() {
    try {
      const idlPath = path.join(__dirname, '../../contracts/voting/target/idl/voting.json');
      const idlContent = fs.readFileSync(idlPath, 'utf8');
      return JSON.parse(idlContent);
    } catch (error) {
      console.error('Failed to load voting IDL:', error.message);
      // Return a basic IDL structure for development
      return {
        version: '0.1.0',
        name: 'voting',
        instructions: [],
        accounts: [],
        types: []
      };
    }
  }

  /**
   * Create provider wallet
   */
  createProviderWallet() {
    const privateKey = process.env.PROVIDER_PRIVATE_KEY;
    
    if (!privateKey) {
      // Use a dummy wallet for development
      return {
        publicKey: new PublicKey('11111111111111111111111111111111'),
        signTransaction: () => Promise.resolve(),
        signAllTransactions: () => Promise.resolve([])
      };
    }
    
    return solanaClient.createWallet(privateKey);
  }

  /**
   * Get program instance
   */
  getProgram(programName) {
    const program = this.programs.get(programName);
    
    if (!program) {
      throw new Error(`Program not found: ${programName}`);
    }
    
    return program;
  }

  /**
   * Create community
   */
  async createCommunity(adminWallet, communityData) {
    try {
      const program = this.getProgram('voting');
      const connection = solanaClient.getConnection();
      
      // Generate community account
      const communityAccount = web3.Keypair.generate();
      
      // Build instruction
      const instruction = await program.methods
        .createCommunity(
          communityData.name,
          communityData.description,
          new BN(communityData.memberLimit),
          communityData.requiresApproval
        )
        .accounts({
          community: communityAccount.publicKey,
          admin: adminWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([communityAccount])
        .instruction();
      
      // Build transaction
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = adminWallet.publicKey;
      
      // Sign transaction
      transaction.sign(communityAccount, adminWallet);
      
      // Send transaction
      const signature = await connection.sendTransaction(transaction);
      
      return {
        signature,
        communityAccount: communityAccount.publicKey.toString(),
        success: true
      };
    } catch (error) {
      console.error('Failed to create community:', error.message);
      throw error;
    }
  }

  /**
   * Join community
   */
  async joinCommunity(userWallet, communityAddress) {
    try {
      const program = this.getProgram('voting');
      const connection = solanaClient.getConnection();
      
      // Generate membership account
      const membershipAccount = web3.Keypair.generate();
      
      // Build instruction
      const instruction = await program.methods
        .joinCommunity()
        .accounts({
          community: new PublicKey(communityAddress),
          membership: membershipAccount.publicKey,
          member: userWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([membershipAccount])
        .instruction();
      
      // Build transaction
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userWallet.publicKey;
      
      // Sign transaction
      transaction.sign(membershipAccount, userWallet);
      
      // Send transaction
      const signature = await connection.sendTransaction(transaction);
      
      return {
        signature,
        membershipAccount: membershipAccount.publicKey.toString(),
        success: true
      };
    } catch (error) {
      console.error('Failed to join community:', error.message);
      throw error;
    }
  }

  /**
   * Create voting question
   */
  async createVotingQuestion(adminWallet, communityAddress, questionData) {
    try {
      const program = this.getProgram('voting');
      const connection = solanaClient.getConnection();
      
      // Generate question account
      const questionAccount = web3.Keypair.generate();
      
      // Build instruction
      const instruction = await program.methods
        .createVotingQuestion(
          questionData.title,
          questionData.description,
          questionData.options,
          new BN(questionData.deadline),
          questionData.allowMultipleChoices
        )
        .accounts({
          community: new PublicKey(communityAddress),
          question: questionAccount.publicKey,
          admin: adminWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([questionAccount])
        .instruction();
      
      // Build transaction
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = adminWallet.publicKey;
      
      // Sign transaction
      transaction.sign(questionAccount, adminWallet);
      
      // Send transaction
      const signature = await connection.sendTransaction(transaction);
      
      return {
        signature,
        questionAccount: questionAccount.publicKey.toString(),
        success: true
      };
    } catch (error) {
      console.error('Failed to create voting question:', error.message);
      throw error;
    }
  }

  /**
   * Cast vote
   */
  async castVote(userWallet, questionAddress, voteData) {
    try {
      const program = this.getProgram('voting');
      const connection = solanaClient.getConnection();
      
      // Generate vote account
      const voteAccount = web3.Keypair.generate();
      
      // Build instruction
      const instruction = await program.methods
        .castVote(
          voteData.selectedOptions,
          voteData.anonymous
        )
        .accounts({
          question: new PublicKey(questionAddress),
          vote: voteAccount.publicKey,
          voter: userWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([voteAccount])
        .instruction();
      
      // Build transaction
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userWallet.publicKey;
      
      // Sign transaction
      transaction.sign(voteAccount, userWallet);
      
      // Send transaction
      const signature = await connection.sendTransaction(transaction);
      
      return {
        signature,
        voteAccount: voteAccount.publicKey.toString(),
        success: true
      };
    } catch (error) {
      console.error('Failed to cast vote:', error.message);
      throw error;
    }
  }

  /**
   * Get community data
   */
  async getCommunityData(communityAddress) {
    try {
      const program = this.getProgram('voting');
      const communityPubkey = new PublicKey(communityAddress);
      
      const communityData = await program.account.community.fetch(communityPubkey);
      
      return {
        address: communityAddress,
        name: communityData.name,
        description: communityData.description,
        memberLimit: communityData.memberLimit.toNumber(),
        requiresApproval: communityData.requiresApproval,
        admin: communityData.admin.toString(),
        memberCount: communityData.memberCount.toNumber(),
        createdAt: communityData.createdAt.toNumber()
      };
    } catch (error) {
      console.error('Failed to get community data:', error.message);
      throw error;
    }
  }

  /**
   * Get question data
   */
  async getQuestionData(questionAddress) {
    try {
      const program = this.getProgram('voting');
      const questionPubkey = new PublicKey(questionAddress);
      
      const questionData = await program.account.votingQuestion.fetch(questionPubkey);
      
      return {
        address: questionAddress,
        title: questionData.title,
        description: questionData.description,
        options: questionData.options,
        deadline: questionData.deadline.toNumber(),
        allowMultipleChoices: questionData.allowMultipleChoices,
        totalVotes: questionData.totalVotes.toNumber(),
        createdAt: questionData.createdAt.toNumber()
      };
    } catch (error) {
      console.error('Failed to get question data:', error.message);
      throw error;
    }
  }

  /**
   * Get vote data
   */
  async getVoteData(voteAddress) {
    try {
      const program = this.getProgram('voting');
      const votePubkey = new PublicKey(voteAddress);
      
      const voteData = await program.account.vote.fetch(votePubkey);
      
      return {
        address: voteAddress,
        selectedOptions: voteData.selectedOptions,
        anonymous: voteData.anonymous,
        voter: voteData.voter.toString(),
        createdAt: voteData.createdAt.toNumber()
      };
    } catch (error) {
      console.error('Failed to get vote data:', error.message);
      throw error;
    }
  }

  /**
   * Get all communities
   */
  async getAllCommunities() {
    try {
      const program = this.getProgram('voting');
      const connection = solanaClient.getConnection();
      
      const communityAccounts = await connection.getProgramAccounts(
        new PublicKey(this.programIds.voting),
        {
          filters: [
            {
              dataSize: 200 // Adjust based on actual community account size
            }
          ]
        }
      );
      
      const communities = [];
      
      for (const account of communityAccounts) {
        try {
          const communityData = await program.account.community.fetch(account.pubkey);
          communities.push({
            address: account.pubkey.toString(),
            name: communityData.name,
            description: communityData.description,
            memberLimit: communityData.memberLimit.toNumber(),
            requiresApproval: communityData.requiresApproval,
            admin: communityData.admin.toString(),
            memberCount: communityData.memberCount.toNumber(),
            createdAt: communityData.createdAt.toNumber()
          });
        } catch (error) {
          console.warn(`Failed to parse community account ${account.pubkey}:`, error.message);
        }
      }
      
      return communities;
    } catch (error) {
      console.error('Failed to get all communities:', error.message);
      throw error;
    }
  }

  /**
   * Get community questions
   */
  async getCommunityQuestions(communityAddress) {
    try {
      const program = this.getProgram('voting');
      const connection = solanaClient.getConnection();
      
      const questionAccounts = await connection.getProgramAccounts(
        new PublicKey(this.programIds.voting),
        {
          filters: [
            {
              dataSize: 300 // Adjust based on actual question account size
            }
          ]
        }
      );
      
      const questions = [];
      
      for (const account of questionAccounts) {
        try {
          const questionData = await program.account.votingQuestion.fetch(account.pubkey);
          
          // Check if question belongs to the community
          if (questionData.community.toString() === communityAddress) {
            questions.push({
              address: account.pubkey.toString(),
              title: questionData.title,
              description: questionData.description,
              options: questionData.options,
              deadline: questionData.deadline.toNumber(),
              allowMultipleChoices: questionData.allowMultipleChoices,
              totalVotes: questionData.totalVotes.toNumber(),
              createdAt: questionData.createdAt.toNumber()
            });
          }
        } catch (error) {
          console.warn(`Failed to parse question account ${account.pubkey}:`, error.message);
        }
      }
      
      return questions;
    } catch (error) {
      console.error('Failed to get community questions:', error.message);
      throw error;
    }
  }

  /**
   * Estimate transaction fees
   */
  async estimateTransactionFee(transaction) {
    try {
      const connection = solanaClient.getConnection();
      const { feeCalculator } = await connection.getRecentBlockhash();
      
      return feeCalculator.lamportsPerSignature;
    } catch (error) {
      console.error('Failed to estimate transaction fee:', error.message);
      throw error;
    }
  }

  /**
   * Get program account size
   */
  async getAccountSize(accountAddress) {
    try {
      const connection = solanaClient.getConnection();
      const accountInfo = await connection.getAccountInfo(new PublicKey(accountAddress));
      
      return accountInfo ? accountInfo.data.length : 0;
    } catch (error) {
      console.error('Failed to get account size:', error.message);
      throw error;
    }
  }
}

// Create singleton instance
const contractManager = new ContractManager();

module.exports = contractManager; 